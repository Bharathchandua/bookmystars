package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactResponse {

    private Long id;
    private Long userId;
    private String name;
    private String role;
    private String company;
    private String location;
    private String avatar;
    private Boolean online;
    private Boolean starred;
    private String category;
    private List<String> tags;
    private Map<String, Object> contactInfo;
    private String about;
    private Map<String, Object> companyInfo;
    private List<Map<String, Object>> projects;
    private String notes;
    private LocalDateTime addedAt;
}
