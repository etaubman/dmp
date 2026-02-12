package com.dmp.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standard API error response body for all error conditions.
 * Provides a consistent structure for clients: status, message, optional field-level validation errors.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public final class ApiError {

    private final Instant timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final List<FieldError> fieldErrors;

    public ApiError(int status, String error, String message, String path, List<FieldError> fieldErrors) {
        this.timestamp = Instant.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.fieldErrors = fieldErrors != null ? List.copyOf(fieldErrors) : List.of();
    }

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, null);
    }

    public static ApiError validation(int status, String message, String path, List<FieldError> fieldErrors) {
        return new ApiError(status, "Validation Failed", message, path, fieldErrors);
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }

    /** Represents a single validation error for a request field. */
    public record FieldError(String field, String message) {}
}
