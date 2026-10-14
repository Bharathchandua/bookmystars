package com.example.bookmystars.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class RatePackageRequest {

    @NotBlank(message = "Package name is required")
    private String packageName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true,
            message = "Price cannot be negative")
    private BigDecimal price;

    @NotBlank(message = "Duration is required")
    private String duration;

    private List<String> features;

    private Boolean mostPopular;

    private Boolean customPrice;
}