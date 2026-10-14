package com.example.bookmystars.repository;

import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

    long countByAccountType(com.example.bookmystars.model.AccountType accountType);

    java.util.List<User> findByAccountTypeOrderByIdDesc(com.example.bookmystars.model.AccountType accountType);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.accountType = :accountType AND :profileType MEMBER OF u.profileTypes ORDER BY u.id DESC")
    java.util.List<User> findByAccountTypeAndProfileType(
            @org.springframework.data.repository.query.Param("accountType") com.example.bookmystars.model.AccountType accountType,
            @org.springframework.data.repository.query.Param("profileType") com.example.bookmystars.model.ProfileType profileType
    );
}