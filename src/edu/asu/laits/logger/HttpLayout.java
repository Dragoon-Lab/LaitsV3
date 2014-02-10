/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
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

    public void activateOptions() {
    }

    @Override
    public String format(LoggingEvent paramLoggingEvent) {
        String returnMessage = new String(conversionPattern);

        returnMessage = formatMessage(returnMessage, "userid", ApplicationContext.getUserID());
        Timestamp time = new Timestamp(paramLoggingEvent.getTimeStamp());

        returnMessage = formatMessage(returnMessage, "datetime", time.toString());
        returnMessage = formatMessage(returnMessage, "logger", paramLoggingEvent.getLoggerName());
        returnMessage = formatMessage(returnMessage, "loglevel", paramLoggingEvent.getLevel().toString());
        returnMessage = formatMessage(returnMessage, "message", paramLoggingEvent.getMessage().toString());

        if (paramLoggingEvent.getLoggerName().equals("DevLogs")) {
            String info = paramLoggingEvent.getLocationInformation().getFileName() + "-"
                    + paramLoggingEvent.getLocationInformation().getMethodName() + ":"
                    + paramLoggingEvent.getLocationInformation().getLineNumber();

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
        returnMessage = returnMessage.replace("%" + key, value);
        return returnMessage;
    }
    
}
