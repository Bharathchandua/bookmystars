package com.example.bookmystars.service;

import com.example.bookmystars.dto.DocumentRequest;
import com.example.bookmystars.dto.DocumentResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserDocument;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.UserDocumentRepository;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.util.FileValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final com.example.bookmystars.security.AdminSecurityService adminSecurityService;
    private Path getUploadDirectory() {
        return com.example.bookmystars.util.UploadStorageUtil.getCategoryUploadDir("documents");
    }

    public DocumentResponse uploadDocument(
            String email,
            MultipartFile file,
            String title,
            String category) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Validate document extension, MIME type, and sanitize filename
        String fileExtension = FileValidationUtil.validateDocument(file);

        Path uploadDirectory = getUploadDirectory();

        String originalFileName = file.getOriginalFilename();
        String fileName = "doc_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = uploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Secure document uploaded successfully by user id: {}, file: {}", user.getId(), fileName);

        long fileSize = file.getSize();
        String sizeStr = fileSize > 1048576
                ? String.format("%.1f MB", (double) fileSize / 1048576)
                : String.format("%d KB", fileSize / 1024);

        String format = fileExtension.replace(".", "").toUpperCase();

        UserDocument doc = UserDocument.builder()
                .user(user)
                .title(title != null && !title.isBlank() ? title.trim() : (originalFileName != null ? originalFileName : "Document"))
                .category(category != null && !category.isBlank() ? category.trim() : "Resume / CV")
                .fileUrl("/uploads/documents/" + fileName)
                .format(format)
                .sizeStr(sizeStr)
                .createdAt(LocalDateTime.now())
                .build();

        UserDocument saved = userDocumentRepository.save(doc);
        return mapToResponse(saved);
    }

    public DocumentResponse createDocument(String email, DocumentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserDocument doc = UserDocument.builder()
                .user(user)
                .title(request.getTitle())
                .category(request.getCategory() != null ? request.getCategory() : "Resume / CV")
                .fileUrl(request.getFileUrl())
                .format(request.getFormat() != null ? request.getFormat() : "PDF")
                .sizeStr("1.2 MB")
                .createdAt(LocalDateTime.now())
                .build();

        UserDocument saved = userDocumentRepository.save(doc);
        return mapToResponse(saved);
    }

    public List<DocumentResponse> getMyDocuments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return userDocumentRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Resource loadDocumentAsResource(String email, Long documentId) throws IOException {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return loadDocumentAsResource(auth, email, documentId);
    }

    public Resource loadDocumentAsResource(org.springframework.security.core.Authentication auth, String email, Long documentId) throws IOException {
        UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        boolean isOwner = doc.getUser() != null && email.equalsIgnoreCase(doc.getUser().getEmail());
        boolean isAuthorizedAdmin = adminSecurityService != null && adminSecurityService.hasPermission(auth, "kyc", "view");

        if (!isOwner && !isAuthorizedAdmin) {
            log.warn("Unauthorized document access attempt by: {} for doc id: {}", email, documentId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you do not have permission to view this document.");
        }

        String fileUrl = doc.getFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file URL is empty.");
        }

        // Never trust client-provided or raw path string: detect path traversal tokens
        if (fileUrl.contains("..") || fileUrl.contains("\0")) {
            log.error("Path traversal security alert! Traversal tokens detected in fileUrl: {}", fileUrl);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document filename: path traversal detected.");
        }

        String rawFilename = Paths.get(fileUrl).getFileName().toString();
        if (rawFilename.contains("..") || rawFilename.contains("/") || rawFilename.contains("\\") || rawFilename.contains("\0")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid document filename: path traversal detected.");
        }

        // Verify normalized path remains inside the intended upload storage directory
        Path baseDir = getUploadDirectory().toAbsolutePath().normalize();
        Path targetPath = baseDir.resolve(rawFilename).normalize().toAbsolutePath();

        if (!targetPath.startsWith(baseDir)) {
            log.error("Path traversal security alert! Base: {}, Target: {}", baseDir, targetPath);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Path traversal detected.");
        }

        if (!Files.exists(targetPath) || !Files.isRegularFile(targetPath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found on server disk.");
        }

        return new UrlResource(targetPath.toUri());
    }

    public void deleteDocument(String email, Long id) throws IOException {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserDocument doc = userDocumentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        boolean isAuthorizedAdmin = adminSecurityService != null && adminSecurityService.hasPermission(auth, "kyc", "delete");
        boolean isOwner = doc.getUser() != null && doc.getUser().getId().equals(user.getId());

        if (!isOwner && !isAuthorizedAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to delete this document.");
        }

        String fileUrl = doc.getFileUrl();
        if (fileUrl != null) {
            String rawFilename = Paths.get(fileUrl).getFileName().toString();
            Path baseDir = getUploadDirectory().toAbsolutePath().normalize();
            Path targetPath = baseDir.resolve(rawFilename).normalize().toAbsolutePath();
            if (targetPath.startsWith(baseDir)) {
                Files.deleteIfExists(targetPath);
            }
        }

        userDocumentRepository.delete(doc);
        log.info("Document id: {} deleted successfully by {}", id, email);
    }

    private DocumentResponse mapToResponse(UserDocument doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .category(doc.getCategory())
                .fileUrl(doc.getFileUrl())
                .format(doc.getFormat())
                .sizeStr(doc.getSizeStr())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
