package com.bank.customer.api;

import com.bank.customer.dto.AccountDTO;
import com.bank.customer.dto.CreateCustomerDTO;
import com.bank.customer.service.CustomerService;
import com.bank.customer.session.UserThreadLocalContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);


    @PostMapping("/create-customer")
    public ResponseEntity<CreateCustomerDTO> createCustomer(
            @RequestBody CreateCustomerDTO createCustomerDTO,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) throws IOException {


        CreateCustomerDTO createdCustomer = customerService.createCustomer(createCustomerDTO);

        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setUserId(createdCustomer.getUserId());
        accountDTO.setCustomerId(createdCustomer.getId());
        accountDTO.setAccountType(createCustomerDTO.getAccountType());
        accountDTO.setCreatedAt(LocalDateTime.now());
        accountDTO.setUpdatedAt(LocalDateTime.now());
        accountDTO.setStatus(createdCustomer.getStatus());

        customerService.createAccount(accountDTO);

        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CreateCustomerDTO> getCustomerByUserId(@PathVariable Long userId,@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        CreateCustomerDTO customerDTO = customerService.getCustomerByUserId(userId);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(customerDTO);
    }

    @GetMapping("/single/{id}")
    public ResponseEntity<CreateCustomerDTO> getCustomerById(@PathVariable Long id,@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        CreateCustomerDTO customerDTO = customerService.getCustomerById(id);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(customerDTO);
    }

    @GetMapping("/getall")
    public ResponseEntity<List<CreateCustomerDTO>> getAllCustomers(@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        List<CreateCustomerDTO> customers = customerService.getAllCustomers();
        System.out.println(UserThreadLocalContext.getUserSession());
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(customers);
    }

    @DeleteMapping("/{userId}/delete")
    public ResponseEntity<Void> deleteCustomerById(@PathVariable Long userId,@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        customerService.deleteCustomerById(userId);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<CreateCustomerDTO> updateCustomer(
            @PathVariable Long userId,
            @RequestBody CreateCustomerDTO createCustomerDTO,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {

        CreateCustomerDTO updatedCustomer = customerService.updateCustomer(userId, createCustomerDTO);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(updatedCustomer);
    }


    @PostMapping("{userId}/upload")
    public ResponseEntity<String> uploadDoc(@PathVariable Long userId, @RequestPart("file") final MultipartFile file,@RequestHeader(value = "bank-correlation-id",required = false) String correlationId) throws IOException{
        String uploadImage = customerService.uploadDoc(userId,file);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(uploadImage);
    }

}
