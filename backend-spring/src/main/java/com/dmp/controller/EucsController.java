package com.dmp.controller;

import com.dmp.dto.EUCOut;
import com.dmp.service.EUCService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eucs")
public class EucsController {

    private final EUCService eucService;

    public EucsController(EUCService eucService) {
        this.eucService = eucService;
    }

    @GetMapping
    public ResponseEntity<List<EUCOut>> listEucs(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        List<EUCOut> list = eucService.listEucs(domain_id, scope);
        return ResponseEntity.ok(list);
    }
}
