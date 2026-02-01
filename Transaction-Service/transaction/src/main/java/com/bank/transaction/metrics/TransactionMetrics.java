package com.bank.transaction.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.function.Supplier;

@Component
public class TransactionMetrics {

    private final Counter transactionCounter;
    private final Counter transactionSuccessCounter;
    private final Counter transactionFailureCounter;
    private final Timer transactionTimer;
    private final MeterRegistry meterRegistry;

    @Autowired
    public TransactionMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.transactionCounter = Counter.builder("transactions.total")
                .description("Total number of transactions")
                .register(meterRegistry);
        
        this.transactionSuccessCounter = Counter.builder("transactions.success")
                .description("Number of successful transactions")
                .register(meterRegistry);
        
        this.transactionFailureCounter = Counter.builder("transactions.failure")
                .description("Number of failed transactions")
                .register(meterRegistry);
        
        this.transactionTimer = Timer.builder("transactions.duration")
                .description("Transaction processing time")
                .register(meterRegistry);
    }

    public void incrementTransactionCounter() {
        transactionCounter.increment();
    }

    public void incrementSuccessCounter() {
        transactionSuccessCounter.increment();
    }

    public void incrementFailureCounter() {
        transactionFailureCounter.increment();
    }

    public <T> T recordTransactionTime(Supplier<T> supplier) {
        long startTime = System.nanoTime();
        incrementTransactionCounter();
        try {
            T result = supplier.get();
            long endTime = System.nanoTime();
            long duration = endTime - startTime;
            transactionTimer.record(duration, java.util.concurrent.TimeUnit.NANOSECONDS);
            incrementSuccessCounter();
            return result;
        } catch (Exception e) {
            incrementFailureCounter();
            throw e;
        }
    }

    public void recordTransactionTime(Duration duration, boolean success) {
        transactionTimer.record(duration);
        incrementTransactionCounter();
        if (success) {
            incrementSuccessCounter();
        } else {
            incrementFailureCounter();
        }
    }
}
