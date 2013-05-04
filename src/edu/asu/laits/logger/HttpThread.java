/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.logger;

import java.io.IOException;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.DefaultHttpClient;

import org.apache.log4j.spi.ErrorHandler;



public class HttpThread implements Runnable {

        private DefaultHttpClient httpClient = null;
        private HttpUriRequest httpMethod = null;
        private ErrorHandler errorHandler = null;

        public HttpThread(DefaultHttpClient httpClient, ErrorHandler errorHandler) {
                this.httpClient = httpClient;
                this.errorHandler = errorHandler;
        }

        public void setMethod(HttpUriRequest httpMethod) {
                this.httpMethod = httpMethod;
        }

        public void run() {
                int statusCode = 0;
                try {           
                        HttpResponse response = httpClient.execute(httpMethod);
                        statusCode = response.getStatusLine().getStatusCode();
                        if (statusCode != HttpStatus.SC_OK) {
                                errorHandler.error("Error Server URL " + httpMethod.getURI() + " return status code " + statusCode);                         
                        }
                }  catch (IOException e) {
                        errorHandler.error( "Io error in sending request to server: URL: " + httpMethod.getURI() + " returned: " + statusCode);
                } finally {
                        httpMethod.abort();
                }
        }
}
