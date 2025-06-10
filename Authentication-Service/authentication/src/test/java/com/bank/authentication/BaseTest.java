package com.bank.authentication;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public abstract class BaseTest {
    @BeforeEach
    void initMocks() {
        MockitoAnnotations.openMocks(this);
    }
}
