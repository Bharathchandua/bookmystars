package com.example.bookmystars.exception;

import com.example.bookmystars.dto.ClientResponseBean;
import io.jsonwebtoken.JwtException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for BookMyStars REST controllers.
 * Standardizes API error responses into ClientResponseBean, prevents leakage of
 * internal exceptions and database details, and preserves full React frontend compatibility.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==========================================
    // 400 BAD REQUEST: Bean Validation Errors
    // ==========================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ClientResponseBean> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value");
        }

        String joinedErrors = errors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining("; "));

        logger.warn("Validation error on request: {}", joinedErrors);

        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                "Validation failed: " + joinedErrors,
                errors,
                joinedErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ClientResponseBean> handleConstraintViolation(ConstraintViolationException ex) {
        logger.warn("Constraint violation: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                "Validation failed",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(UserLoginValidationException.class)
    public ResponseEntity<ClientResponseBean> handleUserLoginValidation(UserLoginValidationException ex) {
        logger.warn("User login validation failed: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                ex.getMessage(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ClientResponseBean> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                ex.getMessage() != null ? ex.getMessage() : "Invalid request parameter",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ClientResponseBean> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        logger.warn("Malformed HTTP request body: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                "Malformed JSON request body",
                "Please verify that the request payload is valid JSON and matches expected field types."
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ClientResponseBean> handleMissingServletRequestParameter(MissingServletRequestParameterException ex) {
        logger.warn("Missing request parameter: {}", ex.getParameterName());
        String msg = String.format("Required request parameter '%s' is missing.", ex.getParameterName());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                msg,
                msg
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ClientResponseBean> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        logger.warn("Parameter type mismatch for parameter '{}': {}", ex.getName(), ex.getMessage());
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid type";
        String msg = String.format("Parameter '%s' should be of type %s.", ex.getName(), requiredType);
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                msg,
                msg
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ==========================================
    // 404 NOT FOUND: Missing Resources
    // ==========================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ClientResponseBean> handleResourceNotFound(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.NOT_FOUND.value(),
                "FAILED",
                ex.getMessage(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ClientResponseBean> handleRouteNotFound(Exception ex) {
        logger.warn("Route or resource not found: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.NOT_FOUND.value(),
                "FAILED",
                "Resource or endpoint not found",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ==========================================
    // ResponseStatusException (e.g. from services)
    // ==========================================
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ClientResponseBean> handleResponseStatusException(ResponseStatusException ex) {
        logger.warn("Response status exception ({}): {}", ex.getStatusCode(), ex.getReason());
        String reason = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        ClientResponseBean response = new ClientResponseBean(
                ex.getStatusCode().value(),
                "FAILED",
                reason,
                reason
        );
        return ResponseEntity.status(ex.getStatusCode()).body(response);
    }

    // ==========================================
    // 409 CONFLICT: Database Constraints
    // ==========================================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ClientResponseBean> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        logger.error("Database constraint violation occurred: {}", ex.getMessage(), ex);

        String rootMsg = (ex.getRootCause() != null && ex.getRootCause().getMessage() != null)
                ? ex.getRootCause().getMessage().toLowerCase()
                : (ex.getMessage() != null ? ex.getMessage().toLowerCase() : "");

        String clientMessage;
        if (rootMsg.contains("duplicate key") || rootMsg.contains("unique constraint") || rootMsg.contains("already exists")) {
            clientMessage = "A record with this identifier, email, or unique value already exists in the system.";
        } else if (rootMsg.contains("foreign key") || rootMsg.contains("violates foreign key constraint") || rootMsg.contains("is still referenced")) {
            clientMessage = "Cannot perform this action because the record is linked to or referenced by other records.";
        } else if (rootMsg.contains("not-null") || rootMsg.contains("null value in column")) {
            clientMessage = "Required field is missing or cannot be null.";
        } else {
            clientMessage = "Database operation failed due to a data constraint conflict.";
        }

        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.CONFLICT.value(),
                "FAILED",
                clientMessage,
                clientMessage
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // ==========================================
    // 400 / 413: File Storage Failures
    // ==========================================
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ClientResponseBean> handleFileStorageException(FileStorageException ex) {
        logger.error("File storage error: {}", ex.getMessage(), ex);
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                ex.getMessage() != null ? ex.getMessage() : "File storage operation failed.",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ClientResponseBean> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        logger.warn("Max upload size exceeded: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                "FAILED",
                "Uploaded file exceeds maximum allowed size.",
                "Uploaded file exceeds maximum allowed size. Please upload a smaller file."
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    // ==========================================
    // 401 & 403: Security & Access Control
    // ==========================================
    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class, JwtException.class})
    public ResponseEntity<ClientResponseBean> handleAuthenticationException(Exception ex) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.UNAUTHORIZED.value(),
                "FAILED",
                "Invalid email or password",
                "Please authenticate with valid credentials or token."
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ClientResponseBean> handleAccessDenied(AccessDeniedException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.FORBIDDEN.value(),
                "FAILED",
                "Access Denied",
                "You do not have permission to perform this action."
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // ==========================================
    // 400 BAD REQUEST: Business Runtime Exceptions
    // ==========================================
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ClientResponseBean> handleRuntimeException(RuntimeException ex) {
        logger.warn("Runtime business exception: {}", ex.getMessage());
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.BAD_REQUEST.value(),
                "FAILED",
                ex.getMessage() != null ? ex.getMessage() : "Request processing error",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ==========================================
    // 500 INTERNAL SERVER ERROR: Fallback
    // ==========================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ClientResponseBean> handleGeneralException(Exception ex) {
        logger.error("Unhandled internal server error: {}", ex.getMessage(), ex);
        ClientResponseBean response = new ClientResponseBean(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "FAILED",
                "An unexpected server error occurred. Please try again later.",
                "An unexpected internal error occurred. Detailed error logged on server."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
