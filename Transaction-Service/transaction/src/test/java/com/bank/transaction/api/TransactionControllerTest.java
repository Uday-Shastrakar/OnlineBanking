package com.bank.transaction.api;

import com.bank.transaction.model.Transaction;
import com.bank.transaction.service.TransactionService;
import com.bank.transaction.session.UserSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    private Transaction mockTransaction;

    @BeforeEach
    void setUp() {
        if (transactionController == null) {
            transactionController = new TransactionController();
        }
        ReflectionTestUtils.setField(transactionController, "transactionService", transactionService);
        mockTransaction = createMockTransaction();
    }

    @Test
    void testFundTransfer_ShouldReturnResult() {
        when(transactionService.fundTransfer(new BigDecimal("500.00"), 987654321L, "transfer-123"))
                .thenReturn("Transaction Completed");

        String response = transactionController.fundTransfer(new BigDecimal("500.00"), 987654321L, "transfer-123");
        assertEquals("Transaction Completed", response);

        verify(transactionService).fundTransfer(new BigDecimal("500.00"), 987654321L, "transfer-123");
    }

    @Test
    void testGetAllTransactions_ShouldReturnList() {
        when(transactionService.getAllTransactions(1234567890L)).thenReturn(Arrays.asList(mockTransaction));

        List<Transaction> response = transactionController.getAllTransactions(1234567890L);
        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(mockTransaction.getId(), response.get(0).getId());

        verify(transactionService).getAllTransactions(1234567890L);
    }

    @Test
    void testGetSession_ShouldReturnUserSession() {
        when(transactionService.getSession()).thenReturn(new UserSession(123L, "test@example.com"));

        UserSession response = transactionController.getSession();
        assertNotNull(response);
        assertEquals(123L, response.userId());
        assertEquals("test@example.com", response.email());

        verify(transactionService).getSession();
    }

    // Helper methods
    private Transaction createMockTransaction() {
        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setDebitAmount(new BigDecimal("500.00"));
        transaction.setCreditAmount(new BigDecimal("500.00"));
        transaction.setSenderAccountNumber(1234567890L);
        transaction.setReceiverAccountNumber(987654321L);
        transaction.setDescription("Transfer to account 987654321");
        transaction.setStatus("COMPLETED");
        return transaction;
    }
}
