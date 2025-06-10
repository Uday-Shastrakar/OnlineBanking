package com.bank.customer.exception;

public class CustomerResourceNotFoundException extends RuntimeException {

    public CustomerResourceNotFoundException(String message) {
        super(message);
    }
}
