package com.example.bookmystars.repository;

import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserContactRepository extends JpaRepository<UserContact, Long> {

    List<UserContact> findByUserOrderByCreatedAtDesc(User user);

    Optional<UserContact> findByUserAndContactUser(User user, User contactUser);

    boolean existsByUserAndContactUser(User user, User contactUser);

    void deleteByUserAndContactUser(User user, User contactUser);
}
