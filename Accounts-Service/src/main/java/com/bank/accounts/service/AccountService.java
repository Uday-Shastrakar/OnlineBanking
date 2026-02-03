package com.bank.accounts.service;

import com.bank.accounts.dto.AccountCommandDto;
import com.bank.accounts.dto.CombineAccountDetailsDTO;
import com.bank.accounts.dto.UpdateAccountDetails;
import com.bank.accounts.models.Account;

import java.io.IOException;

public interface AccountService {

    Account createAccount(AccountCommandDto accountCommandDto) throws IOException;

    CombineAccountDetailsDTO getSenderAccountDetails(Long UserId, Long receiverAccountNumber);

    String updateAccountDetails(UpdateAccountDetails updateAccountDetails);

    void debitAccount(Long accountId, java.math.BigDecimal amount);

    void creditAccount(Long accountId, java.math.BigDecimal amount);

    java.math.BigDecimal debitAccountAndReturnBalance(Long accountId, java.math.BigDecimal amount);

    java.math.BigDecimal creditAccountAndReturnBalance(Long accountId, java.math.BigDecimal amount);

    java.util.List<Account> getAllAccounts(Long userId);
}
