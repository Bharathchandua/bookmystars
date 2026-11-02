package com.example.bookmystars.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class FileValidationUtil {

    // Dangerous extensions that should never be executed or uploaded
    private static final List<String> DANGEROUS_EXTENSIONS = Arrays.asList(
            ".exe", ".bat", ".cmd", ".sh", ".php", ".phtml", ".jsp", ".jspx",
            ".cgi", ".pl", ".html", ".htm", ".xhtml", ".js", ".vbs", ".jar",
            ".war", ".msi", ".dll", ".scr", ".com", ".ps1"
    );

    // Allowed image extensions and MIME types
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );
    private static final List<String> ALLOWED_IMAGE_MIMES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    // Allowed video extensions and MIME types
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = Arrays.asList(
            ".mp4", ".mov", ".webm", ".mkv", ".m4v"
    );
    private static final List<String> ALLOWED_VIDEO_MIMES = Arrays.asList(
            "video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/x-m4v"
    );

    // Allowed audio extensions and MIME types
    private static final List<String> ALLOWED_AUDIO_EXTENSIONS = Arrays.asList(
            ".mp3", ".wav", ".aac", ".m4a", ".ogg"
    );
    private static final List<String> ALLOWED_AUDIO_MIMES = Arrays.asList(
            "audio/mpeg", "audio/wav", "audio/aac", "audio/mp4", "audio/ogg", "audio/x-m4a"
    );

    // Allowed document extensions and MIME types
    private static final List<String> ALLOWED_DOCUMENT_EXTENSIONS = Arrays.asList(
            ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"
    );
    private static final List<String> ALLOWED_DOCUMENT_MIMES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
    );

    /**
     * Basic sanitization & security check for all uploaded files
     */
    public static String extractAndSanitizeExtension(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required and cannot be empty.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name cannot be empty.");
        }

        // Prevent path traversal
        if (originalName.contains("..") || originalName.contains("/") || originalName.contains("\\") || originalName.contains("\0")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name: path traversal detected.");
        }

        String lowerName = originalName.toLowerCase(Locale.ROOT);
        int lastDotIndex = lowerName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must have a valid extension.");
        }

        String extension = lowerName.substring(lastDotIndex);

        // Block all known dangerous file types immediately
        if (DANGEROUS_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dangerous file type rejected for security: " + extension);
        }

        return extension;
    }

    /**
     * Validates an image file (Photos, Headshots, Avatars, Portfolios)
     */
    public static String validateImage(MultipartFile file) {
        String ext = extractAndSanitizeExtension(file);

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid image format (" + ext + "). Allowed formats: JPG, PNG, WEBP, GIF.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_IMAGE_MIMES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MIME type mismatch for image: " + contentType);
        }

        return ext;
    }

    /**
     * Validates an audition video file or showreel
     */
    public static String validateVideo(MultipartFile file) {
        String ext = extractAndSanitizeExtension(file);

        if (!ALLOWED_VIDEO_EXTENSIONS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid video format (" + ext + "). Allowed formats: MP4, MOV, WEBM, MKV.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_VIDEO_MIMES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MIME type mismatch for video: " + contentType);
        }

        return ext;
    }

    /**
     * Validates audio samples (Voiceovers, Singing samples)
     */
    public static String validateAudio(MultipartFile file) {
        String ext = extractAndSanitizeExtension(file);

        if (!ALLOWED_AUDIO_EXTENSIONS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid audio format (" + ext + "). Allowed formats: MP3, WAV, AAC, M4A, OGG.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_AUDIO_MIMES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MIME type mismatch for audio: " + contentType);
        }

        return ext;
    }

    /**
     * Validates private documents (KYC IDs, Resumes, Certificates)
     */
    public static String validateDocument(MultipartFile file) {
        String ext = extractAndSanitizeExtension(file);

        if (!ALLOWED_DOCUMENT_EXTENSIONS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid document format (" + ext + "). Allowed formats: PDF, DOC, DOCX, JPG, PNG.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_DOCUMENT_MIMES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "MIME type mismatch for document: " + contentType);
        }

        return ext;
    }

    /**
     * Validates opportunity media (Flyer image or brief trailer video)
     */
    public static String validateMedia(MultipartFile file) {
        String ext = extractAndSanitizeExtension(file);

        boolean isImage = ALLOWED_IMAGE_EXTENSIONS.contains(ext);
        boolean isVideo = ALLOWED_VIDEO_EXTENSIONS.contains(ext);

        if (!isImage && !isVideo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid media format (" + ext + "). Allowed formats: JPG, PNG, WEBP, MP4, MOV, WEBM.");
        }

        return ext;
    }
}
