package com.example.bookmystars.exception;

public class UserLoginValidationException extends RuntimeException {
    public UserLoginValidationException(String message) {
        super(message);
    }

    public UserLoginValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
