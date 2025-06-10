package com.bank.customer.service;

import com.bank.customer.dto.AccountDTO;
import com.bank.customer.dto.CreateCustomerDTO;
import com.bank.customer.models.Customers;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CustomerService {

    CreateCustomerDTO createCustomer(CreateCustomerDTO createCustomerDTO) throws IOException;

    void createAccount(AccountDTO accountDTO) throws IOException;

    String uploadDoc(Long CustomerId, MultipartFile file) throws IOException;

    CreateCustomerDTO getCustomerByUserId(Long userId);

    public CreateCustomerDTO getCustomerById(Long userId);

    List<CreateCustomerDTO> getAllCustomers();

    void deleteCustomerById(Long userId);

    CreateCustomerDTO updateCustomer(Long userId, CreateCustomerDTO createCustomerDTO);

}

