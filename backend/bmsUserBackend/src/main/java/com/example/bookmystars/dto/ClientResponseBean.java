package com.example.bookmystars.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized API response wrapper bean for both successful responses
 * and structured exception/error payloads across all REST controllers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientResponseBean {

    private int statusCode;
    private String status;      // e.g. "SUCCESS" or "FAILED"
    private String message;     // Primary user-friendly message
    private Object data;        // Field errors map, payload, or details
    private String details;     // Optional detailed technical info
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public ClientResponseBean(int statusCode, String status, String message, Object data) {
        this.statusCode = statusCode;
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ClientResponseBean(int statusCode, String status, String message, Object data, String details) {
        this.statusCode = statusCode;
        this.status = status;
        this.message = message;
        this.data = data;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
