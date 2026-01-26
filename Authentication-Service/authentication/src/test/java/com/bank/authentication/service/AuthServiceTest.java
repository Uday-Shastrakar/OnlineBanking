package com.bank.authentication.service;

import com.bank.authentication.dto.LoginRequestDto;
import com.bank.authentication.dto.LoginResponseDto;
import com.bank.authentication.extenalservice.EmailService;
import com.bank.authentication.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.naming.AuthenticationException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private AuthenticationManager authenticationManager;

	@Mock
	private com.bank.authentication.util.JwtUtils jwtUtils;

	@Mock
	private UserService userService;

	@Mock
	private PasswordResetTokenService passwordResetTokenService;

	@Mock
	private SessionService sessionService;

	@Mock
	private EmailService emailService;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void testautheticatonuser() throws AuthenticationException {
        LoginRequestDto loginRequest = new LoginRequestDto();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

		User user = new User();
		user.setUserId(1L);
		user.setUsername("testuser");
		user.setPassword("password");

		Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
		when(userDetailsService.loadUserByUsername("testuser")).thenReturn(user);
		when(authenticationManager.authenticate(any())).thenReturn(authentication);
		when(authentication.getPrincipal()).thenReturn(user);
		when(jwtUtils.generateToken(any())).thenReturn("jwt-token");

		LoginResponseDto response = authService.authenticateUser(loginRequest);
		assertNotNull(response);
		assertEquals("testuser", response.getUserName());
		assertEquals("jwt-token", response.getJwtToken());
    }
}