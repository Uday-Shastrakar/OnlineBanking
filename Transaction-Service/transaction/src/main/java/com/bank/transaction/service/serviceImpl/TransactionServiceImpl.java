package com.bank.transaction.service.serviceImpl;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
import com.bank.transaction.dto.UpdateAccountDetails;
import com.bank.transaction.feignclient.AccountService;
import com.bank.transaction.model.Transaction;
import com.bank.transaction.repository.TransactionRepository;
import com.bank.transaction.service.TransactionService;
import com.bank.transaction.session.UserSession;
import com.bank.transaction.session.UserThreadLocalContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private AccountService accountService;

    @Autowired
    private TransactionRepository transactionRepository;

    private UserSession userSession;

    @Override
    @Transactional
    public String fundTransfer(BigDecimal receiverAmount, Long receiverAccountNumber) {

        Long userId = userSession.userId();
        CombineAccountDetailsDTO combineAccountDetailsDTO = accountService.getSenderAccountDetails(userId, receiverAccountNumber);
        System.out.println(combineAccountDetailsDTO + " combineAccountDetailsDTO");
        processTransaction(combineAccountDetailsDTO, receiverAmount);
        return "Transaction Completed";
    }

    private void processTransaction(CombineAccountDetailsDTO combineAccountDetailsDTO, BigDecimal receiverAmount) {

        if (combineAccountDetailsDTO.getSenderAccountBalance().compareTo(receiverAmount) < 0){
            throw new RuntimeException("Sender does not have enough balance for the transfer.");
        }

//        Deduct the amount from the sender's account
        BigDecimal updateSenderBalance = combineAccountDetailsDTO.getSenderAccountBalance().subtract(receiverAmount);

//          Credit the amount to receiver account
        BigDecimal updateReceiverBalance = combineAccountDetailsDTO.getReceiverAccountBalance().add(receiverAmount);

//        Setting the value
        UpdateAccountDetails updateAccountDetails = new UpdateAccountDetails();
        updateAccountDetails.setSenderAccountId(combineAccountDetailsDTO.getSenderAccountId());
        updateAccountDetails.setSenderAccountBalance(updateSenderBalance);
        updateAccountDetails.setReceiverAccountId(combineAccountDetailsDTO.getReceiverAccountId());
        updateAccountDetails.setReceiverAccountBalance(updateReceiverBalance);

        System.out.println(updateAccountDetails + " updateAccountDetails");

//        calling account feign client
        String updateResult = accountService.updateAccountDetails(updateAccountDetails);

//        saving in transaction

        if(updateResult.equals("Account Table is updated")){

            Transaction transaction = new Transaction();

            transaction.setCreditAmount(receiverAmount);
            transaction.setDebitAmount(receiverAmount);
            transaction.setSenderAccountNumber(combineAccountDetailsDTO.getSenderAccountNumber());
            transaction.setReceiverAccountNumber(combineAccountDetailsDTO.getReceiverAccountNumber());
            transaction.setTransactionDateTime(Instant.now());
            transaction.setDescription("Done");
            transaction.setStatus("Done");
            transaction.setCreatedAt(Instant.now());
            transaction.setUpdatedAt(Instant.now());
            transaction.setCreatedBy(userSession.email());
            transaction.setCreatedBy(userSession.email());

            transactionRepository.save(transaction);
        }else {
            throw new RuntimeException("Failed to update account balances");
        }
    }

    @Override
    public UserSession getSession() {
        userSession  = UserThreadLocalContext.getUserSession();
        System.out.println(userSession + " getiing session from getSession()");
        return userSession;
    }
}
