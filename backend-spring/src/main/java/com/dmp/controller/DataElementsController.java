package com.dmp.controller;

import com.dmp.dto.*;
import com.dmp.service.DataElementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-elements")
public class DataElementsController {

    private final DataElementService dataElementService;

    public DataElementsController(DataElementService dataElementService) {
        this.dataElementService = dataElementService;
    }

    @GetMapping("/sor")
    public ResponseEntity<List<DataElementSORSummaryOut>> listSor(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataElementService.listSorByDomain(domain_id, scope));
    }

    @GetMapping("/{dataElementId}/lineage-applications")
    public ResponseEntity<List<LineageApplicationOut>> getLineageApplications(@PathVariable int dataElementId) {
        return ResponseEntity.ok(dataElementService.getLineageApplications(dataElementId));
    }

    @GetMapping("/{dataElementId}/lineage")
    public LineageResponse getLineage(@PathVariable int dataElementId) {
        return dataElementService.getLineage(dataElementId);
    }

    @GetMapping("/{dataElementId}/sor")
    public ResponseEntity<List<DataElementSOROut>> getElementSor(@PathVariable int dataElementId) {
        return ResponseEntity.ok(dataElementService.getElementSor(dataElementId));
    }

    @GetMapping
    public ResponseEntity<List<DataElementOut>> listDataElements(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataElementService.listDataElements(domain_id, scope));
    }
}
