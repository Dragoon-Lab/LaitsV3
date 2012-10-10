/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.model;

/**
 *
 * @author ramayantiwari
 */
public class ModelEvaluationException extends Exception {

    private String errorMessage;

    public ModelEvaluationException() {
        super();
        errorMessage = "Unknown";
    }

    public ModelEvaluationException(String err) {
        super(err);
        errorMessage = err;
    }

    public ModelEvaluationException(String err, Throwable cause) {
        super(err, cause);
        errorMessage = err;
    }

    public String getMessage() {
        return errorMessage;
    }
}
