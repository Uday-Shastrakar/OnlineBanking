package com.bank.authentication.feignclient;

import lombok.Data;

@Data
public  class OtpRequest {
    private String toEmail;
    private String otp;
    // Getters and Setters
}
