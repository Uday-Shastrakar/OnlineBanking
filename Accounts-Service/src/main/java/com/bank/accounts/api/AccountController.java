package com.bank.accounts.api;

import com.bank.accounts.dto.*;
import com.bank.accounts.models.Account;
import com.bank.accounts.service.AccountManagerService;
import com.bank.accounts.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountManagerService accountManagerService;
    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    @PostMapping("/create-account")
    public AccountQueryDto createAccount(@RequestBody AccountCommandDto accountCommandDto) throws IOException {

        // Convert AccountCommandDto to Account entity
        Account account = new Account();
        // Copy properties from AccountCommandDTO to Account
        BeanUtils.copyProperties(accountCommandDto, account);

        Account savedAccounts = accountService.createAccount(accountCommandDto);

        // Convert saved Account entity to AccountQueryDto for the response
        // Create a new AccountQueryDTO to return as the response
        AccountQueryDto accountQueryDto = new AccountQueryDto();
        BeanUtils.copyProperties(savedAccounts, accountQueryDto);

        return accountQueryDto;
    }

    @PostMapping("/create-account-manager")
    public ResponseEntity<AccountManagerDTO> createAccountManager(
            @RequestBody AccountManagerDTO accountManagerCommandDto,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) throws IOException {
        AccountManagerDTO createAccountManagerCommandDto = accountManagerService
                .createAccountManager(accountManagerCommandDto);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createAccountManagerCommandDto);
    }

    @GetMapping("/get-details")
    public CombineAccountDetailsDTO getSenderAccountDetails(@RequestParam Long userId,
            @RequestParam Long receiverAccountNumber) {
        return accountService.getSenderAccountDetails(userId, receiverAccountNumber);
    }

    @PutMapping("/update-details")
    String updateAccountDetails(@RequestBody UpdateAccountDetails updateAccountDetails) {
        return accountService.updateAccountDetails(updateAccountDetails);
    }

    @PostMapping("/debit")
    public ResponseEntity<String> debitAccount(@RequestParam Long accountId,
            @RequestParam java.math.BigDecimal amount) {
        accountService.debitAccount(accountId, amount);
        return ResponseEntity.ok("Debit Successful");
    }

    @PostMapping("/credit")
    public ResponseEntity<String> creditAccount(@RequestParam Long accountId,
            @RequestParam java.math.BigDecimal amount) {
        accountService.creditAccount(accountId, amount);
        return ResponseEntity.ok("Credit Successful");
    }

    @GetMapping("/getall")
    public java.util.List<Account> getAllAccounts(@RequestParam Long userId) {
        return accountService.getAllAccounts(userId);
    }

}
