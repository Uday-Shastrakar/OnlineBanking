package com.bank.customer.service.serviceImpl;

import com.bank.customer.dto.AccountDTO;
import com.bank.customer.dto.CreateCustomerDTO;
import com.bank.customer.feignClient.AccountService;
import com.bank.customer.models.Customers;
import com.bank.customer.repository.CustomerRepository;
import com.bank.customer.service.CustomerService;
import com.bank.customer.utils.ImageUtils;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public CreateCustomerDTO createCustomer(CreateCustomerDTO createCustomerDTO) throws IOException {
        Customers customer = convertToEntity(createCustomerDTO);
        Customers savedCustomer = customerRepository.save(customer);
        CreateCustomerDTO result = convertToDto(savedCustomer);

        // Publish Event to Kafka for Account Creation
        try {
            com.bank.customer.event.CustomerCreatedEvent event = new com.bank.customer.event.CustomerCreatedEvent(
                    result.getUserId(),
                    result.getId(),
                    result.getEmail(),
                    result.getFirstName(),
                    result.getLastName());
            kafkaTemplate.send("customer-created", event);
        } catch (Exception e) {
            // Log error but don't fail the transaction (Audit will catch this)
            System.err.println("Failed to publish CustomerCreatedEvent: " + e.getMessage());
        }

        return result;
    }

    @Override
    @Transactional
    public void createAccount(AccountDTO accountDTO) throws IOException {
        accountService.createAccount(accountDTO);
    }

    @Override
    @Transactional
    public String uploadDoc(Long customerId, MultipartFile file) throws IOException {

        Optional<Customers> optionalCustomers = customerRepository.findById(customerId);
        if (!optionalCustomers.isPresent()) {
            throw new RuntimeException("Customer not found with ID: " + customerId);
        }

        Customers customers = optionalCustomers.get();
        try {
            if (file != null && !file.isEmpty()) {
                byte[] compressedImage = ImageUtils.compressImage(file.getBytes());
                customers.setProofOfAddress(compressedImage);
                customerRepository.save(customers);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
        return "File Upload Successfully: " + file.getOriginalFilename();
    }

    @Override
    public CreateCustomerDTO getCustomerByUserId(Long userId) {
        Customers customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));
        return convertToDto(customer);
    }

    @Override
    public CreateCustomerDTO getCustomerById(Long userId) {
        Customers customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));
        return convertToDto(customer);
    }

    @Override
    public List<CreateCustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCustomerById(Long userId) {
        if (!customerRepository.existsByUserId(userId)) {
            throw new RuntimeException("Customer not found with ID: " + userId);
        }
        customerRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public CreateCustomerDTO updateCustomer(Long userId, CreateCustomerDTO createCustomerDTO) {
        Customers existingCustomer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));
        updateCustomerFields(existingCustomer, createCustomerDTO);

        Customers updatedCustomer = customerRepository.save(existingCustomer);
        return convertToDto(updatedCustomer);
    }

    private void updateCustomerFields(Customers customer, CreateCustomerDTO dto) {
        customer.setUserId(dto.getUserId());
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setEmail(dto.getEmail());
        customer.setGender(dto.getGender());
        customer.setAddress(dto.getAddress());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setStatus(dto.getStatus());
    }

    private Customers convertToEntity(CreateCustomerDTO dto) {
        if (dto == null)
            return null;
        Customers entity = new Customers();
        BeanUtils.copyProperties(dto, entity);
        return entity;
    }

    private CreateCustomerDTO convertToDto(Customers entity) {
        if (entity == null)
            return null;
        CreateCustomerDTO dto = new CreateCustomerDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

}
