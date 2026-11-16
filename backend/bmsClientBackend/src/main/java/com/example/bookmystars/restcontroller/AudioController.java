package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.AudioRequest;
import com.example.bookmystars.dto.AudioResponse;
import com.example.bookmystars.service.AudioService;
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
@RequestMapping("/api/profile/audios")
@Tag(name = "Talent Audios", description = "Voice reels, voiceover audio samples, podcast recordings, and vocal clips")
public class AudioController {

    private final AudioService audioService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload raw audio clip file (MP3, WAV, etc.)")
    public ResponseEntity<AudioResponse> uploadAudio(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "duration", required = false) String duration) throws IOException {

        String email = authentication.getName();
        AudioResponse response = audioService.uploadAudio(email, file, title, category, duration);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create audio entry using external audio stream URL")
    public ResponseEntity<AudioResponse> createAudio(
            Authentication authentication,
            @RequestBody AudioRequest request) {

        String email = authentication.getName();
        AudioResponse response = audioService.createAudio(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all uploaded voice tracks and audio reels for the authenticated talent")
    public ResponseEntity<List<AudioResponse>> getMyAudios(Authentication authentication) {
        String email = authentication.getName();
        List<AudioResponse> response = audioService.getMyAudios(email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete audio track by ID")
    public ResponseEntity<String> deleteAudio(
            Authentication authentication,
            @PathVariable Long id) throws IOException {

        String email = authentication.getName();
        audioService.deleteAudio(email, id);
        return ResponseEntity.ok("Audio track deleted successfully");
    }
}
