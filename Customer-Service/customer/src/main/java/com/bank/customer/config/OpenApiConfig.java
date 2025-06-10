package com.bank.customer.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customerAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("Customer API")
                        .version("1.0.0")
                        .description("API for managing customers"))
                .externalDocs(new ExternalDocumentation()
                        .description("Full API Documentation")
                        .url("http://localhost:9094/swagger-ui/index.html"));
    }
}
