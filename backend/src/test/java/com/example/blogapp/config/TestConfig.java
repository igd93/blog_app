package com.example.blogapp.config;

import com.example.blogapp.util.TestKeyGenerator;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public String jwtSecret() {
        return TestKeyGenerator.generateJwtTestKey();
    }
}