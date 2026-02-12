package com.dmp.controller;

import com.dmp.dto.EndpointOut;
import com.dmp.service.EndpointService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/endpoints")
public class EndpointsController {

    private final EndpointService endpointService;

    public EndpointsController(EndpointService endpointService) {
        this.endpointService = endpointService;
    }

    @GetMapping
    public ResponseEntity<List<EndpointOut>> listEndpoints(
            @RequestParam(required = false) Integer domain_id,
            @RequestParam(required = false) Integer application_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<EndpointOut> list = endpointService.listEndpoints(domain_id, application_id, scope);
        return ResponseEntity.ok(list);
    }
}
