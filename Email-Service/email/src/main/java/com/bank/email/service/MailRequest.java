package com.bank.email.service;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MailRequest {
    @JsonAlias(value = "to_email")
    private String toEmail = "default@example.com"; // Default value

    private String subject = "Default Subject"; // Default value

    private String message = "Default message content."; // Default value

    @JsonAlias(value = "html")
    private boolean isHTML = false; // Default value
}
