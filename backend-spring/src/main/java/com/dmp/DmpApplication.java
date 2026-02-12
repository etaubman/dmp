package com.dmp;

import com.dmp.config.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
public class DmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(DmpApplication.class, args);
    }
}
