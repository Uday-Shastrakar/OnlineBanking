package com.bank.accounts.listener;

import com.bank.accounts.dto.AccountCommandDto;
import com.bank.accounts.event.CustomerCreatedEvent;
import com.bank.accounts.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AccountOnboardingListener {

    @Autowired
    private AccountService accountService;

    @KafkaListener(topics = "customer-created", groupId = "account-group")
    public void handleCustomerCreatedEvent(CustomerCreatedEvent event) {
        System.out.println("Received CustomerCreatedEvent: " + event);

        try {
            AccountCommandDto accountDto = new AccountCommandDto();
            accountDto.setUserId(event.getUserId());
            accountDto.setCustomerId(event.getCustomerId());
            accountDto.setAccountType("SAVING"); // Default type
            accountDto.setBalance(BigDecimal.ZERO);
            accountDto.setStatus("ACTIVE");

            accountService.createAccount(accountDto);
            System.out.println("✅ Bank Account Auto-created for Customer: " + event.getCustomerId());
        } catch (Exception e) {
            System.err.println("❌ Failed to auto-create bank account: " + e.getMessage());
        }
    }
}
