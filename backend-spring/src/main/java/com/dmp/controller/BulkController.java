package com.dmp.controller;

import com.dmp.service.BulkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/** Bulk CSV upload and download for supported entity types. */
@RestController
@RequestMapping("/api/bulk")
@Tag(name = "bulk", description = "Bulk CSV upload and export")
public class BulkController {

    private final BulkService bulkService;

    public BulkController(BulkService bulkService) {
        this.bulkService = bulkService;
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload CSV", description = "Upload CSV for a supported entity_type; returns created/updated counts and any row errors")
    public Map<String, Object> upload(
            @RequestParam("entity_type") String entityType,
            @RequestParam("file") MultipartFile file) throws IOException {
        return bulkService.upload(entityType, file);
    }

    @GetMapping("/download")
    @Operation(summary = "Download CSV", description = "Export entities as CSV; domain_id optional for scoped types")
    public ResponseEntity<String> download(
            @RequestParam("entity_type") String entityType,
            @RequestParam(required = false) Integer domain_id) throws IOException {
        String csv = bulkService.download(entityType, domain_id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + entityType + ".csv")
                .body(csv);
    }
}
