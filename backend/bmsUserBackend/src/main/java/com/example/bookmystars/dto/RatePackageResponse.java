package com.example.bookmystars.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class RatePackageResponse {

    private Long id;

    private Long userId;

    private String packageName;

    private BigDecimal price;

    private String duration;

    private List<String> features;

    private Boolean mostPopular;

    private Boolean customPrice;
}