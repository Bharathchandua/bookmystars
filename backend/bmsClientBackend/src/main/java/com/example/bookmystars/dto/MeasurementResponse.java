package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeasurementResponse {

    private Long id;

    private String height;

    private String bust;

    private String waist;

    private String hips;

    private String dressSize;

    private String shoeSize;

    private String hairColor;

    private String eyeColor;

    private String skinTone;

    private String bodyType;

    private LocalDateTime updatedAt;
}