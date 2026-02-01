package com.bank.authentication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/status")
    public Map<String, Object> healthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "authentication-service");
        status.put("status", "UP");
        status.put("timestamp", Instant.now());
        status.put("port", 9093);
        return status;
    }

    @GetMapping("/database")
    public Map<String, Object> databaseHealth() {
        Map<String, Object> health = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            health.put("status", "UP");
            health.put("database", "authdb");
            health.put("connection", connection.isValid(2) ? "VALID" : "INVALID");
            health.put("timestamp", Instant.now());
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("timestamp", Instant.now());
        }
        return health;
    }

    @GetMapping("/kafka")
    public Map<String, Object> kafkaHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("bootstrap-servers", "localhost:9092");
        health.put("timestamp", Instant.now());
        return health;
    }

    @GetMapping("/full")
    public Map<String, Object> fullHealthCheck() {
        Map<String, Object> fullHealth = new HashMap<>();
        fullHealth.put("service", healthStatus());
        fullHealth.put("database", databaseHealth());
        fullHealth.put("kafka", kafkaHealth());
        fullHealth.put("timestamp", Instant.now());
        return fullHealth;
    }
}
