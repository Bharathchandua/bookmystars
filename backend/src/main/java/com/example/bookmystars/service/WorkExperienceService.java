package com.example.bookmystars.service;

import com.example.bookmystars.dto.WorkExperienceRequest;
import com.example.bookmystars.dto.WorkExperienceResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.model.WorkExperience;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.repository.WorkExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class WorkExperienceService {

    private final WorkExperienceRepository workExperienceRepository;
    private final UserRepository userRepository;
    private final com.example.bookmystars.repository.ProfileRepository profileRepository;

    private final Path workUploadDirectory = Paths.get("uploads/work-experience");

    // Upload attachment file (certificates, project proof, media)
    public String uploadWorkFile(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        Files.createDirectories(workUploadDirectory);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = "work_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = workUploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/work-experience/" + fileName;
    }

    // Add work experience
    public WorkExperienceResponse addWorkExperience(
            String email,
            WorkExperienceRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (request == null) {
            throw new RuntimeException("Work experience details are required");
        }
        if (request.getCompany() == null || request.getCompany().trim().isEmpty()) {
            throw new RuntimeException("Company or production banner is required");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Project or role title is required");
        }

        WorkExperience workExperience = WorkExperience.builder()
                .user(user)
                .company(request.getCompany())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .startDate(parseDate(request.getStartDate()))
                .endDate(parseDate(request.getEndDate()))
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .build();

        WorkExperience saved =
                workExperienceRepository.save(workExperience);

        syncProfileStats(user);

        return convertToResponse(saved);
    }

    // Get logged-in user's work experiences
    public List<WorkExperienceResponse> getMyWorkExperiences(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return workExperienceRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public WorkExperienceResponse updateWorkExperience(
        String email,
        Long id,
        WorkExperienceRequest request) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

        WorkExperience workExperience =
            workExperienceRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Work experience not found"));

        // Make sure the experience belongs to the logged-in user
        if (!workExperience.getUser().getId()
            .equals(user.getId())) {

            throw new RuntimeException(
                "You are not allowed to update this work experience");
        }

        if (request == null) {
            throw new RuntimeException("Work experience details are required");
        }
        if (request.getCompany() == null || request.getCompany().trim().isEmpty()) {
            throw new RuntimeException("Company or production banner is required");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Project or role title is required");
        }

        workExperience.setCompany(request.getCompany());
        workExperience.setTitle(request.getTitle());
        workExperience.setDescription(request.getDescription());
        workExperience.setCategory(request.getCategory());
        workExperience.setStartDate(parseDate(request.getStartDate()));
        workExperience.setEndDate(parseDate(request.getEndDate()));
        if (request.getFileUrl() != null) {
            workExperience.setFileUrl(request.getFileUrl());
            workExperience.setFileName(request.getFileName());
        }

        WorkExperience updated =
            workExperienceRepository.save(workExperience);

        syncProfileStats(user);

        return convertToResponse(updated);
    }

    // Delete work experience
    public void deleteWorkExperience(
            String email,
            Long id) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        WorkExperience workExperience =
                workExperienceRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Work experience not found"));

        if (!workExperience.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to delete this work experience");
        }

        workExperienceRepository.delete(workExperience);
        syncProfileStats(user);
    }

    private void syncProfileStats(User user) {
        try {
            com.example.bookmystars.model.Profile profile = profileRepository.findByUser(user).orElse(null);
            if (profile != null) {
                List<WorkExperience> allWorks = workExperienceRepository.findByUser(user);
                long uniqueBrands = allWorks.stream()
                        .map(WorkExperience::getCompany)
                        .filter(c -> c != null && !c.isBlank())
                        .distinct().count();
                profile.setProjectsCompleted(allWorks.size());
                profile.setBrandsWorked((int) uniqueBrands);
                if (profile.getYearsExperience() == null || profile.getYearsExperience() == 0) {
                    profile.setYearsExperience(Math.max(1, allWorks.size()));
                }
                profileRepository.save(profile);
            }
        } catch (Exception ignored) {
        }
    }

    // Convert Entity -> Response DTO
    private WorkExperienceResponse convertToResponse(
            WorkExperience workExperience) {

        return WorkExperienceResponse.builder()
                .id(workExperience.getId())
                .company(workExperience.getCompany())
                .title(workExperience.getTitle())
                .description(workExperience.getDescription())
                .category(workExperience.getCategory())
                .startDate(workExperience.getStartDate())
                .endDate(workExperience.getEndDate())
                .fileUrl(workExperience.getFileUrl())
                .fileName(workExperience.getFileName())
                .build();
    }

    // Lenient date parsing helper (handles 4-digit year, ISO date, or year in string)
    private LocalDate parseDate(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        String s = input.trim();
        // If 4-digit year like "2024"
        if (s.matches("^\\d{4}$")) {
            return LocalDate.of(Integer.parseInt(s), 1, 1);
        }
        // If ISO standard yyyy-MM-dd
        try {
            return LocalDate.parse(s);
        } catch (Exception ignored) {}
        // Extract 4-digit year from range e.g. "2023 - 2024"
        Matcher matcher = Pattern.compile("\\b(19\\d{2}|20\\d{2})\\b").matcher(s);
        if (matcher.find()) {
            return LocalDate.of(Integer.parseInt(matcher.group(1)), 1, 1);
        }
        return null;
    }
}