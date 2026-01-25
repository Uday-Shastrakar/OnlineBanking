package com.bank.authentication.feignclient;

import com.bank.authentication.dto.AccountManagerRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "accounts", configuration = FeignConfig.class)
public interface AccountService {

    @PostMapping("/api/account/create-account-manager")
    void createAccountUser(@RequestBody AccountManagerRequestDTO accountManagerRequestDTO);
}
