package com.bank.transaction.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return Health.up()
                        .withDetail("database", "transaction")
                        .withDetail("validation", "PASSED")
                        .build();
            } else {
                return Health.down()
                        .withDetail("database", "transaction")
                        .withDetail("validation", "FAILED")
                        .withDetail("reason", "Connection validation failed")
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "transaction")
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}
