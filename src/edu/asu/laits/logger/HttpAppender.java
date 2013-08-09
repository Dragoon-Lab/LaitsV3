/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.ß
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */
package edu.asu.laits.logger;

import edu.asu.laits.editor.ApplicationContext;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.log4j.AppenderSkeleton;
import org.apache.log4j.spi.LoggingEvent;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;

public class HttpAppender extends AppenderSkeleton {

    private final static int DEFAULT_TIMEOUT = 0;
    private final static String METHOD_GET = "GET";
    private final static String METHOD_POST = "POST";
    private final static String DEFAULT_METHOD = METHOD_GET;
    private final static String POST_PARAMETERS = "PARAMETERS";
    private final static String POST_QUERY_STRING = "QUERY_STRING";
    private final static String POST_DEFAULT = POST_PARAMETERS;
    private final static boolean THREAD_DEFAULT = true;
    private int timeOut = DEFAULT_TIMEOUT;
    private String logURL = null;
    private String HttpMethodBase = DEFAULT_METHOD;
    private String postMethod = POST_DEFAULT;
    private boolean thread = THREAD_DEFAULT;

    public void close() {
    }

    public boolean requiresLayout() {
        return true;
    }

    @Override
    public void append(LoggingEvent paramLoggingEvent) {

        if (!(this.getLayout() instanceof HttpLayout)) {
            errorHandler.error("you must use a HttpLayout type");
            return;
        }

        if (ApplicationContext.getApplicationEnvironment()
                .equals(ApplicationContext.ApplicationEnvironment.DEV)) {

            System.out.println(prepareDevLogMessage(paramLoggingEvent));
            return;
        }

        HttpUriRequest httpMethod = null;
        DefaultHttpClient httpClient = new DefaultHttpClient();

        HttpParams params = httpClient.getParams();
        HttpConnectionParams.setConnectionTimeout(params, timeOut);
        HttpConnectionParams.setSoTimeout(params, timeOut);
        String message = this.getLayout().format(paramLoggingEvent);
        logURL = ApplicationContext.getRootURL()+"/logger.php";
        
        try {
            if (this.HttpMethodBase.equalsIgnoreCase(METHOD_GET)) {
                StringBuffer sb = new StringBuffer(this.logURL);
                sb.append(message);
                System.out.println("test : "+sb.toString());
                httpMethod = new HttpGet(sb.toString());
            } else {
                if (this.postMethod.equalsIgnoreCase(POST_PARAMETERS)) {
                    httpMethod = new HttpPost(this.logURL);
                    message = message.substring(1);

                    List<NameValuePair> nvps = new ArrayList<NameValuePair>();

                    for (String attributes : message.split("&")) {
                        String[] attribute = attributes.split("=");
                        nvps.add(new BasicNameValuePair(attribute[0], attribute[1]));
                    }

                    HttpPost post = (HttpPost) httpMethod;
                    post.setEntity(new UrlEncodedFormEntity(nvps));
                } else {
                    StringBuffer sb = new StringBuffer(this.logURL);
                    sb.append(message);
                    httpMethod = new HttpPost(sb.toString());
                }
            }

            HttpThread httpThread = new HttpThread(httpClient, errorHandler);
            httpThread.setMethod(httpMethod);

            if (thread) {
                Thread t = new Thread(httpThread);
                t.start();
            } else {
                httpThread.run();
            }
        } catch (UnsupportedEncodingException ex) {
        }
    }

    //in process
    public static String sendHttpRequest(String address) throws Exception {
        URL url = new URL(address);
        HttpURLConnection connect = (HttpURLConnection) url.openConnection();        
        StringBuffer sb = new StringBuffer();
        BufferedReader in = new BufferedReader(new InputStreamReader(
                connect.getInputStream()));        
        String line = "";        
        while((line = in.readLine()) != null){
            sb.append(line);
            sb.append("\n");
        }
        in.close();
        connect.disconnect();
        return sb.toString();
    }
    
    public static int sendSession(String address, String id, String section, String problem, String data) throws Exception {
        //open connection
        URL url = new URL(address);
        HttpURLConnection connect = (HttpURLConnection) url.openConnection();       
        
        //sets POST and adds POST data type as URLENCODED
        connect.setRequestMethod("POST");
        connect.setRequestProperty("Content-Type","application/x-www-form-urlencoded");
        
        //sets mode as output and disables cache
        connect.setUseCaches (false);
        connect.setDoInput(true);
        connect.setDoOutput(true);
        
        //builds variable to send
        StringBuilder sb = new StringBuilder();
        sb.append("id=");
        sb.append(id);
        sb.append("&section=");
        sb.append(section);
        sb.append("&problem=");
        sb.append(problem);
        sb.append("&saveData=");
        sb.append(data);        
        
        //sends request
        DataOutputStream wr = new DataOutputStream (connect.getOutputStream ());
        wr.writeBytes (sb.toString());
        wr.flush ();
        wr.close ();
        
        // Gets and returns response code. 200 is ok.       
        int response = connect.getResponseCode();
        connect.disconnect();
        return response;       
    }

    /*
     * Getter
     */
    public void setPost(String method) {
        this.postMethod = method;
    }

    public void setMethod(String method) {
        this.HttpMethodBase = method;
    }

    public void setLogURL(String logURL) {
        this.logURL = logURL;
    }

    public void setThread(boolean b) {
        this.thread = b;
    }

    public void setTimeout(int to) {
        this.timeOut = to;
    }

    private String prepareDevLogMessage(LoggingEvent paramLoggingEvent) {
        StringBuilder sb = new StringBuilder();
        Timestamp time = new Timestamp(paramLoggingEvent.getTimeStamp());

        sb.append(time.toString() + "  ");
        sb.append(paramLoggingEvent.getLoggerName() + "  ");
        sb.append(paramLoggingEvent.getLevel().toString() + "  ");

        String info = paramLoggingEvent.getLocationInformation().getFileName() + "-"
                + paramLoggingEvent.getLocationInformation().getMethodName() + ":"
                + paramLoggingEvent.getLocationInformation().getLineNumber();

        sb.append(info + "  ");
        sb.append(paramLoggingEvent.getMessage().toString() + "  ");


        return sb.toString();
    }
}
