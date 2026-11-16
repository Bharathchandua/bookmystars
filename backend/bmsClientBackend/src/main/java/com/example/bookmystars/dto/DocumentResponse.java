package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;

    private String title;

    private String category;

    private String fileUrl;

    private String format;

    private String sizeStr;

    private LocalDateTime createdAt;
}
