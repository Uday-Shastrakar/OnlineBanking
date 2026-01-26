package com.bank.accounts.api;

import com.bank.accounts.dto.*;
import com.bank.accounts.models.Account;
import com.bank.accounts.models.AccountType;
import com.bank.accounts.service.AccountManagerService;
import com.bank.accounts.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountControllerTest {

    @Mock
    private AccountService accountService;

    @Mock
    private AccountManagerService accountManagerService;

    @InjectMocks
    private AccountController accountController;

    private AccountCommandDto mockAccountCommand;
    private Account mockAccount;
    private CombineAccountDetailsDTO mockAccountDetails;

    @BeforeEach
    void setUp() {
        if (accountController == null) {
            accountController = new AccountController();
        }
        org.springframework.test.util.ReflectionTestUtils.setField(accountController, "accountService", accountService);
        org.springframework.test.util.ReflectionTestUtils.setField(accountController, "accountManagerService", accountManagerService);
        mockAccountCommand = createMockAccountCommand();
        mockAccount = createMockAccount();
        mockAccountDetails = createMockAccountDetails();
    }

    @Test
    void testCreateAccount_ShouldReturnAccountQueryDto() throws Exception {
        when(accountService.createAccount(any(AccountCommandDto.class))).thenReturn(mockAccount);

        AccountQueryDto response = accountController.createAccount(mockAccountCommand);
        assertNotNull(response);
        assertEquals(mockAccount.getId(), response.getId());
        assertEquals(mockAccount.getUserId(), response.getUserId());
        assertEquals(mockAccount.getCustomerId(), response.getCustomerId());
        assertEquals(mockAccount.getAccountNumber(), response.getAccountNumber());
        assertEquals(mockAccount.getBalance(), response.getBalance());
        assertEquals(mockAccount.getStatus(), response.getStatus());

        verify(accountService).createAccount(any(AccountCommandDto.class));
    }

    @Test
    void testCreateAccountManager_ShouldReturnCreated() throws Exception {
        AccountManagerDTO input = new AccountManagerDTO(123L, "John", "Doe", "john@example.com", "+123456");
        when(accountManagerService.createAccountManager(any(AccountManagerDTO.class))).thenReturn(input);

        ResponseEntity<AccountManagerDTO> response = accountController.createAccountManager(input, "corr-1");
        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(123L, response.getBody().getUserId());

        verify(accountManagerService).createAccountManager(any(AccountManagerDTO.class));
    }

    @Test
    void testGetSenderAccountDetails_ShouldReturnDto() {
        when(accountService.getSenderAccountDetails(123L, 987654321L)).thenReturn(mockAccountDetails);

        CombineAccountDetailsDTO response = accountController.getSenderAccountDetails(123L, 987654321L);
        assertNotNull(response);
        assertEquals(mockAccountDetails.getSenderAccountId(), response.getSenderAccountId());
        assertEquals(mockAccountDetails.getReceiverAccountId(), response.getReceiverAccountId());

        verify(accountService).getSenderAccountDetails(123L, 987654321L);
    }

    @Test
    void testDebitAccount_ShouldReturnOk() {
        ResponseEntity<String> response = accountController.debitAccount(1L, new BigDecimal("100.00"));
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Debit Successful", response.getBody());

        verify(accountService).debitAccount(1L, new BigDecimal("100.00"));
    }

    @Test
    void testCreditAccount_ShouldReturnOk() {
        ResponseEntity<String> response = accountController.creditAccount(1L, new BigDecimal("100.00"));
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Credit Successful", response.getBody());

        verify(accountService).creditAccount(1L, new BigDecimal("100.00"));
    }

    @Test
    void testGetAllAccounts_ShouldReturnList() {
        when(accountService.getAllAccounts(123L)).thenReturn(Collections.singletonList(mockAccount));
        List<Account> response = accountController.getAllAccounts(123L);
        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(mockAccount.getId(), response.get(0).getId());

        verify(accountService).getAllAccounts(123L);
    }

    // Helper methods
    private AccountCommandDto createMockAccountCommand() {
        AccountCommandDto dto = new AccountCommandDto();
        dto.setUserId(123L);
        dto.setCustomerId(456L);
        dto.setAccountNumber(1234567890L);
        dto.setAccountType("SAVING");
        dto.setBalance(new BigDecimal("1000.00"));
        dto.setStatus("ACTIVE");
        return dto;
    }

    private Account createMockAccount() {
        Account account = new Account();
        account.setId(1L);
        account.setUserId(123L);
        account.setCustomerId(456L);
        account.setAccountNumber(1234567890L);
        account.setAccountType(AccountType.SAVING);
        account.setBalance(new BigDecimal("1000.00"));
        account.setStatus("ACTIVE");
        return account;
    }

    private CombineAccountDetailsDTO createMockAccountDetails() {
        CombineAccountDetailsDTO dto = new CombineAccountDetailsDTO();
        dto.setSenderAccountId(1L);
        dto.setSenderAccountNumber(1234567890L);
        dto.setSenderAccountBalance(new BigDecimal("1000.00"));
        dto.setReceiverAccountId(2L);
        dto.setReceiverAccountNumber(987654321L);
        dto.setReceiverAccountBalance(new BigDecimal("2000.00"));
        return dto;
    }
}
