package com.watersupply.tracker.exception;

/** Thrown when a complaint or team does not exist. Turned into HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
