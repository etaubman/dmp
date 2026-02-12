package com.dmp.controller;

import com.dmp.dto.DomainOut;
import com.dmp.model.Domain;
import com.dmp.repository.DomainRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "domains", description = "Domain hierarchy (L0–L3)")
public class DomainsController {

    private final DomainRepository domainRepository;

    public DomainsController(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    @GetMapping("/domains")
    @Operation(summary = "List all domains", description = "Returns all domains ordered by name (for selector / current domain)")
    public List<DomainOut> listDomains() {
        return domainRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDomainOut)
                .collect(Collectors.toList());
    }

    private DomainOut toDomainOut(Domain d) {
        return new DomainOut(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getParentId(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
