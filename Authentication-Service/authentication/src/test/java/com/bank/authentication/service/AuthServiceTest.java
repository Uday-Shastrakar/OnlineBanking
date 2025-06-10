package com.bank.authentication.service;

import com.bank.authentication.BaseTest;
import com.bank.authentication.dto.LoginRequestDto;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;

import javax.naming.AuthenticationException;

import static org.mockito.Mockito.when;

class AuthServiceTest extends BaseTest {


    @InjectMocks
    private AuthService authService;




    @Test
    void testautheticatonuser() throws AuthenticationException {
        when(authService.authenticateUser(new LoginRequestDto()));
    }
}