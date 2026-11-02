package com.example.bookmystars.config;

import com.example.bookmystars.util.UploadStorageUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path baseDir = UploadStorageUtil.getBaseUploadDir();
        String fileLocationUri = baseDir.toUri().toString();
        if (!fileLocationUri.endsWith("/")) {
            fileLocationUri += "/";
        }

        // Public talent lookbooks & portfolios
        registry.addResourceHandler("/uploads/portfolio/**")
                .addResourceLocations(fileLocationUri + "portfolio/");

        // Public profile photos & avatars
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations(fileLocationUri + "profile/");

        // Public casting opportunity flyers & posters
        registry.addResourceHandler("/uploads/opportunities/**")
                .addResourceLocations(fileLocationUri + "opportunities/");

        // Public talent videos & audition reels
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations(fileLocationUri + "videos/");

        // Public voiceover clips & audio samples
        registry.addResourceHandler("/uploads/audios/**")
                .addResourceLocations(fileLocationUri + "audios/");

        // Public work experience certificates & awards
        registry.addResourceHandler("/uploads/work-experience/**")
                .addResourceLocations(fileLocationUri + "work-experience/");

        // Generic fallback for all uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileLocationUri);

        // NOTE: /uploads/documents/** is intentionally OMITTED from public registry!
        // Private KYC documents, ID proofs, and contracts are served strictly
        // through authenticated endpoints in DocumentController to prevent unauthorized access.
    }
}
