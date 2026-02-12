package com.dmp.service;

import com.dmp.model.Domain;
import com.dmp.repository.DomainRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Shared domain-scope resolution: owned, upstream, downstream.
 * Used by domain-scoped list APIs (applications, eucs, endpoints, etc.).
 */
@Service
public class DomainScopeService {

    private final DomainRepository domainRepository;

    public DomainScopeService(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    /**
     * Resolve domain IDs to filter by: owned (this domain), upstream (parent), downstream (children).
     */
    public List<Integer> domainIdsForScope(int domainId, String scope) {
        if ("owned".equals(scope)) {
            return List.of(domainId);
        }
        Domain domain = domainRepository.findById(domainId).orElse(null);
        if (domain == null) {
            return Collections.emptyList();
        }
        if ("upstream".equals(scope)) {
            return domain.getParentId() != null ? List.of(domain.getParentId()) : Collections.emptyList();
        }
        if ("downstream".equals(scope)) {
            return domainRepository.findByParentIdOrderByNameAsc(domainId).stream()
                    .map(Domain::getId)
                    .collect(Collectors.toList());
        }
        return List.of(domainId);
    }
}
