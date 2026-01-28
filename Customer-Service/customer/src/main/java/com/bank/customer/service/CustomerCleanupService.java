package com.bank.customer.service;

import com.bank.customer.feignclient.UserServiceClient;
import com.bank.customer.models.Customers;
import com.bank.customer.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class CustomerCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerCleanupService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    /**
     * Find all customers whose userId is not present in the users table
     * @return List of orphaned customers
     */
    @Transactional(readOnly = true)
    public List<Customers> findOrphanedCustomers() {
        logger.info("Finding orphaned customers...");
        
        // Get all customers that have a userId
        List<Customers> customersWithUserId = customerRepository.findCustomersWithUserId();
        List<Customers> orphanedCustomers = new ArrayList<>();
        
        for (Customers customer : customersWithUserId) {
            if (customer.getUserId() == null) {
                orphanedCustomers.add(customer);
                continue;
            }
            
            try {
                // Check if user exists via Authentication Service
                Map<String, Object> response = userServiceClient.checkUserExists(customer.getUserId());
                boolean userExists = Boolean.TRUE.equals(response.get("exists"));
                
                if (!userExists) {
                    orphanedCustomers.add(customer);
                    logger.debug("Customer {} is orphaned - user {} does not exist", 
                        customer.getId(), customer.getUserId());
                }
            } catch (Exception e) {
                logger.error("Error checking user existence for customer {}: {}", 
                    customer.getId(), e.getMessage());
                // If we can't verify, assume user exists to be safe
            }
        }
        
        logger.info("Found {} orphaned customers out of {} total customers with userId", 
            orphanedCustomers.size(), customersWithUserId.size());
        return orphanedCustomers;
    }

    /**
     * Remove orphaned customers from the system
     * @return Number of customers removed
     */
    public int removeOrphanedCustomers() {
        logger.info("Starting cleanup of orphaned customers...");
        
        List<Customers> orphanedCustomers = findOrphanedCustomers();
        
        if (orphanedCustomers.isEmpty()) {
            logger.info("No orphaned customers found");
            return 0;
        }

        // Log details before deletion
        orphanedCustomers.forEach(customer -> 
            logger.warn("Removing orphaned customer: ID={}, Name={}, Email={}, UserId={}", 
                customer.getId(), 
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getEmail(),
                customer.getUserId())
        );

        // Delete orphaned customers
        customerRepository.deleteAll(orphanedCustomers);
        
        int removedCount = orphanedCustomers.size();
        logger.info("Successfully removed {} orphaned customers", removedCount);
        
        return removedCount;
    }

    /**
     * Check if a specific customer is orphaned
     * @param customerId Customer ID to check
     * @return true if customer is orphaned, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isCustomerOrphaned(Long customerId) {
        Optional<Customers> customer = customerRepository.findById(customerId);
        
        if (customer.isEmpty()) {
            logger.warn("Customer with ID {} not found", customerId);
            return false;
        }

        Customers cust = customer.get();
        Long userId = cust.getUserId();
        
        if (userId == null) {
            logger.warn("Customer {} has null userId", customerId);
            return true;
        }

        try {
            Map<String, Object> response = userServiceClient.checkUserExists(userId);
            boolean userExists = Boolean.TRUE.equals(response.get("exists"));
            
            logger.debug("Customer {} with userId {} is orphaned: {}", customerId, userId, !userExists);
            return !userExists;
        } catch (Exception e) {
            logger.error("Error checking user existence for customer {}: {}", customerId, e.getMessage());
            // If we can't verify, assume user exists to be safe
            return false;
        }
    }

    /**
     * Get statistics about orphaned customers
     * @return Cleanup statistics
     */
    @Transactional(readOnly = true)
    public CleanupStatistics getCleanupStatistics() {
        List<Customers> orphanedCustomers = findOrphanedCustomers();
        
        CleanupStatistics stats = new CleanupStatistics();
        stats.setTotalCustomers(customerRepository.count());
        stats.setOrphanedCustomersCount(orphanedCustomers.size());
        stats.setValidCustomersCount(stats.getTotalCustomers() - stats.getOrphanedCustomersCount());
        
        return stats;
    }

    /**
     * DTO for cleanup statistics
     */
    public static class CleanupStatistics {
        private long totalCustomers;
        private long orphanedCustomersCount;
        private long validCustomersCount;

        // Getters and setters
        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
        
        public long getOrphanedCustomersCount() { return orphanedCustomersCount; }
        public void setOrphanedCustomersCount(long orphanedCustomersCount) { this.orphanedCustomersCount = orphanedCustomersCount; }
        
        public long getValidCustomersCount() { return validCustomersCount; }
        public void setValidCustomersCount(long validCustomersCount) { this.validCustomersCount = validCustomersCount; }
    }
}
