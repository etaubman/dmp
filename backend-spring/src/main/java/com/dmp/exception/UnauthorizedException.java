package com.dmp.exception;

/**
 * Thrown when authentication is required or credentials are invalid.
 * Mapped to HTTP 401 Unauthorized by {@link GlobalExceptionHandler}.
 */
public final class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
