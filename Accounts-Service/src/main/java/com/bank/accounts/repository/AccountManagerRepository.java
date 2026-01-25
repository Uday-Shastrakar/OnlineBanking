package com.bank.accounts.repository;

import com.bank.accounts.models.AccountManager;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountManagerRepository extends JpaRepository<AccountManager, Long> {
}
