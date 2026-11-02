package com.example.bookmystars.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Public talent lookbooks & portfolios
        registry.addResourceHandler("/uploads/portfolio/**")
                .addResourceLocations("file:uploads/portfolio/");

        // Public profile photos & avatars
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:uploads/profile/");

        // Public casting opportunity flyers & posters
        registry.addResourceHandler("/uploads/opportunities/**")
                .addResourceLocations("file:uploads/opportunities/");

        // Public talent videos & audition reels
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations("file:uploads/videos/");

        // Public voiceover clips & audio samples
        registry.addResourceHandler("/uploads/audios/**")
                .addResourceLocations("file:uploads/audios/");

        // Public work experience certificates & awards
        registry.addResourceHandler("/uploads/work-experience/**")
                .addResourceLocations("file:uploads/work-experience/");

        // NOTE: /uploads/documents/** is intentionally OMITTED here!
        // Private KYC documents, ID proofs, and government contracts are served strictly
        // through authenticated endpoints in DocumentController to prevent unauthorized access.
    }
}
