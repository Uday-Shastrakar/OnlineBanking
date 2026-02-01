package com.bank.authentication.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "transaction", configuration = FeignConfig.class)
public interface TransactionService {

    @GetMapping("api/transaction/session")
    Object getSession();

    @GetMapping("api/transaction/admin/metrics")
    java.util.Map<String, Object> getTransactionMetrics();

    @GetMapping("api/transaction/admin/failed-metrics")
    java.util.Map<String, Object> getFailedTransactionMetrics();

}
