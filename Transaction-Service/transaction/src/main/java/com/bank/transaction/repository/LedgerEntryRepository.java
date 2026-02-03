package com.bank.transaction.repository;

import com.bank.transaction.model.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    
    // Find all ledger entries for specific account numbers with pagination
    @Query("SELECT le FROM LedgerEntry le WHERE le.accountNumber IN :accountNumbers ORDER BY le.timestamp DESC")
    Page<LedgerEntry> findByAccountNumbersOrderByTimestampDesc(@Param("accountNumbers") List<Long> accountNumbers, Pageable pageable);
    
    // Find all ledger entries for specific account numbers
    @Query("SELECT le FROM LedgerEntry le WHERE le.accountNumber IN :accountNumbers ORDER BY le.timestamp DESC")
    List<LedgerEntry> findByAccountNumbersOrderByTimestampDesc(@Param("accountNumbers") List<Long> accountNumbers);
    
    // Find ledger entries by account number with pagination
    Page<LedgerEntry> findByAccountNumberOrderByTimestampDesc(Long accountNumber, Pageable pageable);
    
    // Find ledger entries by account number
    List<LedgerEntry> findByAccountNumberOrderByTimestampDesc(Long accountNumber);
    
    // Find ledger entries by transaction ID
    List<LedgerEntry> findByTransactionId(Long transactionId);
    
    // Find ledger entries by status
    @Query("SELECT le FROM LedgerEntry le WHERE le.accountNumber IN :accountNumbers AND le.status = :status ORDER BY le.timestamp DESC")
    List<LedgerEntry> findByAccountNumbersAndStatus(@Param("accountNumbers") List<Long> accountNumbers, @Param("status") String status);
    
    // Find ledger entries by date range
    @Query("SELECT le FROM LedgerEntry le WHERE le.accountNumber IN :accountNumbers AND le.timestamp BETWEEN :startDate AND :endDate ORDER BY le.timestamp DESC")
    List<LedgerEntry> findByAccountNumbersAndDateRange(@Param("accountNumbers") List<Long> accountNumbers, 
                                                        @Param("startDate") Instant startDate, 
                                                        @Param("endDate") Instant endDate);
    
    // Get current balance for account
    @Query("SELECT le.balanceAfter FROM LedgerEntry le WHERE le.accountNumber = :accountNumber ORDER BY le.timestamp DESC LIMIT 1")
    BigDecimal getCurrentBalance(@Param("accountNumber") Long accountNumber);
    
    // Count ledger entries for account
    @Query("SELECT COUNT(le) FROM LedgerEntry le WHERE le.accountNumber IN :accountNumbers")
    Long countByAccountNumbers(@Param("accountNumbers") List<Long> accountNumbers);
}
