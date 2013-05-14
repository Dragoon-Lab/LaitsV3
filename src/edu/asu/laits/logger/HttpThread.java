/**
 * LAITS Project
 * Arizona State University
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
