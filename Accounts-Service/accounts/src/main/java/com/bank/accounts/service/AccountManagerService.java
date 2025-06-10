package com.bank.accounts.service;

import com.bank.accounts.dto.AccountManagerDTO;

import java.io.IOException;

public interface AccountManagerService {

    AccountManagerDTO createAccountManager(AccountManagerDTO accountManagerDTO) throws IOException;
}
