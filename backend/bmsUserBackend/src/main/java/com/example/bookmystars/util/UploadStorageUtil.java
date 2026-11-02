package com.example.bookmystars.util;

import lombok.extern.slf4j.Slf4j;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
public class UploadStorageUtil {

    private static Path baseDir;

    public static synchronized Path getBaseUploadDir() {
        if (baseDir != null && Files.exists(baseDir) && Files.isWritable(baseDir)) {
            return baseDir;
        }

        // 1. Check environment variable or system property
        String custom = System.getProperty("bms.upload.dir");
        if (custom == null || custom.isBlank()) {
            custom = System.getenv("BMS_UPLOAD_DIR");
        }
        if (custom != null && !custom.isBlank()) {
            Path p = Paths.get(custom.trim());
            if (ensureWritable(p)) {
                baseDir = p.toAbsolutePath().normalize();
                log.info("UploadStorageUtil: Using configured BMS_UPLOAD_DIR: {}", baseDir);
                return baseDir;
            }
        }

        // 2. Try working directory "uploads"
        Path localDir = Paths.get("uploads");
        if (ensureWritable(localDir)) {
            baseDir = localDir.toAbsolutePath().normalize();
            log.info("UploadStorageUtil: Using local directory: {}", baseDir);
            return baseDir;
        }

        // 3. Try user home directory (${user.home}/bms_uploads)
        String userHome = System.getProperty("user.home");
        if (userHome != null && !userHome.isBlank()) {
            Path homeDir = Paths.get(userHome, "bms_uploads");
            if (ensureWritable(homeDir)) {
                baseDir = homeDir.toAbsolutePath().normalize();
                log.info("UploadStorageUtil: Using user home directory: {}", baseDir);
                return baseDir;
            }
        }

        // 4. Fallback to system temp directory (always writable on Linux/Tomcat/Windows)
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "bms_uploads");
        ensureWritable(tempDir);
        baseDir = tempDir.toAbsolutePath().normalize();
        log.info("UploadStorageUtil: Falling back to temp directory: {}", baseDir);
        return baseDir;
    }

    public static Path getCategoryUploadDir(String category) {
        Path catDir = getBaseUploadDir().resolve(category);
        ensureWritable(catDir);
        return catDir;
    }

    private static boolean ensureWritable(Path path) {
        try {
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
            return Files.isWritable(path);
        } catch (Exception e) {
            log.warn("Directory {} is not writable: {}", path, e.getMessage());
            return false;
        }
    }
}
