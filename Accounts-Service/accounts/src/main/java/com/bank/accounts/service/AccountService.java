package com.bank.accounts.service;

import com.bank.accounts.dto.AccountCommandDto;
import com.bank.accounts.dto.CombineAccountDetailsDTO;
import com.bank.accounts.dto.UpdateAccountDetails;
import com.bank.accounts.models.Account;

import java.io.IOException;

public interface AccountService{

    Account createAccount(AccountCommandDto accountCommandDto) throws IOException;

    CombineAccountDetailsDTO getSenderAccountDetails(Long UserId, Long receiverAccountNumber);

    String updateAccountDetails(UpdateAccountDetails updateAccountDetails);
}
