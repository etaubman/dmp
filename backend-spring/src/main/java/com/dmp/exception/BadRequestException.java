package com.dmp.exception;

/**
 * Thrown when the request is malformed or invalid (e.g. invalid IDs, circular reference).
 * Mapped to HTTP 400 Bad Request by {@link GlobalExceptionHandler}.
 */
public final class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
