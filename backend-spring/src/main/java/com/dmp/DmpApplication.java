package com.dmp;

import com.dmp.config.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Data Manager Portal (DMP) Spring Boot application entry point.
 * Provides REST API, JWT auth, JPA persistence, and optional S3/MinIO integration.
 */
@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
public class DmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(DmpApplication.class, args);
    }
}
