package com.dmp.service;

import com.dmp.dto.ApplicationOut;
import com.dmp.model.Application;
import com.dmp.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final DomainScopeService domainScopeService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              DomainScopeService domainScopeService) {
        this.applicationRepository = applicationRepository;
        this.domainScopeService = domainScopeService;
    }

    public List<ApplicationOut> listApplications(int domainId, String scope) {
        List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
        if (domainIds.isEmpty()) {
            return new ArrayList<>();
        }
        return applicationRepository.findByDomainIdInOrderByNameAsc(domainIds).stream()
                .map(this::toOut)
                .toList();
    }

    private ApplicationOut toOut(Application a) {
        return new ApplicationOut(a.getId(), a.getDomainId(), a.getName(), a.getDescription(),
                a.getCreatedAt(), a.getUpdatedAt());
    }
}
