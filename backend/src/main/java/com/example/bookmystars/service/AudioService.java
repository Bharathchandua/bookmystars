package com.example.bookmystars.service;

import com.example.bookmystars.dto.AudioRequest;
import com.example.bookmystars.dto.AudioResponse;
import com.example.bookmystars.model.Audio;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AudioRepository;
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
public class AudioService {

    private final AudioRepository audioRepository;
    private final UserRepository userRepository;

    private final Path uploadDirectory = Paths.get("uploads/audios");

    public AudioResponse uploadAudio(
            String email,
            MultipartFile file,
            String title,
            String category,
            String duration) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an audio file to upload");
        }

        Files.createDirectories(uploadDirectory);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = ".mp3";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = "audio_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = uploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        long fileSize = file.getSize();
        String sizeStr = fileSize > 1048576
                ? String.format("%.1f MB", (double) fileSize / 1048576)
                : String.format("%d KB", fileSize / 1024);

        String format = fileExtension.replace(".", "").toUpperCase();

        Audio audio = Audio.builder()
                .user(user)
                .title(title != null && !title.isBlank() ? title.trim() : (originalFileName != null ? originalFileName : "Audio Track"))
                .category(category != null && !category.isBlank() ? category.trim() : "Voice Sample")
                .audioUrl("/uploads/audios/" + fileName)
                .format(format)
                .duration(duration != null && !duration.isBlank() ? duration.trim() : "01:15")
                .sizeStr(sizeStr)
                .createdAt(LocalDateTime.now())
                .build();

        Audio saved = audioRepository.save(audio);
        return mapToResponse(saved);
    }

    public AudioResponse createAudio(String email, AudioRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Audio audio = Audio.builder()
                .user(user)
                .title(request.getTitle())
                .category(request.getCategory() != null ? request.getCategory() : "Voice Sample")
                .audioUrl(request.getAudioUrl())
                .format(request.getFormat() != null ? request.getFormat() : "MP3")
                .duration(request.getDuration() != null ? request.getDuration() : "01:00")
                .sizeStr("2.5 MB")
                .createdAt(LocalDateTime.now())
                .build();

        Audio saved = audioRepository.save(audio);
        return mapToResponse(saved);
    }

    public List<AudioResponse> getMyAudios(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return audioRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteAudio(String email, Long id) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Audio audio = audioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audio track not found"));

        if (!audio.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to delete this audio track");
        }

        String audioUrl = audio.getAudioUrl();
        if (audioUrl != null && audioUrl.startsWith("/uploads/audios/")) {
            String fileName = audioUrl.substring(audioUrl.lastIndexOf("/") + 1);
            Path filePath = uploadDirectory.resolve(fileName);
            Files.deleteIfExists(filePath);
        }

        audioRepository.delete(audio);
    }

    private AudioResponse mapToResponse(Audio audio) {
        return AudioResponse.builder()
                .id(audio.getId())
                .title(audio.getTitle())
                .category(audio.getCategory())
                .audioUrl(audio.getAudioUrl())
                .format(audio.getFormat())
                .duration(audio.getDuration())
                .sizeStr(audio.getSizeStr())
                .createdAt(audio.getCreatedAt())
                .build();
    }
}
