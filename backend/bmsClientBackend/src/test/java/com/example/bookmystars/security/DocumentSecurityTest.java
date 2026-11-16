package com.example.bookmystars.security;

import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserDocument;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.UserDocumentRepository;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private UserDocumentRepository userDocumentRepository;

    @Mock
    private AdminSecurityService adminSecurityService;

    @InjectMocks
    private DocumentService documentService;

    @TempDir
    Path tempUploadDir;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(documentService, "uploadDirectory", tempUploadDir);
    }

    @Test
    @DisplayName("Talent owner can view own private document")
    void owner_canViewOwnDocument() throws IOException {
        String talentEmail = "talent@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                talentEmail, null, List.of(new SimpleGrantedAuthority("ROLE_TALENT")));

        // Create dummy file in temp dir
        Path testFile = tempUploadDir.resolve("test_doc_1.pdf");
        Files.writeString(testFile, "PDF content sample");

        User talentUser = User.builder().id(100L).email(talentEmail).build();
        UserDocument doc = UserDocument.builder()
                .id(1L)
                .user(talentUser)
                .fileUrl("/uploads/documents/test_doc_1.pdf")
                .build();

        when(userDocumentRepository.findById(1L)).thenReturn(Optional.of(doc));

        Resource resource = documentService.loadDocumentAsResource(auth, talentEmail, 1L);
        assertNotNull(resource);
        assertTrue(resource.exists());
    }

    @Test
    @DisplayName("KYC Compliance officer can view talent KYC document")
    void kycOfficer_canViewTalentDocument() throws IOException {
        String officerEmail = "kyc@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                officerEmail, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF")));

        Path testFile = tempUploadDir.resolve("test_doc_2.pdf");
        Files.writeString(testFile, "KYC Aadhar Card sample");

        User talentUser = User.builder().id(200L).email("talent2@bookmystars.com").build();
        UserDocument doc = UserDocument.builder()
                .id(2L)
                .user(talentUser)
                .fileUrl("/uploads/documents/test_doc_2.pdf")
                .build();

        when(userDocumentRepository.findById(2L)).thenReturn(Optional.of(doc));
        when(adminSecurityService.hasPermission(eq(auth), eq("kyc"), eq("view"))).thenReturn(true);

        Resource resource = documentService.loadDocumentAsResource(auth, officerEmail, 2L);
        assertNotNull(resource);
        assertTrue(resource.exists());
    }

    @Test
    @DisplayName("Casting Director without KYC permission is rejected with 403 Forbidden")
    void castingDirector_withoutKycPermission_isRejected() {
        String castingEmail = "casting@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                castingEmail, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF")));

        User talentUser = User.builder().id(300L).email("talent3@bookmystars.com").build();
        UserDocument doc = UserDocument.builder()
                .id(3L)
                .user(talentUser)
                .fileUrl("/uploads/documents/test_doc_3.pdf")
                .build();

        when(userDocumentRepository.findById(3L)).thenReturn(Optional.of(doc));
        when(adminSecurityService.hasPermission(eq(auth), eq("kyc"), eq("view"))).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> documentService.loadDocumentAsResource(auth, castingEmail, 3L));
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Path traversal attempts in fileUrl are blocked and rejected")
    void pathTraversalAttempt_isRejected() {
        String officerEmail = "kyc@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                officerEmail, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF")));

        User talentUser = User.builder().id(400L).email("talent4@bookmystars.com").build();
        UserDocument doc = UserDocument.builder()
                .id(4L)
                .user(talentUser)
                .fileUrl("/uploads/documents/../../etc/passwd")
                .build();

        when(userDocumentRepository.findById(4L)).thenReturn(Optional.of(doc));
        when(adminSecurityService.hasPermission(eq(auth), eq("kyc"), eq("view"))).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> documentService.loadDocumentAsResource(auth, officerEmail, 4L));
        assertTrue(ex.getStatusCode().value() == 400 || ex.getStatusCode().value() == 403);
    }
}
