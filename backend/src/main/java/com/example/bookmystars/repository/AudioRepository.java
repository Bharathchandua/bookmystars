package com.example.bookmystars.repository;

import com.example.bookmystars.model.Audio;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AudioRepository extends JpaRepository<Audio, Long> {

    List<Audio> findByUser(User user);
}
