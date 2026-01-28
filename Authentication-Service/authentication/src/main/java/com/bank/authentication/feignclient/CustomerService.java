package com.bank.authentication.feignclient;

import com.bank.authentication.dto.CreateCustomerDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "customer", configuration = FeignConfig.class)
public interface CustomerService {

        @PostMapping("/api/customer/create-customer")
        ResponseEntity<CreateCustomerDto> createCustomerUser(@RequestBody CreateCustomerDto createCustomerDto,
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);

        @GetMapping("/api/customer/{userId}")
        ResponseEntity<CreateCustomerDto> getCustomerById(@PathVariable Long userId,
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);

        @GetMapping("/api/customer/getall")
        ResponseEntity<List<CreateCustomerDto>> getAllCustomers(
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);

        @DeleteMapping("/api/customer/{userId}/delete")
        ResponseEntity<Void> deleteCustomerById(@PathVariable Long userId,
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);

        @PutMapping("/api/customer/{userId}/update")
        ResponseEntity<CreateCustomerDto> updateCustomer(@PathVariable Long userId,
                        @RequestBody CreateCustomerDto createCustomerDTO,
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);

        @PostMapping("/api/customer/{userId}/upload")
        ResponseEntity<String> uploadDoc(@PathVariable Long userId, @RequestPart("file") final MultipartFile file,
                        @RequestHeader(value = "bank-correlation-id", required = false) String correlationId);
}
