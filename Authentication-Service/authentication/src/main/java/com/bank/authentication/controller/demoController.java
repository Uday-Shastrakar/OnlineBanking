package com.bank.authentication.controller;

import com.bank.authentication.feignclient.EmailSenderService;
import com.bank.authentication.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class demoController {
    private final EmailSenderService emailSenderService;

    @Autowired
    private JwtUtils jwtUtils;

    public demoController(EmailSenderService emailSenderService) {
        this.emailSenderService = emailSenderService;
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/user")
    public String userEndpoint() {
        return "Hello User";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public String adminEndpoint() {
        return "Hello Admin";
    }

    @GetMapping("/demo")
    public String demo() {
//        OtpRequest req = new OtpRequest();
//        req.setOtp("123465");
//        req.setToEmail("email@gmail.com");
//        String result = emailSenderService.sendOtpEmail(req);
        return "Allowed";
    }

}

