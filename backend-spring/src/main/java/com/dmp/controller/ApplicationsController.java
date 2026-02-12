package com.dmp.controller;

import com.dmp.dto.ApplicationOut;
import com.dmp.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationsController {

    private final ApplicationService applicationService;

    public ApplicationsController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationOut>> listApplications(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<ApplicationOut> list = applicationService.listApplications(domain_id, scope);
        return ResponseEntity.ok(list);
    }
}
