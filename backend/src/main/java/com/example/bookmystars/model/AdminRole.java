package com.example.bookmystars.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRole {

    @Id
    @Column(length = 64)
    private String id; // e.g. ROLE_SUPER_ADMIN, ROLE_CASTING_DIRECTOR

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String color;

    @Builder.Default
    private Boolean isSystem = false;

    // Stored as JSON string mapping module -> { view, create, edit, delete, approve }
    @Column(columnDefinition = "TEXT")
    private String permissions;
}
