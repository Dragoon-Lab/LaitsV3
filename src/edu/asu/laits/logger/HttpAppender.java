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
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.URLEncoder;
import java.sql.Timestamp;
import org.apache.log4j.Logger;

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

    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    
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
        logURL = ApplicationContext.getRootURL() + "/logger.php";

        try {
            if (this.HttpMethodBase.equalsIgnoreCase(METHOD_GET)) {
                StringBuffer sb = new StringBuffer(this.logURL);
                sb.append(message);
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

    public static String saveGetSession(String action, String address, String id, String section, String problem, String data, String share) throws Exception {
        //open connection
        logs.debug("Opening Connection with URL: "+address);
        URL url = new URL(address);
        HttpURLConnection connect = (HttpURLConnection) url.openConnection();

        //sets POST and adds POST data type as URLENCODED
        connect.setRequestMethod("POST");
        connect.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        //sets mode as output and disables cache
        connect.setUseCaches(false);
        connect.setDoInput(true);
        connect.setDoOutput(true);

        //add variables to send
        List<NameValuePair> postVariable = new ArrayList<NameValuePair>();
        
        postVariable.add(new BasicNameValuePair("action", action));
        postVariable.add(new BasicNameValuePair("id", id));
        postVariable.add(new BasicNameValuePair("section", section));
        postVariable.add(new BasicNameValuePair("problem", problem));
        logs.debug("Post Variables sending: "+postVariable);
        
        if (action.equals("save") || action.equals("author_save")) {
            postVariable.add(new BasicNameValuePair("saveData", data));
        }
        if (action.equals("author_save")) {
            postVariable.add(new BasicNameValuePair("share", share));
        }

        //sends request
        OutputStream stream = new DataOutputStream(connect.getOutputStream());
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stream, "UTF-8"));
        writer.write(getQuery(postVariable));
        writer.close();
        stream.flush();
        stream.close();

        // If action = 'save' or 'author_save', gets and returns response code. 200 is ok.       
        if (action.equals("save") || action.equals("author_save")) {
            int response = connect.getResponseCode();
            connect.disconnect();
            return Integer.toString(response);
        } // If action = 'load' or 'author_load', returns string with loaded problem.
        else if (action.equals("load") || action.equals("author_load")) {
            StringBuilder returnString = new StringBuilder();
            BufferedReader in = new BufferedReader(new InputStreamReader(
                    connect.getInputStream()));
            String line = "";
            while ((line = in.readLine()) != null) {
                returnString.append(line);
                returnString.append("\n");
            }
            in.close();
            connect.disconnect();
            //logs.debug("Server Returned: "+returnString.toString());
            return returnString.toString();
        }
        connect.disconnect();
        return null;
    }

    private static String getQuery(List<NameValuePair> params) throws UnsupportedEncodingException {
        StringBuilder result = new StringBuilder();
        boolean first = true;

        for (NameValuePair pair : params) {
            if (first) {
                first = false;
            } else {
                result.append("&");
            }

            result.append(pair.getName());
            result.append("=");
            result.append(pair.getValue());
        }

        return result.toString();
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
