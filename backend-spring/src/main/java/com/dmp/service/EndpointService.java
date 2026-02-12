package com.dmp.service;

import com.dmp.dto.EndpointOut;
import com.dmp.model.Endpoint;
import com.dmp.repository.EndpointRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EndpointService {

    private final EndpointRepository endpointRepository;
    private final DomainScopeService domainScopeService;

    public EndpointService(EndpointRepository endpointRepository,
                           DomainScopeService domainScopeService) {
        this.endpointRepository = endpointRepository;
        this.domainScopeService = domainScopeService;
    }

    public List<EndpointOut> listEndpoints(Integer domainId, Integer applicationId, String scope) {
        if (domainId != null && applicationId != null) {
            List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
            if (domainIds.isEmpty()) {
                return new ArrayList<>();
            }
            return endpointRepository.findByDomainIdInAndApplicationIdOrderByNameAsc(domainIds, applicationId)
                    .stream().map(this::toOut).toList();
        }
        if (domainId != null) {
            List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
            if (domainIds.isEmpty()) {
                return new ArrayList<>();
            }
            return endpointRepository.findByDomainIdInOrderByNameAsc(domainIds).stream()
                    .map(this::toOut).toList();
        }
        if (applicationId != null) {
            return endpointRepository.findByApplicationIdOrderByNameAsc(applicationId).stream()
                    .map(this::toOut).toList();
        }
        return endpointRepository.findAllByOrderByNameAsc().stream()
                .map(this::toOut).toList();
    }

    private EndpointOut toOut(Endpoint e) {
        return new EndpointOut(e.getId(), e.getDomainId(), e.getApplicationId(), e.getName(), e.getDescription(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
