package com.bank.authentication.feignclient;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;


@FeignClient(name = "transaction-service", url = "${transaction-service.url}", configuration = FeignConfig.class)
public interface TransactionService {

    @GetMapping("api/transaction/session")
    Object getSession();

}
