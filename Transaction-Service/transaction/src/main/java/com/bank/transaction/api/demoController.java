package com.bank.transaction.api;

import com.bank.transaction.service.serviceImpl.DemoService;
import com.bank.transaction.session.UserSession;

import com.bank.transaction.session.UserThreadLocalContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class demoController {

    private DemoService demoService;

    @GetMapping("/session")
  public  UserSession getSession(){

        return demoService.getSession();

    }
}
