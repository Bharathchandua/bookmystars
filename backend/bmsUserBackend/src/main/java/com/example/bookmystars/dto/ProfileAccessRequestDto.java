package com.example.bookmystars.dto;

import com.example.bookmystars.model.AccessRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileAccessRequestDto {

    private Long id;
    private Long talentId;
    private String talentName;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterRole;
    private String requesterMessage;
    private AccessRequestStatus status;
    private LocalDateTime createdAt;
}
