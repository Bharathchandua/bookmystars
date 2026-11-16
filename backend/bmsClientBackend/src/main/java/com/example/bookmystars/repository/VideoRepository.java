package com.example.bookmystars.repository;

import com.example.bookmystars.model.Video;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByUser(User user);
}