package com.bank.audit.service;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class AuditService {

    @Autowired
    private AuditRepository auditRepository;

    public List<AuditEvent> getAllLogs() {
        return auditRepository.findAll();
    }

    public void createSampleAuditData() {
        Random random = new Random();
        String[] actions = {
            "LOGIN", "LOGOUT", "TRANSFER", "ACCOUNT_CREATE", "ACCOUNT_UPDATE", "ACCOUNT_DELETE",
            "TRANSACTION_SUCCESS", "TRANSACTION_FAILED", "TRANSACTION_PENDING", "TRANSACTION_INITIATED",
            "PASSWORD_CHANGE", "PASSWORD_RESET", "VIEW_BALANCE", "VIEW_STATEMENT", "DOWNLOAD_STATEMENT",
            "CARD_REQUEST", "CARD_ACTIVATED", "CARD_BLOCKED", "CARD_CANCELLED",
            "LOAN_APPLICATION", "LOAN_APPROVED", "LOAN_REJECTED", "LOAN_DISBURSED",
            "DEPOSIT", "WITHDRAWAL", "CHEQUE_DEPOSIT", "CHEQUE_BOUNCE",
            "BILL_PAYMENT", "BILL_PAYMENT_SUCCESS", "BILL_PAYMENT_FAILED",
            "FUND_TRANSFER", "FUND_TRANSFER_SUCCESS", "FUND_TRANSFER_FAILED",
            "MOBILE_BANKING_LOGIN", "MOBILE_BANKING_TRANSACTION", "INTERNET_BANKING_LOGIN",
            "PROFILE_UPDATE", "CONTACT_UPDATE", "EMAIL_UPDATE", "PHONE_UPDATE",
            "SECURITY_QUESTION_UPDATE", "TWO_FACTOR_ENABLED", "TWO_FACTOR_DISABLED",
            "FOREX_TRANSACTION", "INVESTMENT_PURCHASE", "INVESTMENT_SALE",
            "TAX_PAYMENT", "INSURANCE_PAYMENT", "UTILITY_PAYMENT"
        };
        String[] statuses = {"SUCCESS", "FAILED", "PENDING", "COMPLETED", "REJECTED", "CANCELLED"};
        String[] eventTypes = {
            "AUTHENTICATION", "TRANSACTION", "ACCOUNT_MANAGEMENT", "SECURITY", 
            "CARD_MANAGEMENT", "LOAN_MANAGEMENT", "BILL_PAYMENT", "FUND_TRANSFER",
            "MOBILE_BANKING", "INTERNET_BANKING", "PROFILE_MANAGEMENT", "INVESTMENT",
            "FOREX", "TAX", "INSURANCE", "UTILITY"
        };
        String[] services = {
            "authentication-service", "transaction-service", "account-service", "customer-service",
            "card-service", "loan-service", "bill-payment-service", "fund-transfer-service",
            "mobile-banking-service", "internet-banking-service", "investment-service",
            "forex-service", "tax-service", "insurance-service", "utility-service"
        };

        // Generate comprehensive audit data
        for (int i = 0; i < 100; i++) {
            AuditEvent event = new AuditEvent();
            event.setAuditId("AUD-" + System.currentTimeMillis() + "-" + i);
            event.setUserId((long) (random.nextInt(20) + 1));
            event.setCustomerId((long) (random.nextInt(20) + 1));
            
            // Select random action
            String action = actions[random.nextInt(actions.length)];
            event.setAction(action);
            
            // Set IP and user agent
            event.setIpAddress("192.168.1." + (random.nextInt(254) + 1));
            event.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            // Random timestamp within last 90 days
            event.setTimestamp(LocalDateTime.now().minusDays(random.nextInt(90))
                .minusHours(random.nextInt(24)).minusMinutes(random.nextInt(60)));
            
            // Set status based on action
            if (action.contains("FAILED") || action.contains("BOUNCE") || action.contains("REJECTED")) {
                event.setStatus("FAILED");
            } else if (action.contains("PENDING")) {
                event.setStatus("PENDING");
            } else if (action.contains("SUCCESS") || action.contains("COMPLETED") || action.contains("APPROVED")) {
                event.setStatus("SUCCESS");
            } else {
                event.setStatus(statuses[random.nextInt(statuses.length)]);
            }
            
            // Set event type and service name based on action
            if (action.contains("LOGIN") || action.contains("LOGOUT") || action.contains("PASSWORD")) {
                event.setEventType("AUTHENTICATION");
                event.setServiceName("authentication-service");
            } else if (action.contains("TRANSACTION") || action.contains("TRANSFER") || action.contains("DEPOSIT") || action.contains("WITHDRAWAL")) {
                event.setEventType("TRANSACTION");
                event.setServiceName("transaction-service");
            } else if (action.contains("ACCOUNT")) {
                event.setEventType("ACCOUNT_MANAGEMENT");
                event.setServiceName("account-service");
            } else if (action.contains("CARD")) {
                event.setEventType("CARD_MANAGEMENT");
                event.setServiceName("card-service");
            } else if (action.contains("LOAN")) {
                event.setEventType("LOAN_MANAGEMENT");
                event.setServiceName("loan-service");
            } else if (action.contains("BILL")) {
                event.setEventType("BILL_PAYMENT");
                event.setServiceName("bill-payment-service");
            } else if (action.contains("MOBILE") || action.contains("INTERNET")) {
                event.setEventType("DIGITAL_BANKING");
                event.setServiceName("digital-banking-service");
            } else {
                event.setEventType(eventTypes[random.nextInt(eventTypes.length)]);
                event.setServiceName(services[random.nextInt(services.length)]);
            }
            
            // Create realistic payload
            String payload = createRealisticPayload(action, random);
            event.setPayload(payload);
            event.setCorrelationId("CORR-" + System.currentTimeMillis() + "-" + i);
            
            auditRepository.save(event);
        }
    }
    
    private String createRealisticPayload(String action, Random random) {
        StringBuilder payload = new StringBuilder();
        payload.append("{");
        
        switch (action) {
            case "ACCOUNT_CREATE":
                payload.append("\"accountType\":\"SAVINGS\",");
                payload.append("\"accountNumber\":\"").append(random.nextInt(900000000) + 100000000).append("\",");
                payload.append("\"initialDeposit\":").append(random.nextInt(50000) + 1000).append(",");
                payload.append("\"branchCode\":\"BR001\"");
                break;
            case "TRANSACTION_SUCCESS":
            case "FUND_TRANSFER_SUCCESS":
                payload.append("\"fromAccount\":\"ACC").append(random.nextInt(900000) + 100000).append("\",");
                payload.append("\"toAccount\":\"ACC").append(random.nextInt(900000) + 100000).append("\",");
                payload.append("\"amount\":").append(random.nextInt(100000) + 100).append(",");
                payload.append("\"currency\":\"USD\",");
                payload.append("\"reference\":\"TXN").append(System.currentTimeMillis() + random.nextInt(1000)).append("\"");
                break;
            case "TRANSACTION_FAILED":
            case "FUND_TRANSFER_FAILED":
                payload.append("\"fromAccount\":\"ACC").append(random.nextInt(900000) + 100000).append("\",");
                payload.append("\"toAccount\":\"ACC").append(random.nextInt(900000) + 100000).append("\",");
                payload.append("\"amount\":").append(random.nextInt(100000) + 100).append(",");
                payload.append("\"currency\":\"USD\",");
                payload.append("\"failureReason\":\"INSUFFICIENT_BALANCE\"");
                break;
            case "CARD_REQUEST":
                payload.append("\"cardType\":\"DEBIT\",");
                payload.append("\"cardBrand\":\"VISA\",");
                payload.append("\"cardNumber\":\"XXXX-XXXX-XXXX-").append(random.nextInt(9000) + 1000).append("\"");
                break;
            case "LOAN_APPROVED":
                payload.append("\"loanType\":\"PERSONAL\",");
                payload.append("\"loanAmount\":").append(random.nextInt(500000) + 50000).append(",");
                payload.append("\"interestRate\":").append(random.nextFloat() * 5 + 8).append(",");
                payload.append("\"tenureMonths\":").append(random.nextInt(60) + 12);
                break;
            case "BILL_PAYMENT_SUCCESS":
                payload.append("\"billType\":\"ELECTRICITY\",");
                payload.append("\"billAmount\":").append(random.nextInt(5000) + 100).append(",");
                payload.append("\"billNumber\":\"BILL").append(random.nextInt(900000) + 100000).append("\",");
                payload.append("\"provider\":\"ELECTRIC_CO\"");
                break;
            case "LOGIN":
                payload.append("\"loginMethod\":\"PASSWORD\",");
                payload.append("\"device\":\"DESKTOP\",");
                payload.append("\"location\":\"Mumbai, India\"");
                break;
            case "PASSWORD_CHANGE":
                payload.append("\"changeReason\":\"SECURITY_UPDATE\",");
                payload.append("\"device\":\"MOBILE\",");
                payload.append("\"previousPasswordHash\":\"****\"");
                break;
            default:
                payload.append("\"action\":\"").append(action).append("\",");
                payload.append("\"timestamp\":\"").append(LocalDateTime.now()).append("\",");
                payload.append("\"userId\":").append(random.nextInt(20) + 1);
        }
        
        payload.append("}");
        return payload.toString();
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        List<AuditEvent> allLogs = auditRepository.findAll();
        
        long totalLogs = allLogs.size();

        // Calculate metrics based on actual data
        metrics.put("totalTransactions", 
                allLogs.stream().filter(l -> "TRANSFER".equals(l.getAction()) || "TRANSACTION".equals(l.getAction())).count());
        metrics.put("totalUsers", allLogs.stream().map(AuditEvent::getUserId).distinct().count());
        metrics.put("totalCustomers", allLogs.stream().map(AuditEvent::getCustomerId).distinct().count());
        metrics.put("totalAccounts", 1500); // Placeholder - would come from account service
        metrics.put("activeSessions", 50); // Placeholder - would come from session management
        metrics.put("failedLogins", 
                allLogs.stream().filter(l -> "FAILED".equals(l.getStatus()) && "USER_LOGIN".equals(l.getAction())).count());
        metrics.put("totalLogs", totalLogs);
        metrics.put("systemUptime", "5 days, 12:30:45"); // Placeholder - would come from system metrics
        metrics.put("lastBackup", LocalDateTime.now().minusDays(1).withHour(2).withMinute(0).withSecond(0).toString()); // Placeholder

        return metrics;
    }
}
