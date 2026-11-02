package com.example.bookmystars.config;

import com.example.bookmystars.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8080}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpLoggingFilter httpLoggingFilter() {
        return new HttpLoggingFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            String msg = authException != null && authException.getMessage() != null
                                    ? authException.getMessage()
                                    : "Full authentication is required to access this resource";
                            response.getWriter().write(String.format(
                                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\",\"path\":\"%s\"}",
                                    msg.replace("\"", "\\\""),
                                    request.getRequestURI()
                            ));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            String msg = accessDeniedException != null && accessDeniedException.getMessage() != null
                                    ? accessDeniedException.getMessage()
                                    : "Access Denied: You do not have permission to perform this operation";
                            response.getWriter().write(String.format(
                                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"%s\",\"path\":\"%s\"}",
                                    msg.replace("\"", "\\\""),
                                    request.getRequestURI()
                            ));
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Always permit all CORS preflight OPTIONS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Public authentication & self-registration endpoints
                        .requestMatchers(
                                "/",
                                "/api/health",
                                "/error",
                                "/api/auth/**",
                                "/api/admin/auth/**",
                                "/api/partners/register",
                                "/api/clients/register"
                        ).permitAll()

                        // 3. Public static media uploads (Photos, Videos, Audios, Casting Flyers)
                        // Note: /uploads/documents/** is excluded to protect private KYC documents!
                        .requestMatchers(
                                "/uploads/portfolio/**",
                                "/uploads/profile/**",
                                "/uploads/opportunities/**",
                                "/uploads/videos/**",
                                "/uploads/audios/**",
                                "/uploads/work-experience/**"
                        ).permitAll()

                        // 4. Public discovery, master metadata, and Swagger documentation
                        .requestMatchers(
                                "/api/profile/public/**",
                                "/api/profile/access-request/**",
                                "/api/professional/castings/public",
                                "/api/professional/talents",
                                "/api/skills/**",
                                "/api/crafts/**",
                                "/api/professions/**",
                                "/api/languages/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // 5. Sensitive KYC & private verification documents require authentication
                        .requestMatchers("/uploads/documents/**").authenticated()

                        // 6. Strict Staff & RBAC Management: Restrict creating, deleting and modifying staff to SUPER_ADMIN only
                        .requestMatchers("/api/admin/staff/**", "/api/admin/roles/**").hasRole("SUPER_ADMIN")

                        // 7. General Admin endpoints: Accessible by authorized Admin & Staff roles (Method security evaluates fine-grained module actions)
                        .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "STAFF")

                        // 8. Everything else requires an authenticated session
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterAfter(
                        httpLoggingFilter(),
                        JwtAuthenticationFilter.class
                )

                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (origins.contains("*")) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(origins);
        }
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
