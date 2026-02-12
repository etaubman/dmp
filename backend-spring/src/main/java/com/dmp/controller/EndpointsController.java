package com.dmp.controller;

import com.dmp.dto.EndpointOut;
import com.dmp.service.EndpointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** API/service endpoints by domain and application. */
@RestController
@RequestMapping("/api/endpoints")
@Tag(name = "endpoints", description = "Endpoint catalog")
public class EndpointsController {

    private final EndpointService endpointService;

    public EndpointsController(EndpointService endpointService) {
        this.endpointService = endpointService;
    }

    @GetMapping
    @Operation(summary = "List endpoints", description = "Endpoints optionally filtered by domain_id and application_id; scope owned | all")
    public ResponseEntity<List<EndpointOut>> listEndpoints(
            @RequestParam(required = false) Integer domain_id,
            @RequestParam(required = false) Integer application_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<EndpointOut> list = endpointService.listEndpoints(domain_id, application_id, scope);
        return ResponseEntity.ok(list);
    }
}
