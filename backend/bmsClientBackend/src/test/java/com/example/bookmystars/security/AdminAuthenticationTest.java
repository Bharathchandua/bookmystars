package com.example.bookmystars.security;

import com.example.bookmystars.dto.AdminLoginRequest;
import com.example.bookmystars.dto.AdminLoginResponse;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.service.AdminAuthService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuthenticationTest {

    private static final String TEST_SECRET = "TestSecretKeyForAdminAuthenticationTesting2026MustBeAtLeast256BitsLong!";
    private static final long TEST_EXPIRATION = 86400000L;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private AdminRoleRepository adminRoleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AdminAuthService adminAuthService;

    private JwtService realJwtService;

    @BeforeEach
    void setUp() {
        realJwtService = new JwtService();
        ReflectionTestUtils.setField(realJwtService, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(realJwtService, "expiration", TEST_EXPIRATION);
    }

    @Test
    @DisplayName("Valid administrator login succeeds, sets lastLogin, and returns token")
    void login_withValidCredentials_succeeds() {
        String email = "admin@bookmystars.com";
        String rawPassword = "ValidPassword123!";
        String encodedHash = "$2a$10$encodedHashStringForAdmin";

        AdminUser admin = AdminUser.builder()
                .id(1L)
                .name("Super Admin")
                .email(email)
                .password(encodedHash)
                .roleId("ROLE_SUPER_ADMIN")
                .status("ACTIVE")
                .build();

        when(adminUserRepository.findByEmail(email)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches(rawPassword, encodedHash)).thenReturn(true);
        when(jwtService.generateToken(email)).thenReturn("mock.jwt.token");

        AdminLoginRequest request = new AdminLoginRequest();
        request.setEmail(email);
        request.setPassword(rawPassword);

        AdminLoginResponse response = adminAuthService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals(email, response.getUser().getEmail());
        verify(adminUserRepository).save(admin);
    }

    @Test
    @DisplayName("Login with invalid password throws BadCredentialsException")
    void login_withIncorrectPassword_throwsBadCredentials() {
        String email = "admin@bookmystars.com";

        AdminUser admin = AdminUser.builder()
                .email(email)
                .password("$2a$10$encodedHash")
                .status("ACTIVE")
                .build();

        when(adminUserRepository.findByEmail(email)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("WrongPassword", admin.getPassword())).thenReturn(false);

        AdminLoginRequest request = new AdminLoginRequest();
        request.setEmail(email);
        request.setPassword("WrongPassword");

        assertThrows(BadCredentialsException.class, () -> adminAuthService.login(request));
        verify(adminUserRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login for deactivated admin account is rejected with BadCredentialsException")
    void login_withDeactivatedAccount_isRejected() {
        String email = "deactivated@bookmystars.com";

        AdminUser admin = AdminUser.builder()
                .email(email)
                .password("$2a$10$encodedHash")
                .status("DEACTIVATED")
                .build();

        when(adminUserRepository.findByEmail(email)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        AdminLoginRequest request = new AdminLoginRequest();
        request.setEmail(email);
        request.setPassword("Password123!");

        assertThrows(BadCredentialsException.class, () -> adminAuthService.login(request));
    }

    @Test
    @DisplayName("Expired JWT token throws ExpiredJwtException on extraction")
    void expiredJwt_isRejected() {
        SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));

        // Create token with past expiration
        Date past = new Date(System.currentTimeMillis() - 3600000L);
        Date issuedAt = new Date(System.currentTimeMillis() - 7200000L);

        String expiredToken = Jwts.builder()
                .subject("admin@bookmystars.com")
                .issuedAt(issuedAt)
                .expiration(past)
                .signWith(key)
                .compact();

        assertThrows(ExpiredJwtException.class, () -> realJwtService.extractEmail(expiredToken));
    }

    @Test
    @DisplayName("Tampered JWT signature throws SignatureException on verification")
    void tamperedJwtSignature_isRejected() {
        // Sign token with a different key
        String differentSecret = "CompletelyDifferentSecretKeyForTamperingTest2026AtLeast256BitsLong!";
        SecretKey attackerKey = Keys.hmacShaKeyFor(differentSecret.getBytes(StandardCharsets.UTF_8));

        String forgedToken = Jwts.builder()
                .subject("attacker@bookmystars.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000L))
                .signWith(attackerKey)
                .compact();

        assertThrows(SignatureException.class, () -> realJwtService.extractEmail(forgedToken));
    }

    @Test
    @DisplayName("Valid JWT token parses subject email correctly")
    void validJwt_extractsCorrectSubjectEmail() {
        String token = realJwtService.generateToken("admin@bookmystars.com");
        assertNotNull(token);

        String extracted = realJwtService.extractEmail(token);
        assertEquals("admin@bookmystars.com", extracted);
        assertTrue(realJwtService.isTokenValid(token, "admin@bookmystars.com"));
        assertFalse(realJwtService.isTokenValid(token, "other@bookmystars.com"));
    }
}
