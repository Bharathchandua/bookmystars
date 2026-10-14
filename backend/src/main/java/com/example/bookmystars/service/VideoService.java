package com.example.bookmystars.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import com.example.bookmystars.dto.VideoRequest;
import com.example.bookmystars.dto.VideoResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.model.Video;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;


    // =========================
    // CREATE VIDEO
    // =========================

    public VideoResponse createVideo(
            String email,
            VideoRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Video video = Video.builder()
                .user(user)
                .title(request.getTitle())
                .category(request.getCategory())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .duration(request.getDuration())
                .year(request.getYear())
                .views(0L)
                .build();

        Video savedVideo =
                videoRepository.save(video);

        return mapToResponse(savedVideo);
    }

    // =========================
// UPLOAD VIDEO FROM LOCAL
// =========================

public VideoResponse uploadVideo(
        String email,
        MultipartFile file,
        String title,
        String category,
        String duration,
        Integer year) throws IOException {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    // Validate file
    if (file == null || file.isEmpty()) {
        throw new RuntimeException("Please select a video file");
    }

    // Validate video type
    String contentType = file.getContentType();

    if (contentType == null ||
            !contentType.startsWith("video/")) {

        throw new RuntimeException(
                "Only video files are allowed");
    }

    // Create upload directory
    Path uploadDirectory =
            Paths.get("uploads/videos");

    Files.createDirectories(uploadDirectory);

    // Get original filename
    String originalFileName =
            file.getOriginalFilename();

    String fileExtension = "";

    if (originalFileName != null &&
            originalFileName.contains(".")) {

        fileExtension =
                originalFileName.substring(
                        originalFileName.lastIndexOf("."));
    }

    // Generate unique filename
    String fileName =
            UUID.randomUUID() + fileExtension;

    Path filePath =
            uploadDirectory.resolve(fileName);

    // Save video file
    Files.copy(
            file.getInputStream(),
            filePath,
            StandardCopyOption.REPLACE_EXISTING
    );

    // Create database entity
    Video video = Video.builder()
            .user(user)
            .title(title)
            .category(category)
            .videoUrl("/uploads/videos/" + fileName)
            .duration(duration != null && !duration.isBlank() ? duration : "2:00")
            .year(year != null ? year : java.time.Year.now().getValue())
            .views(0L)
            .build();

    Video savedVideo =
            videoRepository.save(video);

    return mapToResponse(savedVideo);
}

    // =====================================
    // UPDATE VIDEO WITH OPTIONAL LOCAL FILE
    // =====================================

    public VideoResponse updateVideoWithFile(
            String email,
            Long videoId,
            MultipartFile file,
            String title,
            String category,
            String duration,
            Integer year) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new RuntimeException("Video not found"));

        if (!video.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this video");
        }

        if (title != null && !title.isBlank()) video.setTitle(title);
        if (category != null && !category.isBlank()) video.setCategory(category);
        if (duration != null && !duration.isBlank()) video.setDuration(duration);
        if (year != null) video.setYear(year);

        if (file != null && !file.isEmpty()) {
            Path uploadDirectory = Paths.get("uploads/videos");
            Files.createDirectories(uploadDirectory);

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + fileExtension;
            Path filePath = uploadDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            video.setVideoUrl("/uploads/videos/" + fileName);
        }

        Video updatedVideo = videoRepository.save(video);
        return mapToResponse(updatedVideo);
    }


    // =========================
    // GET MY VIDEOS
    // =========================

    public List<VideoResponse> getMyVideos(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return videoRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // UPDATE VIDEO
    // =========================

    public VideoResponse updateVideo(
            String email,
            Long videoId,
            VideoRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Video not found"));

        // Make sure the video belongs
        // to the logged-in user
        if (!video.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to update this video");
        }

        video.setTitle(request.getTitle());
        video.setCategory(request.getCategory());
        video.setVideoUrl(request.getVideoUrl());
        video.setThumbnailUrl(request.getThumbnailUrl());
        video.setDuration(request.getDuration());
        video.setYear(request.getYear());

        // Views are NOT updated from request.
        // They are controlled by the backend.

        Video updatedVideo =
                videoRepository.save(video);

        return mapToResponse(updatedVideo);
    }


    // =========================
    // DELETE VIDEO
    // =========================

    public void deleteVideo(
            String email,
            Long videoId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Video not found"));

        // Make sure the video belongs
        // to the logged-in user
        if (!video.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to delete this video");
        }

        videoRepository.delete(video);
    }


    // =========================
    // ENTITY -> RESPONSE DTO
    // =========================

    private VideoResponse mapToResponse(
            Video video) {

        return VideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .category(video.getCategory())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .duration(video.getDuration())
                .year(video.getYear())
                .views(video.getViews())
                .build();
    }
}