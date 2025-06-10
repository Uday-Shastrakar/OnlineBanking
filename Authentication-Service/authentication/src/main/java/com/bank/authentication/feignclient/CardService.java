package com.bank.authentication.feignclient;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "card-service", url = "${card-service.url}", configuration = FeignConfig.class)
public interface CardService {
}
