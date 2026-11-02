package com.example.bookmystars.repository;

import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserShortlistRepository extends JpaRepository<UserShortlist, Long> {
    List<UserShortlist> findByUserOrderByCreatedAtDesc(User user);
    Optional<UserShortlist> findByUserAndTalent(User user, User talent);
    boolean existsByUserAndTalent(User user, User talent);
    void deleteByUserAndTalent(User user, User talent);
}
