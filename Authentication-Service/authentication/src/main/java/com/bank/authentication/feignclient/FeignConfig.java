package com.bank.authentication.feignclient;

import com.bank.authentication.session.UserSession;
import com.bank.authentication.session.UserThreadLocalContext;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import feign.Retryer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                UserSession session = UserThreadLocalContext.getUserSession();
                if (session != null) {
                    template.header("userId", session.userId().toString());
                    template.header("email", session.email());
                }
                // For admin dashboard calls, UserSession might be null
                // Don't add headers if session is not available
            }
        };
    }

    @Bean
    public feign.Request.Options requestOptions() {
        return new feign.Request.Options(30 * 1000, 60 * 1000); // connect timeout, read timeout in milliseconds
    }

    @Bean
    public Retryer retryer() {
        // Retry up to 3 times with 1 second delay between retries
        return new Retryer.Default(1000, 1000, 3);
    }
}
