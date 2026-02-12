package com.dmp.controller;

import com.dmp.dto.*;
import com.dmp.service.DataElementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Data elements, SOR views, and lineage. */
@RestController
@RequestMapping("/api/data-elements")
@Tag(name = "data-elements", description = "Data element catalog, SOR, lineage")
public class DataElementsController {

    private final DataElementService dataElementService;

    public DataElementsController(DataElementService dataElementService) {
        this.dataElementService = dataElementService;
    }

    @GetMapping("/sor")
    @Operation(summary = "List SOR summary", description = "Source-of-record summary by domain and scope")
    public ResponseEntity<List<DataElementSORSummaryOut>> listSor(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataElementService.listSorByDomain(domain_id, scope));
    }

    @GetMapping("/{dataElementId}/lineage-applications")
    @Operation(summary = "Lineage applications", description = "Applications involved in lineage for this data element")
    public ResponseEntity<List<LineageApplicationOut>> getLineageApplications(@PathVariable int dataElementId) {
        return ResponseEntity.ok(dataElementService.getLineageApplications(dataElementId));
    }

    @GetMapping("/{dataElementId}/lineage")
    @Operation(summary = "Lineage graph", description = "Nodes and edges for lineage visualization")
    public LineageResponse getLineage(@PathVariable int dataElementId) {
        return dataElementService.getLineage(dataElementId);
    }

    @GetMapping("/{dataElementId}/sor")
    @Operation(summary = "Element SOR", description = "Source-of-record detail for this data element")
    public ResponseEntity<List<DataElementSOROut>> getElementSor(@PathVariable int dataElementId) {
        return ResponseEntity.ok(dataElementService.getElementSor(dataElementId));
    }

    @GetMapping
    @Operation(summary = "List data elements", description = "Elements for the given domain and scope (owned | all)")
    public ResponseEntity<List<DataElementOut>> listDataElements(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataElementService.listDataElements(domain_id, scope));
    }
}
