package com.bank.authentication.feignclient;

import com.bank.authentication.dto.CreateCustomerDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/customer-service")
public class CustomerController {
    @Autowired
    CustomerService customerService;

    @GetMapping("/{userId}/get")
    public Object getCustomerById(@PathVariable Long userId, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        return customerService.getCustomerById(userId, correlationId);
    }

    @GetMapping("/getall")
    ResponseEntity<List<CreateCustomerDto>> getAllCustomers(@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        return customerService.getAllCustomers(correlationId);
    }

    @DeleteMapping("/{userId}/delete")
    ResponseEntity<Void> deleteCustomerById(@PathVariable Long userId, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        return customerService.deleteCustomerById(userId, correlationId);
    }

    @PutMapping("/{userId}/update")
    ResponseEntity<CreateCustomerDto> updateCustomer(@PathVariable Long userId, @RequestBody CreateCustomerDto createCustomerDTO,
                                                     @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        return customerService.updateCustomer(userId, createCustomerDTO, correlationId);
    }


    @PostMapping("{userId}/upload")
    ResponseEntity<String> uploadDoc(@PathVariable Long userId, @RequestPart("file") final MultipartFile file,
                                     @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        return customerService.uploadDoc(userId, file, correlationId);
    }

}
