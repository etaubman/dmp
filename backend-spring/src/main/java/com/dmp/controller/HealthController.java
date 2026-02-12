package com.dmp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

/**
 * Liveness and readiness probes plus root info. No auth required.
 */
@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /** Liveness: application is up. */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    /** Readiness: app and DB are reachable. Returns 503 if DB check fails. */
    @GetMapping("/ready")
    public ResponseEntity<Map<String, String>> ready() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().executeQuery("SELECT 1");
            return ResponseEntity.ok(Map.of("status", "ready"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "not ready", "error", e.getMessage() != null ? e.getMessage() : "Database unavailable"));
        }
    }

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of("message", "Data Manager Portal API", "docs", "/swagger-ui.html");
    }
}
