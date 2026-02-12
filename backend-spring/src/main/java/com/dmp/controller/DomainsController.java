package com.dmp.controller;

import com.dmp.dto.DomainCreate;
import com.dmp.dto.DomainOut;
import com.dmp.dto.DomainTreeOut;
import com.dmp.dto.DomainUpdate;
import com.dmp.model.Domain;
import com.dmp.repository.DomainRepository;
import com.dmp.service.DomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "domains", description = "Domain hierarchy (L0–L3)")
public class DomainsController {

    private final DomainRepository domainRepository;
    private final DomainService domainService;

    public DomainsController(DomainRepository domainRepository, DomainService domainService) {
        this.domainRepository = domainRepository;
        this.domainService = domainService;
    }

    @GetMapping("/domain-tree")
    @Operation(summary = "Domain tree", description = "Returns domain hierarchy as a tree (L0→L1→L2→L3)")
    public List<DomainTreeOut> getDomainTree() {
        return domainService.getDomainTree();
    }

    @GetMapping("/domains")
    @Operation(summary = "List all domains", description = "Returns all domains ordered by name")
    public List<DomainOut> listDomains() {
        return domainRepository.findAllByOrderByNameAsc().stream()
                .map(domainService::toDomainOut)
                .collect(Collectors.toList());
    }

    @GetMapping("/domains/{domainId}")
    @Operation(summary = "Get domain", description = "Returns a single domain by id")
    public DomainOut getDomain(@PathVariable int domainId) {
        return domainService.getDomain(domainId);
    }

    @PostMapping("/domains")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create domain", description = "Creates a new domain; parent_id optional (null = L0)")
    public DomainOut createDomain(@Valid @RequestBody DomainCreate body) {
        return domainService.createDomain(body);
    }

    @PatchMapping("/domains/{domainId}")
    @Operation(summary = "Update domain", description = "Updates a domain; validates no circular parent and max depth")
    public DomainOut updateDomain(@PathVariable int domainId, @RequestBody DomainUpdate body) {
        return domainService.updateDomain(domainId, body);
    }

    @DeleteMapping("/domains/{domainId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete domain", description = "Deletes a domain only if it has no children and no related data")
    public void deleteDomain(@PathVariable int domainId) {
        domainService.deleteDomain(domainId);
    }
}
