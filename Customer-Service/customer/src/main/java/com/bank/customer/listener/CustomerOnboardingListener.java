package com.bank.customer.listener;

import com.bank.customer.dto.CreateCustomerDTO;
import com.bank.customer.event.UserRegisteredEvent;
import com.bank.customer.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class CustomerOnboardingListener {

    @Autowired
    private CustomerService customerService;

    @KafkaListener(topics = "user-registered", groupId = "customer-group")
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        System.out.println("Received UserRegisteredEvent: " + event);

        try {
            CreateCustomerDTO customerDto = new CreateCustomerDTO();
            customerDto.setUserId(event.getUserId());
            customerDto.setEmail(event.getEmail());
            customerDto.setFirstName(event.getFirstName());
            customerDto.setLastName(event.getLastName());
            customerDto.setStatus("ACTIVE"); // Default status

            customerService.createCustomer(customerDto);
            System.out.println("✅ Customer Profile Auto-created for User: " + event.getUserId());
        } catch (Exception e) {
            System.err.println("❌ Failed to auto-create customer profile: " + e.getMessage());
        }
    }
}
