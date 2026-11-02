package com.example.bookmystars.repository;

import com.example.bookmystars.model.Portfolio;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUser(User user);
}