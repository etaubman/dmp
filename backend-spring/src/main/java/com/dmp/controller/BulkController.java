package com.dmp.controller;

import com.dmp.service.BulkService;
import com.opencsv.exceptions.CsvException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/bulk")
public class BulkController {

    private final BulkService bulkService;

    public BulkController(BulkService bulkService) {
        this.bulkService = bulkService;
    }

    @PostMapping("/upload")
    public Map<String, Object> upload(
            @RequestParam("entity_type") String entityType,
            @RequestParam("file") MultipartFile file) throws IOException, CsvException {
        return bulkService.upload(entityType, file);
    }

    @GetMapping("/download")
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
