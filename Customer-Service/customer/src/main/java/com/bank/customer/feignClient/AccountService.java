package com.bank.customer.feignClient;

import com.bank.customer.dto.AccountDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "account-service", url = "${account-service.url}")
public interface AccountService {

    @PostMapping("api/account/create-account")
    void createAccount(AccountDTO accountDTO);
}
