package com.watersupply.tracker.exception;

/**
 * Thrown when a request is well-formed but breaks a workflow rule,
 * e.g. moving a status backwards. Turned into HTTP 400.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
