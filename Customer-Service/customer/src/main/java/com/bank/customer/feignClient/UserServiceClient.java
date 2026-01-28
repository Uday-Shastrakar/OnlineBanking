package com.bank.customer.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "authentication", url = "${authentication.service.url:http://localhost:9093}")
public interface UserServiceClient {

    /**
     * Check if a user exists by ID
     * @param userId User ID to check
     * @return Map containing existence information
     */
    @GetMapping("/api/users/{userId}/exists")
    Map<String, Object> checkUserExists(@PathVariable Long userId);

    /**
     * Get user details by ID
     * @param userId User ID
     * @return User details
     */
    @GetMapping("/api/users/{userId}")
    Map<String, Object> getUserById(@PathVariable Long userId);
}
