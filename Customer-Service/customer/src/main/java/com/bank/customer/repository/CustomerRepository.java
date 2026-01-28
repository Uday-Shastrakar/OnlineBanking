package com.bank.customer.repository;

import com.bank.customer.models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customers, Long> {

    Optional<Customers> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    void deleteByUserId(Long userId);

    /**
     * Find all customers that have a userId (potential orphans)
     * The actual orphan check will be done in the service layer
     */
    @Query("SELECT c FROM Customers c WHERE c.userId IS NOT NULL")
    List<Customers> findCustomersWithUserId();
}
