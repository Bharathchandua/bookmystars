package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.DocumentRequest;
import com.example.bookmystars.dto.DocumentResponse;
import com.example.bookmystars.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile/documents")
@Tag(name = "Talent Documents", description = "Talent resume PDFs, comp cards, certificates, and ID documents")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document file from local machine (PDF, DOCX, images)")
    public ResponseEntity<DocumentResponse> uploadDocument(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category) throws IOException {

        String email = authentication.getName();
        DocumentResponse response = documentService.uploadDocument(email, file, title, category);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create document entry using external file URL")
    public ResponseEntity<DocumentResponse> createDocument(
            Authentication authentication,
            @RequestBody DocumentRequest request) {

        String email = authentication.getName();
        DocumentResponse response = documentService.createDocument(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all uploaded documents for the authenticated talent")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication authentication) {
        String email = authentication.getName();
        List<DocumentResponse> response = documentService.getMyDocuments(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/view/{id}")
    @Operation(summary = "Securely view or download a private document (restricted to owner or admin)")
    public ResponseEntity<Resource> viewDocument(
            Authentication authentication,
            @PathVariable Long id) throws IOException {

        String email = authentication != null ? authentication.getName() : "";
        Resource resource = documentService.loadDocumentAsResource(authentication, email, id);

        String contentType = "application/octet-stream";
        if (resource.getFilename() != null && resource.getFilename().toLowerCase().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (resource.getFilename() != null && (resource.getFilename().toLowerCase().endsWith(".jpg") || resource.getFilename().toLowerCase().endsWith(".jpeg"))) {
            contentType = "image/jpeg";
        } else if (resource.getFilename() != null && resource.getFilename().toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document by document ID")
    public ResponseEntity<String> deleteDocument(
            Authentication authentication,
            @PathVariable Long id) throws IOException {

        String email = authentication.getName();
        documentService.deleteDocument(email, id);
        return ResponseEntity.ok("Document deleted successfully");
    }
}
