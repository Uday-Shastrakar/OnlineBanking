package com.bank.authentication.feignclient;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "card", configuration = FeignConfig.class)
public interface CardService {
}
