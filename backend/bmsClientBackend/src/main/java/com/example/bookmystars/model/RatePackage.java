package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rate_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Talent who owns this package
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Example: Half Day, Full Day, Campaign
    @Column(name = "package_name", nullable = false)
    private String packageName;

    // Example: 25000, 45000, 60000
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    // Example: 4 hours, 8 hours, Custom
    @Column(nullable = false)
    private String duration;

    // Features shown on the package card
    @ElementCollection
    @CollectionTable(
            name = "rate_package_features",
            joinColumns = @JoinColumn(name = "rate_package_id")
    )
    @Column(name = "feature", nullable = false)
    @Builder.Default
    private List<String> features = new ArrayList<>();

    // Shows "Most Popular" on the frontend
    @Column(name = "most_popular", nullable = false)
    @Builder.Default
    private Boolean mostPopular = false;

    // true for packages such as ₹60,000+
    @Column(name = "custom_price", nullable = false)
    @Builder.Default
    private Boolean customPrice = false;
}