package com.bank.accounts.service;
import com.bank.accounts.dto.AccountManagerDTO;
import com.bank.accounts.models.AccountManager;
import com.bank.accounts.repository.AccountManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class AccountManagerServiceImpl implements AccountManagerService{

    @Autowired
    private AccountManagerRepository accountManagerRepository;
    @Override
    public AccountManagerDTO createAccountManager(AccountManagerDTO accountManagerDTO) throws IOException {
        AccountManager accountManager = convertToEntity(accountManagerDTO);
        AccountManager savedAccountManager = accountManagerRepository.save(accountManager);
        return convertToDto(savedAccountManager);
    }
    private AccountManager convertToEntity(AccountManagerDTO dto) {
        AccountManager accountManager = new AccountManager();
        updateAccountManagerFields(accountManager, dto);
        return accountManager;
    }
    private void updateAccountManagerFields(AccountManager accountManager, AccountManagerDTO dto) {
        accountManager.setUserId(dto.getUserId());
        accountManager.setFirstName(dto.getFirstName());
        accountManager.setLastName(dto.getLastName());
        accountManager.setPhoneNumber(dto.getPhoneNumber());
        accountManager.setEmail(dto.getEmail());
    }
    private AccountManagerDTO convertToDto(AccountManager accountManager) {
        return new AccountManagerDTO(
                accountManager.getUserId(),
                accountManager.getFirstName(),
                accountManager.getLastName(),
                accountManager.getPhoneNumber(),
                accountManager.getEmail()
        );
    }
}
