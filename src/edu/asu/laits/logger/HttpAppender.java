/**
 * LAITS Project Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
 */

package edu.asu.laits.logger;

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
    protected void append(LoggingEvent paramLoggingEvent) {

        if (!(this.getLayout() instanceof HttpLayout)) {
            errorHandler.error("you must use a HttpLayout type");
            return;
        }

        HttpUriRequest httpMethod = null;
        DefaultHttpClient httpClient = new DefaultHttpClient();

        HttpParams params = httpClient.getParams();
        HttpConnectionParams.setConnectionTimeout(params, timeOut);
        HttpConnectionParams.setSoTimeout(params, timeOut);

        String message = this.getLayout().format(paramLoggingEvent);
        
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
}
