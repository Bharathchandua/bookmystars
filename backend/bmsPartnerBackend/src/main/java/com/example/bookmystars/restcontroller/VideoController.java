package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.VideoRequest;
import com.example.bookmystars.dto.VideoResponse;
import com.example.bookmystars.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile/videos")
@Tag(name = "Talent Videos", description = "Talent video showreels, video reel uploads (up to 100MB), and streaming embeds")
public class VideoController {

    private final VideoService videoService;


    // =========================
    // CREATE VIDEO USING URL
    // =========================

    @PostMapping
    @Operation(summary = "Add video showreel using external URL (e.g. YouTube, Vimeo)")
    public ResponseEntity<VideoResponse> createVideo(
            Authentication authentication,
            @RequestBody VideoRequest request) {

        String email = authentication.getName();

        VideoResponse response =
                videoService.createVideo(email, request);

        return ResponseEntity.ok(response);
    }


    // =========================
    // UPLOAD VIDEO FROM LOCAL
    // =========================

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload raw video file from local machine (MP4, WebM, etc. up to 100MB)")
    public ResponseEntity<VideoResponse> uploadVideo(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "year", required = false) Integer year)
            throws IOException {

        String email = authentication.getName();

        VideoResponse response =
                videoService.uploadVideo(
                        email,
                        file,
                        title,
                        category,
                        duration,
                        year
                );

        return ResponseEntity.ok(response);
    }

    // =====================================
    // UPDATE VIDEO WITH OPTIONAL LOCAL FILE
    // =====================================

    @PutMapping(value = "/{id}/upload", consumes = "multipart/form-data")
    @Operation(summary = "Update video metadata and optionally replace video file")
    public ResponseEntity<VideoResponse> updateVideoWithFile(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "year", required = false) Integer year)
            throws IOException {

        String email = authentication.getName();

        VideoResponse response =
                videoService.updateVideoWithFile(
                        email,
                        id,
                        file,
                        title,
                        category,
                        duration,
                        year
                );

        return ResponseEntity.ok(response);
    }


    // =========================
    // GET MY VIDEOS
    // =========================

    @GetMapping
    @Operation(summary = "Get all uploaded videos and showreels for the authenticated talent")
    public ResponseEntity<List<VideoResponse>> getMyVideos(
            Authentication authentication) {

        String email = authentication.getName();

        List<VideoResponse> response =
                videoService.getMyVideos(email);

        return ResponseEntity.ok(response);
    }


    // =========================
    // UPDATE VIDEO
    // =========================

    @PutMapping("/{id}")
    @Operation(summary = "Update video title, category, or URL by video ID")
    public ResponseEntity<VideoResponse> updateVideo(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody VideoRequest request) {

        String email = authentication.getName();

        VideoResponse response =
                videoService.updateVideo(
                        email,
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================
    // DELETE VIDEO
    // =========================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete video showreel by video ID")
    public ResponseEntity<String> deleteVideo(
            Authentication authentication,
            @PathVariable Long id) {

        String email = authentication.getName();

        videoService.deleteVideo(
                email,
                id
        );

        return ResponseEntity.ok(
                "Video deleted successfully"
        );
    }
}
