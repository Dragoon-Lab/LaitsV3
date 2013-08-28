/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.editor;

/**
 *
 * @author ramayantiwari
 */
public enum AppMode {
    AUTHOR("Author"),
    STUDENT("Student"),
    COACHED("Coached"),
    UNDEFINED("Undefined");
    
    private String value;

    AppMode(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return this.getValue();
    }

    public static AppMode getEnum(String value) {
        if(value == null)
            throw new IllegalArgumentException();
        
        for(AppMode val : values())
            if(value.equalsIgnoreCase(val.getValue())) 
                return val;
        
        throw new IllegalArgumentException();
    }
}
