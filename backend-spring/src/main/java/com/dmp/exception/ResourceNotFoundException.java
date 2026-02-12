package com.dmp.exception;

/**
 * Thrown when a requested resource does not exist.
 * Mapped to HTTP 404 Not Found by {@link GlobalExceptionHandler}.
 */
public final class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s not found: %s", resourceName, identifier));
    }
}
