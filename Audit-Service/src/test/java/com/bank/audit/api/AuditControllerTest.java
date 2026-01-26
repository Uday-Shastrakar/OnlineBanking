package com.bank.audit.api;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Audit Controller Test Cases
 * Tests the STRICT SECURITY MODEL - NEVER parses JWT
 */
@ExtendWith(MockitoExtension.class)
class AuditControllerTest {

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuditController auditController;

    private WebTestClient webTestClient;
    private List<AuditEvent> mockAuditEvents;

    @BeforeEach
    void setUp() {
        auditController = new AuditController(auditService);
        webTestClient = WebTestClient.bindToController(auditController).build();
        mockAuditEvents = createMockAuditEvents();
    }

    @Test
    void testGetAllLogs_AdminUser_ShouldSucceed() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(mockAuditEvents);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].auditId").isEqualTo("AUDIT001")
                .jsonPath("$[0].action").isEqualTo("USER_LOGIN")
                .jsonPath("$[1].auditId").isEqualTo("AUDIT002")
                .jsonPath("$[1].action").isEqualTo("CUSTOMER_CREATED");

        verify(auditService).getAllLogs();
    }

    @Test
    void testGetAllLogs_AuditorUser_ShouldSucceed() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(mockAuditEvents);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "2")
                .header("X-Permissions", "AUDIT_READ")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].auditId").isEqualTo("AUDIT001")
                .jsonPath("$[0].action").isEqualTo("USER_LOGIN");

        verify(auditService).getAllLogs();
    }

    @Test
    void testGetAllLogs_CustomerUser_ShouldReturnForbidden() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "123")
                .header("X-Permissions", "CUSTOMER_READ") // Insufficient permission
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isForbidden();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetAllLogs_BankStaffUser_ShouldReturnForbidden() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "456")
                .header("X-Permissions", "ACCOUNT_READ") // Insufficient permission
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isForbidden();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetAllLogs_MissingPermissions_ShouldReturnForbidden() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "123")
                // Missing X-Permissions header
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isForbidden();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetSystemMetrics_AdminUser_ShouldSucceed() {
        // Given
        Map<String, Object> mockMetrics = createMockSystemMetrics();
        when(auditService.getSystemMetrics())
                .thenReturn(mockMetrics);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.totalUsers").isEqualTo(1000)
                .jsonPath("$.totalCustomers").isEqualTo(800)
                .jsonPath("$.totalAccounts").isEqualTo(1500)
                .jsonPath("$.totalTransactions").isEqualTo(5000)
                .jsonPath("$.activeSessions").isEqualTo(50)
                .jsonPath("$.failedLogins").isEqualTo(10)
                .jsonPath("$.systemUptime").isEqualTo("5 days, 12:30:45")
                .jsonPath("$.lastBackup").isEqualTo("2024-01-26T02:00:00");

        verify(auditService).getSystemMetrics();
    }

    @Test
    void testGetSystemMetrics_AuditorUser_ShouldSucceed() {
        // Given
        Map<String, Object> mockMetrics = createMockSystemMetrics();
        when(auditService.getSystemMetrics())
                .thenReturn(mockMetrics);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "2")
                .header("X-Permissions", "AUDIT_READ")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.totalUsers").isEqualTo(1000);

        verify(auditService).getSystemMetrics();
    }

    @Test
    void testGetSystemMetrics_CustomerUser_ShouldReturnForbidden() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "123")
                .header("X-Permissions", "CUSTOMER_READ") // Insufficient permission
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isForbidden();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetSystemMetrics_BankStaffUser_ShouldReturnForbidden() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "456")
                .header("X-Permissions", "TRANSACTION_EXECUTE") // Insufficient permission
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isForbidden();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetSystemMetrics_MissingHeaders_ShouldReturnBadRequest() {
        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                // Missing required headers
                .exchange()
                .expectStatus().isBadRequest();

        verifyNoInteractions(auditService);
    }

    @Test
    void testGetAllLogs_EmptyAuditTrail_ShouldReturnEmptyList() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(Arrays.asList());

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$").isArray()
                .jsonPath("$.length()").isEqualTo(0);

        verify(auditService).getAllLogs();
    }

    @Test
    void testGetSystemMetrics_ServiceUnavailable_ShouldReturnInternalServerError() {
        // Given
        when(auditService.getSystemMetrics())
                .thenThrow(new RuntimeException("Database connection failed"));

        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isEqualTo(500);

        verify(auditService).getSystemMetrics();
    }

    @Test
    void testGetAllLogs_ServiceUnavailable_ShouldReturnInternalServerError() {
        // Given
        when(auditService.getAllLogs())
                .thenThrow(new RuntimeException("Database connection failed"));

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isEqualTo(500);

        verify(auditService).getAllLogs();
    }

    @Test
    void testGetAllLogs_WithDateRangeFilter_ShouldCallCorrectService() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(mockAuditEvents);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all?startDate=2024-01-01&endDate=2024-01-31")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk();

        // Verify that the service is called (actual filtering logic would be in service layer)
        verify(auditService).getAllLogs();
    }

    @Test
    void testGetAllLogs_WithActionFilter_ShouldCallCorrectService() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(mockAuditEvents);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all?action=USER_LOGIN")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk();

        // Verify that the service is called (actual filtering logic would be in service layer)
        verify(auditService).getAllLogs();
    }

    @Test
    void testGetAllLogs_WithUserFilter_ShouldCallCorrectService() {
        // Given
        when(auditService.getAllLogs())
                .thenReturn(mockAuditEvents);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/all?userId=123")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk();

        // Verify that the service is called (actual filtering logic would be in service layer)
        verify(auditService).getAllLogs();
    }

    @Test
    void testGetSystemMetrics_WithLargeDataset_ShouldHandleGracefully() {
        // Given
        Map<String, Object> largeMetrics = createLargeMockSystemMetrics();
        when(auditService.getSystemMetrics())
                .thenReturn(largeMetrics);

        // When & Then
        webTestClient.get()
                .uri("/api/audit/metrics")
                .header("X-User-Id", "1")
                .header("X-Permissions", "ADMIN_ALL")
                .header("X-Request-Id", "req-123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.totalUsers").isEqualTo(1000000);

        verify(auditService).getSystemMetrics();
    }

    // Helper methods
    private List<AuditEvent> createMockAuditEvents() {
        AuditEvent event1 = new AuditEvent();
        event1.setAuditId("AUDIT001");
        event1.setUserId(123L);
        event1.setCustomerId(456L);
        event1.setAction("USER_LOGIN");
        event1.setIpAddress("192.168.1.100");
        event1.setUserAgent("Mozilla/5.0");
        event1.setTimestamp(LocalDateTime.now());
        event1.setStatus("SUCCESS");

        AuditEvent event2 = new AuditEvent();
        event2.setAuditId("AUDIT002");
        event2.setUserId(123L);
        event2.setCustomerId(456L);
        event2.setAction("CUSTOMER_CREATED");
        event2.setIpAddress("192.168.1.100");
        event2.setUserAgent("Mozilla/5.0");
        event2.setTimestamp(LocalDateTime.now());
        event2.setStatus("SUCCESS");

        return Arrays.asList(event1, event2);
    }

    private Map<String, Object> createMockSystemMetrics() {
        return Map.of(
                "totalUsers", 1000,
                "totalCustomers", 800,
                "totalAccounts", 1500,
                "totalTransactions", 5000,
                "activeSessions", 50,
                "failedLogins", 10,
                "systemUptime", "5 days, 12:30:45",
                "lastBackup", "2024-01-26T02:00:00"
        );
    }

    private Map<String, Object> createLargeMockSystemMetrics() {
        return Map.of(
                "totalUsers", 1000000,
                "totalCustomers", 800000,
                "totalAccounts", 1500000,
                "totalTransactions", 5000000,
                "activeSessions", 50000,
                "failedLogins", 1000,
                "systemUptime", "30 days, 12:30:45",
                "lastBackup", "2024-01-26T02:00:00"
        );
    }
}
