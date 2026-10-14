package com.example.bookmystars.service;

import com.example.bookmystars.dto.DocumentRequest;
import com.example.bookmystars.dto.DocumentResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserDocument;
import com.example.bookmystars.repository.UserDocumentRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;

    private final Path uploadDirectory = Paths.get("uploads/documents");

    public DocumentResponse uploadDocument(
            String email,
            MultipartFile file,
            String title,
            String category) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a document file to upload");
        }

        Files.createDirectories(uploadDirectory);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = ".pdf";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = "doc_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = uploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

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
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userDocumentRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteDocument(String email, Long id) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDocument doc = userDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to delete this document");
        }

        String fileUrl = doc.getFileUrl();
        if (fileUrl != null && fileUrl.startsWith("/uploads/documents/")) {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = uploadDirectory.resolve(fileName);
            Files.deleteIfExists(filePath);
        }

        userDocumentRepository.delete(doc);
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
