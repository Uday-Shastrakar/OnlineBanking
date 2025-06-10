package com.bank.accounts.service;

import com.bank.accounts.dto.*;

import com.bank.accounts.models.Account;
import com.bank.accounts.models.AccountType;
import com.bank.accounts.repository.AccountRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import java.util.Random;

@Service
@AllArgsConstructor
public class AccountServiceImpl implements AccountService {
    private static final Logger log = LoggerFactory.getLogger(AccountServiceImpl.class);

    @Autowired
    private AccountRepository accountRepository;



    @Override
    @Transactional
    public Account createAccount(AccountCommandDto accountCommandDto) throws IOException {
        AccountType accountType = AccountType.fromString(accountCommandDto.getAccountType());
        long accountNumber;
        do {
            accountNumber = Math.abs(new Random().nextLong() % 1000000000000L);
        } while (accountRepository.existsByAccountNumber(accountNumber));

        Account account = new Account();
        accountCommandDto.setAccountNumber(accountNumber);

        BigDecimal balance = new BigDecimal("0.00");
        accountCommandDto.setBalance(balance);
        BeanUtils.copyProperties(accountCommandDto, account);
        account.setAccountType(accountType);
        return accountRepository.save(account);
    }

    @Override
    public CombineAccountDetailsDTO getSenderAccountDetails(Long userId, Long receiverAccountNumber) {

        Account senderAccountDetails = accountRepository.getAccountDetailsByUserId(userId);
        Account receiverAccountDetails = accountRepository.getAccountDetailsByAccountNumber(receiverAccountNumber);

        CombineAccountDetailsDTO combineAccountDetailsDTO = new CombineAccountDetailsDTO();

//        setting sender account details
        combineAccountDetailsDTO.setSenderAccountId(senderAccountDetails.getId());
        combineAccountDetailsDTO.setSenderAccountNumber(senderAccountDetails.getAccountNumber());
        combineAccountDetailsDTO.setSenderAccountBalance(senderAccountDetails.getBalance());

//        setting receiver account details
        combineAccountDetailsDTO.setReceiverAccountId(receiverAccountDetails.getId());
        combineAccountDetailsDTO.setReceiverAccountNumber(receiverAccountDetails.getAccountNumber());
        combineAccountDetailsDTO.setReceiverAccountBalance(receiverAccountDetails.getBalance());

        System.out.println(combineAccountDetailsDTO + " combineAccountDetailsDTO");
        return combineAccountDetailsDTO;
    }

    @Override
    @Transactional
    public String updateAccountDetails(@RequestBody UpdateAccountDetails updateAccountDetails) {

        List<Account> accounts = accountRepository.findAccountBySenderAndReceiver(
                updateAccountDetails.getSenderAccountId(),
                updateAccountDetails.getReceiverAccountId()
        );

        System.out.println(accounts + " accounts getting");
        System.out.println(accounts.size() + " accounts size");


        if (accounts.size() != 2) {
            throw new RuntimeException("Sender or Receiver Account Not Found");
        }

        Account senderAccount = accounts.stream().filter(account -> account.getId().equals(updateAccountDetails.getSenderAccountId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sender Account Not Found"));

        Account receiverAccount = accounts.stream().filter(account -> account.getId().equals(updateAccountDetails.getReceiverAccountId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Receiver Account Not Found"));

//            Update Balance
        senderAccount.setBalance(updateAccountDetails.getSenderAccountBalance());
        receiverAccount.setBalance(updateAccountDetails.getReceiverAccountBalance());

        accountRepository.saveAll(Arrays.asList(senderAccount, receiverAccount));

        return "Account Table is updated";
    }



}
