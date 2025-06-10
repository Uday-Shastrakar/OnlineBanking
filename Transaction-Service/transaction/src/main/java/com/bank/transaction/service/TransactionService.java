package com.bank.transaction.service;

import com.bank.transaction.session.UserSession;

import java.math.BigDecimal;

public interface TransactionService {


    String fundTransfer(BigDecimal receiverAmount, Long receiverAccountNumber);

    UserSession getSession();
}
