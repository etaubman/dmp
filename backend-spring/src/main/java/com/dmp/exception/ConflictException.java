package com.dmp.exception;

/**
 * Thrown when an operation would violate a business or data constraint (e.g. duplicate, in-use resource).
 * Mapped to HTTP 409 Conflict by {@link GlobalExceptionHandler}.
 */
public final class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
