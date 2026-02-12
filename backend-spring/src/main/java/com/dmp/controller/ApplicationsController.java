package com.dmp.controller;

import com.dmp.dto.ApplicationOut;
import com.dmp.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Applications by domain and scope. */
@RestController
@RequestMapping("/api/applications")
@Tag(name = "applications", description = "Application catalog")
public class ApplicationsController {

    private final ApplicationService applicationService;

    public ApplicationsController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    @Operation(summary = "List applications", description = "Applications for the given domain and scope (owned | all)")
    public ResponseEntity<List<ApplicationOut>> listApplications(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<ApplicationOut> list = applicationService.listApplications(domain_id, scope);
        return ResponseEntity.ok(list);
    }
}
