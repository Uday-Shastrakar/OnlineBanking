package com.bank.transaction.config;

import com.bank.transaction.exception.AccountNotFoundException;
import com.bank.transaction.exception.TransactionFailedException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.http.HttpStatus;

public class CustomErrorDecoder implements ErrorDecoder {

    @Override
    public Exception decode(String methodKey, Response response) {
        HttpStatus httpStatus = HttpStatus.valueOf(response.status());
        
        switch (httpStatus) {
            case NOT_FOUND:
                return new AccountNotFoundException("Account not found");
            case BAD_REQUEST:
                return new IllegalArgumentException("Invalid request parameters");
            case INTERNAL_SERVER_ERROR:
                return new TransactionFailedException("Transaction service error");
            default:
                return new TransactionFailedException("Unexpected error during transaction");
        }
    }
}
