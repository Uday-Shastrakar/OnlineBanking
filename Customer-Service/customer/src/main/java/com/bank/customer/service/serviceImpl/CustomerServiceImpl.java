package com.bank.customer.service.serviceImpl;



import com.bank.customer.dto.AccountDTO;

import com.bank.customer.dto.CreateCustomerDTO;

import com.bank.customer.feignClient.AccountService;

import com.bank.customer.models.Customers;

import com.bank.customer.repository.CustomerRepository;

import com.bank.customer.service.CustomerService;

import com.bank.customer.utils.ImageUtils;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.BeanUtils;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;



import java.io.IOException;

import java.util.List;

import java.util.Optional;

import java.util.stream.Collectors;




@Service

@Slf4j

public class CustomerServiceImpl implements CustomerService {



    @Autowired

    private CustomerRepository customerRepository;



    @Autowired

    private AccountService accountService;



    @Autowired

    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;



    private static final Logger logger = LoggerFactory.getLogger(CustomerServiceImpl.class);

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit



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



        Optional<Customers> optionalCustomers = customerRepository.findByUserId(customerId);

        if (!optionalCustomers.isPresent()) {

            throw new RuntimeException("Customer not found with ID: " + customerId);

        }



        // Validate file type and size

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException("File cannot be null or empty");

        }



        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB. Received: " + file.getSize() + " bytes");

        }



        String contentType = file.getContentType();

        String originalFilename = file.getOriginalFilename();

        

        // Supported file types

        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {

            throw new IllegalArgumentException("Only image files and PDFs are allowed. Received: " + contentType);

        }



        Customers customers = optionalCustomers.get();

        try {

            byte[] fileData;

            

            // Process based on file type

            if (contentType.equals("application/pdf")) {

                // For PDFs, store as-is (no compression)

                fileData = file.getBytes();

                logger.info("Storing PDF file: {} (size: {} bytes)", originalFilename, fileData.length);

            } else if (contentType.startsWith("image/")) {

                // For images, compress to save storage space

                fileData = ImageUtils.compressImage(file.getBytes());

                logger.info("Compressed image file: {} (original: {} bytes, compressed: {} bytes)", 

                    originalFilename, file.getBytes().length, fileData.length);

            } else {

                throw new IllegalArgumentException("Unsupported file type: " + contentType);

            }



            customers.setProofOfAddress(fileData);

            customerRepository.save(customers);

            

            return "File uploaded successfully: " + originalFilename + " (Type: " + contentType + ")";

            

        } catch (IOException e) {

            logger.error("Failed to upload file: {}", originalFilename, e);

            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);

        }

    }



    @Override

    public CreateCustomerDTO getCustomerByUserId(Long userId) {

        Customers customer = customerRepository.findByUserId(userId)

                .orElseThrow(() -> new RuntimeException("Customer not found with userId: " + userId));

        return convertToDto(customer);

    }



    @Override

    public CreateCustomerDTO getCustomerById(Long customerId) {

        Customers customer = customerRepository.findById(customerId)

                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

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
        // Copy only the fields that should be copied, exclude IDs
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setGender(dto.getGender());
        entity.setAddress(dto.getAddress());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setStatus(dto.getStatus());
        entity.setUserId(dto.getUserId());
        // Don't set id - let JPA generate it
        
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
