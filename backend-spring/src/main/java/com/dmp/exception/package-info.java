/**
 * API exception handling and error response types.
 * <ul>
 *   <li>{@link com.dmp.exception.GlobalExceptionHandler} – Maps exceptions to {@link com.dmp.exception.ApiError} and HTTP status</li>
 *   <li>{@link com.dmp.exception.ApiError} – Standard JSON error body (timestamp, status, error, message, path, optional fieldErrors)</li>
 *   <li>Domain exceptions: {@link ResourceNotFoundException}, {@link ConflictException}, {@link BadRequestException}, {@link UnauthorizedException}</li>
 * </ul>
 */
package com.dmp.exception;
