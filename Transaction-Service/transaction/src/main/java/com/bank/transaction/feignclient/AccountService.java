package com.bank.transaction.feignclient;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
import com.bank.transaction.dto.UpdateAccountDetails;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "accounts")
public interface AccountService {

        @GetMapping("/api/account/get-details")
        CombineAccountDetailsDTO getSenderAccountDetails(@RequestParam("userId") Long userId,
                        @RequestParam("receiverAccountNumber") Long receiverAccountNumber);

        @GetMapping("/api/account/{accountId}")
        com.bank.transaction.dto.AccountDTO getAccountById(@PathVariable("accountId") Long accountId);

        @GetMapping("/api/account/number/{accountNumber}")
        com.bank.transaction.dto.AccountDTO getAccountByNumber(@PathVariable("accountNumber") Long accountNumber);

        @PutMapping("/api/account/update-details")
        String updateAccountDetails(@RequestBody UpdateAccountDetails updateAccountDetails);

        @PostMapping("/api/account/debit")
        String debitAccount(@RequestParam("accountId") Long accountId,
                        @RequestParam("amount") java.math.BigDecimal amount);

        @PostMapping("/api/account/credit")
        String creditAccount(@RequestParam("accountId") Long accountId,
                        @RequestParam("amount") java.math.BigDecimal amount);

        @GetMapping("/api/account/getall")
        java.util.List<com.bank.transaction.dto.AccountDTO> getAccountsByUserId(@RequestParam("userId") Long userId);
}
