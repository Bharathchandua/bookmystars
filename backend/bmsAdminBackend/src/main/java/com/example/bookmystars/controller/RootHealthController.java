package com.example.bookmystars.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootHealthController {

    @Value("${spring.application.name:bms-admin-backend}")
    private String appName;

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> checkHealthHtml() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>BookMyStars - Admin API Status</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #f8fafc;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    }
                    .badge {
                        background-color: #2563eb;
                        color: #ffffff;
                        padding: 16px 36px;
                        font-size: 28px;
                        font-weight: 700;
                        border-radius: 8px;
                        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
                        letter-spacing: 0.5px;
                        text-align: center;
                    }
                    .details {
                        margin-top: 14px;
                        text-align: center;
                        font-size: 13px;
                        color: #64748b;
                    }
                    .details a {
                        color: #2563eb;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .details a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div>
                    <div class="badge">&#10003; APPLICATION UP</div>
                    <div class="details">BookMyStars Admin API &bull; <a href="swagger-ui.html">Swagger Docs</a></div>
                </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/html;charset=UTF-8"))
                .body(html);
    }

    @GetMapping(value = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> checkHealthJson() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("application", appName);
        status.put("profile", activeProfile);
        status.put("timestamp", Instant.now().toString());
        status.put("message", "BookMyStars Admin API is running successfully");
        return ResponseEntity.ok(status);
    }
}
