package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareResponse {

    private Long userId;
    private String fullName;
    private String shareUrl;
    private String shareCode;
    private String shareTitle;
    private String shareDescription;
    private String whatsappUrl;
    private String emailSubject;
    private String emailBody;
    private String emailUrl;
    private String gmailUrl;
    private String outlookUrl;
    private Long totalViews;
}
