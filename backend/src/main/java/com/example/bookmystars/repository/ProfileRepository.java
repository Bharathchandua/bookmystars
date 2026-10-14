package com.example.bookmystars.repository;

import com.example.bookmystars.model.Profile;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUser(User user);

}