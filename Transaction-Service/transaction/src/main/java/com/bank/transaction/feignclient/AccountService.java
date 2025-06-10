package com.bank.transaction.feignclient;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
import com.bank.transaction.dto.UpdateAccountDetails;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "account-service", url = "${account-service.url}")
public interface AccountService {

    @GetMapping("api/account/get-details")
    CombineAccountDetailsDTO getSenderAccountDetails(@RequestParam("userId") Long userId, @RequestParam("receiverAccountNumber") Long receiverAccountNumber);

    @PutMapping("api/account/update-details")
    String updateAccountDetails(@RequestBody UpdateAccountDetails updateAccountDetails);
}
