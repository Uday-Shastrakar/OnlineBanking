package com.bank.accounts.repository;

import com.bank.accounts.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    boolean existsByAccountNumber(long accountNumber);

    Account getAccountDetailsByUserId(Long userId);

    Account getAccountDetailsByAccountNumber(Long receiverAccountNumber);

    @Query(value = "SELECT * FROM account where id = :senderId or id = :receiverId", nativeQuery = true)
    List<Account> findAccountBySenderAndReceiver(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
