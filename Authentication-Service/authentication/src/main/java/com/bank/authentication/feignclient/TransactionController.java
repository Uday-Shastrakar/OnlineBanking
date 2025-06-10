package com.bank.authentication.feignclient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transaction-service")
public class TransactionController {
    @Autowired
    TransactionService transactionService;


    @GetMapping("/session")
    Object getSession() {
        return transactionService.getSession();
    }
}
