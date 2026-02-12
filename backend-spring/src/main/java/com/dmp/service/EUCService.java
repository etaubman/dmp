package com.dmp.service;

import com.dmp.dto.EUCOut;
import com.dmp.model.EUC;
import com.dmp.repository.EUCRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EUCService {

    private final EUCRepository eucRepository;
    private final DomainScopeService domainScopeService;

    public EUCService(EUCRepository eucRepository, DomainScopeService domainScopeService) {
        this.eucRepository = eucRepository;
        this.domainScopeService = domainScopeService;
    }

    public List<EUCOut> listEucs(int domainId, String scope) {
        List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
        if (domainIds.isEmpty()) {
            return new ArrayList<>();
        }
        return eucRepository.findByDomainIdInOrderByNameAsc(domainIds).stream()
                .map(this::toOut)
                .toList();
    }

    private EUCOut toOut(EUC e) {
        return new EUCOut(e.getId(), e.getDomainId(), e.getName(), e.getDescription(), e.getEucType(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
