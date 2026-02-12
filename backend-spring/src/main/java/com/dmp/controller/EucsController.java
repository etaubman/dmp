package com.dmp.controller;

import com.dmp.dto.EUCOut;
import com.dmp.service.EUCService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** End-user computing (EUC) catalog by domain/scope. */
@RestController
@RequestMapping("/api/eucs")
@Tag(name = "eucs", description = "EUC catalog")
public class EucsController {

    private final EUCService eucService;

    public EucsController(EUCService eucService) {
        this.eucService = eucService;
    }

    @GetMapping
    @Operation(summary = "List EUCs", description = "EUCs for the given domain and scope (owned | all)")
    public ResponseEntity<List<EUCOut>> listEucs(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<EUCOut> list = eucService.listEucs(domain_id, scope);
        return ResponseEntity.ok(list);
    }
}
