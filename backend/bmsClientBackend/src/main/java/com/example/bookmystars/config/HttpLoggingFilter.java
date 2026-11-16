package com.example.bookmystars.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Global HTTP request and response audit logging filter.
 * Logs method, path, query parameters, response status, duration, and user identity.
 */
@Slf4j
public class HttpLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Skip noisy swagger and static assets to keep logs clean
        if (shouldSkipLogging(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String queryString = request.getQueryString() != null ? "?" + request.getQueryString() : "";
        String clientIp = getClientIp(request);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            String user = getAuthenticatedUser();

            if (status >= 500) {
                log.error("[HTTP] {} {}{} -> {} ERROR ({}ms) [user: {}] [ip: {}]",
                        method, uri, queryString, status, duration, user, clientIp);
            } else if (status >= 400) {
                log.warn("[HTTP] {} {}{} -> {} WARN ({}ms) [user: {}] [ip: {}]",
                        method, uri, queryString, status, duration, user, clientIp);
            } else {
                log.info("[HTTP] {} {}{} -> {} OK ({}ms) [user: {}] [ip: {}]",
                        method, uri, queryString, status, duration, user, clientIp);
            }
        }
    }

    private boolean shouldSkipLogging(String uri) {
        return uri.startsWith("/v3/api-docs") ||
               uri.startsWith("/swagger-ui") ||
               uri.startsWith("/swagger-resources") ||
               uri.startsWith("/webjars") ||
               uri.equals("/favicon.ico");
    }

    private String getAuthenticatedUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "anonymous";
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
