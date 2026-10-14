package com.example.bookmystars.service;

import com.example.bookmystars.dto.PortfolioResponse;
import com.example.bookmystars.model.Portfolio;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.PortfolioRepository;
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
import com.example.bookmystars.repository.ProfileRepository;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/portfolio");


    // =========================
    // UPLOAD PHOTO
    // =========================

    public PortfolioResponse uploadPhoto(
            String email,
            MultipartFile file,
            String title,
            String category) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image");
        }

        Files.createDirectories(uploadDirectory);

        String originalFileName = file.getOriginalFilename();

        String fileExtension = "";

        if (originalFileName != null
                && originalFileName.contains(".")) {

            fileExtension =
                    originalFileName.substring(
                            originalFileName.lastIndexOf("."));
        }

        String fileName =
                UUID.randomUUID() + fileExtension;

        Path filePath =
                uploadDirectory.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .imageUrl("/uploads/portfolio/" + fileName)
                .title(title != null ? title.trim() : null)
                .category(category != null ? category.trim() : null)
                .createdAt(LocalDateTime.now())
                .build();

        Portfolio savedPortfolio =
                portfolioRepository.save(portfolio);

        return PortfolioResponse.builder()
                .id(savedPortfolio.getId())
                .imageUrl(savedPortfolio.getImageUrl())
                .title(savedPortfolio.getTitle())
                .category(savedPortfolio.getCategory())
                .createdAt(savedPortfolio.getCreatedAt())
                .build();
    }


    // =========================
    // UPDATE PHOTO
    // =========================

    public PortfolioResponse updatePhoto(
            String email,
            Long portfolioId,
            String title,
            String category,
            MultipartFile file) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() ->
                        new RuntimeException("Portfolio photo not found"));

        if (!portfolio.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this photo");
        }

        if (title != null && !title.isBlank()) {
            portfolio.setTitle(title.trim());
        }

        if (category != null && !category.isBlank()) {
            portfolio.setCategory(category.trim());
        }

        if (file != null && !file.isEmpty()) {
            Files.createDirectories(uploadDirectory);
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + fileExtension;
            Path filePath = uploadDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Delete old file if present
            if (portfolio.getImageUrl() != null) {
                String oldFileName = portfolio.getImageUrl().substring(portfolio.getImageUrl().lastIndexOf("/") + 1);
                Files.deleteIfExists(uploadDirectory.resolve(oldFileName));
            }

            portfolio.setImageUrl("/uploads/portfolio/" + fileName);
        }

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);

        return PortfolioResponse.builder()
                .id(savedPortfolio.getId())
                .imageUrl(savedPortfolio.getImageUrl())
                .title(savedPortfolio.getTitle())
                .category(savedPortfolio.getCategory())
                .createdAt(savedPortfolio.getCreatedAt())
                .build();
    }


    // =========================
    // GET MY PORTFOLIO
    // =========================

    public List<PortfolioResponse> getMyPortfolio(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Portfolio> list = new java.util.ArrayList<>(portfolioRepository.findByUser(user));

        profileRepository.findByUser(user).ifPresent(profile -> {
            if (profile.getProfilePhoto() != null && !profile.getProfilePhoto().isBlank()) {
                boolean exists = list.stream().anyMatch(p -> profile.getProfilePhoto().equals(p.getImageUrl()));
                if (!exists) {
                    Portfolio headshot = Portfolio.builder()
                            .user(user)
                            .imageUrl(profile.getProfilePhoto())
                            .title("Profile Headshot")
                            .category("Headshot")
                            .createdAt(LocalDateTime.now())
                            .build();
                    portfolioRepository.save(headshot);
                    list.add(0, headshot);
                }
            }
        });

        return list
                .stream()
                .map(portfolio ->
                        PortfolioResponse.builder()
                                .id(portfolio.getId())
                                .imageUrl(portfolio.getImageUrl())
                                .title(portfolio.getTitle())
                                .category(portfolio.getCategory())
                                .createdAt(portfolio.getCreatedAt())
                                .build()
                )
                .toList();
    }


    // =========================
    // DELETE PHOTO
    // =========================

    public void deletePhoto(
            String email,
            Long portfolioId) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Portfolio portfolio =
                portfolioRepository.findById(portfolioId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Portfolio photo not found"));

        if (!portfolio.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to delete this photo");
        }

        String imageUrl = portfolio.getImageUrl();

        if (imageUrl != null) {

            String fileName =
                    imageUrl.substring(
                            imageUrl.lastIndexOf("/") + 1);

            Path filePath =
                    uploadDirectory.resolve(fileName);

            Files.deleteIfExists(filePath);
        }

        portfolioRepository.delete(portfolio);
    }
}