package com.bank.customer.exception;

import java.time.LocalDateTime;

public class CustomerErrorResponse {

    private int statusCode;
    private String message;
    private LocalDateTime timeStamp;
    private String details;

    // Constructor
    public CustomerErrorResponse(int statusCode, String message, LocalDateTime timeStamp, String details) {
        this.statusCode = statusCode;
        this.message = message;
        this.timeStamp = timeStamp;
        this.details = details;
    }
}
