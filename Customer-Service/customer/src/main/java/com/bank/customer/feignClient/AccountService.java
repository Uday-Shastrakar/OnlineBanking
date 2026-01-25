package com.bank.customer.feignClient;

import com.bank.customer.dto.AccountDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "accounts", configuration = FeignConfig.class)
public interface AccountService {

    @PostMapping("/api/account/create-account")
    void createAccount(AccountDTO accountDTO);
}
