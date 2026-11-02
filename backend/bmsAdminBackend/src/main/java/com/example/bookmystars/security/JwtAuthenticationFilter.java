package com.example.bookmystars.security;

import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        // 1. Check Authorization Bearer header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
            if (token.toLowerCase().startsWith("bearer ")) {
                token = token.substring(7).trim();
            }
        }

        // 2. Fallback: Check HttpOnly / Browser Cookies (jwt_token, token, bms_token)
        if ((token == null || token.isEmpty()) && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt_token".equalsIgnoreCase(cookie.getName())
                        || "token".equalsIgnoreCase(cookie.getName())
                        || "bms_token".equalsIgnoreCase(cookie.getName())) {
                    if (cookie.getValue() != null && !cookie.getValue().isBlank()) {
                        token = cookie.getValue().trim();
                        break;
                    }
                }
            }
        }

        if (token == null || token.isEmpty() || token.equalsIgnoreCase("undefined") || token.equalsIgnoreCase("null")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(token);

            // User is not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null && jwtService.isTokenValid(token, email)) {
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    if (user.getAccountType() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getAccountType().name()));
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(email, null, authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                } else {
                    AdminUser adminUser = adminUserRepository.findByEmail(email).orElse(null);
                    if (adminUser != null && jwtService.isTokenValid(token, email)) {
                        List<GrantedAuthority> authorities = new ArrayList<>();
                        String rawRole = adminUser.getRoleId() != null ? adminUser.getRoleId().trim() : "STAFF";

                        // Granular Role Assignment:
                        if ("SUPER_ADMIN".equalsIgnoreCase(rawRole) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(rawRole)) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                            authorities.add(new SimpleGrantedAuthority("SUPER_ADMIN"));
                        } else {
                            authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + rawRole.toUpperCase()));
                            authorities.add(new SimpleGrantedAuthority(rawRole.toUpperCase()));
                        }

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(email, null, authorities);

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            response.setHeader("X-Auth-Error", "Token has expired");
            SecurityContextHolder.clearContext();
        } catch (JwtException e) {
            log.warn("Invalid JWT signature or token format: {}", e.getMessage());
            response.setHeader("X-Auth-Error", "Invalid token signature");
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Authentication security filter error: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
