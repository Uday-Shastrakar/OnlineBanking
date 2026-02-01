package com.bank.transaction.config;

import feign.Retryer;
import feign.Request;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class FeignConfig {

    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
            10 * 1000,  // Connect timeout: 10 seconds
            30 * 1000   // Read timeout: 30 seconds
        );
    }

    @Bean
    public Retryer retryer() {
        // Retry up to 3 times with 1 second delay between retries
        return new Retryer.Default(1000, 1000, 3);
    }

    @Bean
    public feign.Logger.Level feignLoggerLevel() {
        return feign.Logger.Level.BASIC;
    }

    @Bean
    public feign.codec.ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }
}
