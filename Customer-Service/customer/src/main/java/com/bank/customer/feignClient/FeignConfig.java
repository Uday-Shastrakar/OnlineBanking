package com.bank.customer.feignClient;


import com.bank.customer.session.UserSession;
import com.bank.customer.session.UserThreadLocalContext;
import feign.RequestInterceptor;
import feign.RequestTemplate;
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
                } else {
                    System.err.println("UserSession is null in Feign interceptor");
                }
            }
        };
    }
}
