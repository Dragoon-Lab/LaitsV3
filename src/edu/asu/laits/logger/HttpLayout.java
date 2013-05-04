/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.logger;

import edu.asu.laits.editor.ApplicationContext;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.Timestamp;

import org.apache.log4j.Layout;
import org.apache.log4j.helpers.LogLog;
import org.apache.log4j.spi.LoggingEvent;


public class HttpLayout extends Layout {

        public String conversionPattern = "";
        public void setConversionPattern(String conversionPattern) {
                this.conversionPattern = conversionPattern;
        }

        public String encoding = "UTF-8";
        public void setEncoding(String encoding) {
                this.encoding = encoding.trim();
        }

        public boolean urlEncode = true;
        public void setUrlEncode(boolean urlEncode) {
                this.urlEncode = urlEncode;
        }

        public void activateOptions() { }

        @Override
        public String format(LoggingEvent paramLoggingEvent) {
                String returnMessage = new String(conversionPattern);
                
                returnMessage = formatMessage(returnMessage, "userid", ApplicationContext.getUserID());
                Timestamp time = new Timestamp(paramLoggingEvent.getTimeStamp());
                
                returnMessage = formatMessage(returnMessage, "datetime", time.toString());
                returnMessage = formatMessage(returnMessage, "logger", paramLoggingEvent.getLoggerName());
                returnMessage = formatMessage(returnMessage, "loglevel", paramLoggingEvent.getLevel().toString());
                returnMessage = formatMessage(returnMessage, "message", paramLoggingEvent.getMessage().toString());
                
                if(paramLoggingEvent.getLoggerName().equals("DevLogs")){
                    String info = paramLoggingEvent.getLocationInformation().getFileName() + "-"+
                            paramLoggingEvent.getLocationInformation().getMethodName() + ":"+
                            paramLoggingEvent.getLocationInformation().getLineNumber();
                    
                    System.out.println("("+info+") : "+paramLoggingEvent.getMessage());
                    returnMessage = formatMessage(returnMessage, "location", info);
                }
                
                return returnMessage;
        }

        @Override
        public boolean ignoresThrowable() {
                return true;
        }

        private String formatMessage(String returnMessage, String key, String value) {
                if (value == null) {
                        LogLog.warn("Setting NULL value for " + key);
                        value = "NULL";
                } 

                if (urlEncode) {
                        try {
                                value = URLEncoder.encode(value, encoding);
                        } catch (UnsupportedEncodingException e) {
                                LogLog.warn(e.toString());

                        }
                }
                returnMessage = returnMessage.replace("%"+key,value);
                return returnMessage;
        }
}
