package com.bank.accounts.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private int statusCode;

    private String message;

    private LocalDateTime timeStamp;

    private String details;

    public ErrorResponse(int statusCode, String message, LocalDateTime timeStamp, String details){
        this.statusCode = statusCode;
        this.message = message;
        this.timeStamp = timeStamp;
        this.details = details;
    }
}
