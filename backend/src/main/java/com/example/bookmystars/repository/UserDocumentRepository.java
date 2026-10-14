package com.example.bookmystars.repository;

import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {

    List<UserDocument> findByUser(User user);
}
