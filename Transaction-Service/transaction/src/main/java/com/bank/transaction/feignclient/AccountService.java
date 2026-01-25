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

        @PutMapping("/api/account/update-details")
        String updateAccountDetails(@RequestBody UpdateAccountDetails updateAccountDetails);

        @PostMapping("/api/account/debit")
        String debitAccount(@RequestParam("accountId") Long accountId,
                        @RequestParam("amount") java.math.BigDecimal amount);

        @PostMapping("/api/account/credit")
        String creditAccount(@RequestParam("accountId") Long accountId,
                        @RequestParam("amount") java.math.BigDecimal amount);
}
