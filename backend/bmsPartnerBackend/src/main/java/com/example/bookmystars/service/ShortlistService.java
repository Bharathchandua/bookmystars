package com.example.bookmystars.service;

import com.example.bookmystars.dto.TalentSummaryResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.model.UserShortlist;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.repository.UserShortlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShortlistService {

    private final UserShortlistRepository shortlistRepository;
    private final UserRepository userRepository;
    private final TalentDirectoryService talentDirectoryService;

    @Transactional(readOnly = true)
    public List<Long> getMyShortlistedTalentIds(User user) {
        return shortlistRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(s -> s.getTalent().getId())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TalentSummaryResponse> getMyShortlistedTalents(User user) {
        List<Long> talentIds = getMyShortlistedTalentIds(user);
        if (talentIds.isEmpty()) return List.of();

        List<TalentSummaryResponse> allTalents = talentDirectoryService.getTalents(null, null);
        return allTalents.stream()
                .filter(t -> talentIds.contains(t.getUserId()))
                .toList();
    }

    @Transactional
    public List<Long> toggleShortlist(User user, Long talentId) {
        User talent = userRepository.findById(talentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talent not found with ID: " + talentId));

        Optional<UserShortlist> existing = shortlistRepository.findByUserAndTalent(user, talent);
        if (existing.isPresent()) {
            shortlistRepository.delete(existing.get());
            log.info("[SHORTLIST] User {} removed talent {} from shortlist", user.getEmail(), talentId);
        } else {
            UserShortlist shortlist = UserShortlist.builder()
                    .user(user)
                    .talent(talent)
                    .build();
            shortlistRepository.save(shortlist);
            log.info("[SHORTLIST] User {} added talent {} to shortlist", user.getEmail(), talentId);
        }

        return getMyShortlistedTalentIds(user);
    }

    @Transactional
    public List<Long> addToShortlist(User user, Long talentId) {
        User talent = userRepository.findById(talentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talent not found with ID: " + talentId));

        if (!shortlistRepository.existsByUserAndTalent(user, talent)) {
            UserShortlist shortlist = UserShortlist.builder()
                    .user(user)
                    .talent(talent)
                    .build();
            shortlistRepository.save(shortlist);
        }

        return getMyShortlistedTalentIds(user);
    }

    @Transactional
    public List<Long> removeFromShortlist(User user, Long talentId) {
        User talent = userRepository.findById(talentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talent not found with ID: " + talentId));

        shortlistRepository.findByUserAndTalent(user, talent)
                .ifPresent(shortlistRepository::delete);

        return getMyShortlistedTalentIds(user);
    }
}
