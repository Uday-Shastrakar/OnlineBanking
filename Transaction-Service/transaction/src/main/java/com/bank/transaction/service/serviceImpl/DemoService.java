package com.bank.transaction.service.serviceImpl;

import com.bank.transaction.session.UserSession;
import com.bank.transaction.session.UserThreadLocalContext;
import org.springframework.beans.factory.annotation.Autowired;

public class DemoService {

    @Autowired
    private TransactionServiceImpl transactionServiceImpl;
    public UserSession getSession() {
        UserSession userSession  = UserThreadLocalContext.getUserSession();
        System.out.println(userSession);
        return userSession;
    }
}
