package com.dmp.controller;

import com.dmp.dto.DataConcernOut;
import com.dmp.service.DataConcernService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Data concerns (issues/risks) with optional filters. */
@RestController
@RequestMapping("/api/data-concerns")
@Tag(name = "data-concerns", description = "Data concern catalog")
public class DataConcernsController {

    private final DataConcernService dataConcernService;

    public DataConcernsController(DataConcernService dataConcernService) {
        this.dataConcernService = dataConcernService;
    }

    @GetMapping
    @Operation(summary = "List data concerns", description = "Concerns for the domain; optional filters by application, EUC, endpoint, data element")
    public ResponseEntity<List<DataConcernOut>> listDataConcerns(
            @RequestParam int domain_id,
            @RequestParam(required = false) Integer application_id,
            @RequestParam(required = false) Integer euc_id,
            @RequestParam(required = false) Integer endpoint_id,
            @RequestParam(required = false) Integer data_element_id) {
        return ResponseEntity.ok(dataConcernService.listDataConcerns(domain_id, application_id, euc_id, endpoint_id, data_element_id));
    }
}
