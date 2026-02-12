package com.dmp.service;

import com.dmp.dto.MetricsOut;
import com.dmp.repository.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    private final DomainRepository domainRepository;
    private final DataElementRepository dataElementRepository;
    private final ApplicationRepository applicationRepository;
    private final EUCRepository eucRepository;
    private final EndpointRepository endpointRepository;
    private final DataQualityRuleRepository dataQualityRuleRepository;
    private final DataQualityExceptionRepository dataQualityExceptionRepository;
    private final DataConcernRepository dataConcernRepository;

    public MetricsService(DomainRepository domainRepository, DataElementRepository dataElementRepository,
                          ApplicationRepository applicationRepository, EUCRepository eucRepository,
                          EndpointRepository endpointRepository, DataQualityRuleRepository dataQualityRuleRepository,
                          DataQualityExceptionRepository dataQualityExceptionRepository,
                          DataConcernRepository dataConcernRepository) {
        this.domainRepository = domainRepository;
        this.dataElementRepository = dataElementRepository;
        this.applicationRepository = applicationRepository;
        this.eucRepository = eucRepository;
        this.endpointRepository = endpointRepository;
        this.dataQualityRuleRepository = dataQualityRuleRepository;
        this.dataQualityExceptionRepository = dataQualityExceptionRepository;
        this.dataConcernRepository = dataConcernRepository;
    }

    public MetricsOut getMetrics(Integer domainId) {
        MetricsOut out = new MetricsOut(domainId);
        if (domainId == null) {
            out.setDomainsCount((int) domainRepository.count());
            out.setDataElementsCount((int) dataElementRepository.count());
            out.setApplicationsCount((int) applicationRepository.count());
            out.setEucsCount((int) eucRepository.count());
            out.setEndpointsCount((int) endpointRepository.count());
            out.setDataQualityRulesCount((int) dataQualityRuleRepository.count());
            out.setDataQualityExceptionsCount((int) dataQualityExceptionRepository.count());
            out.setDataConcernsCount((int) dataConcernRepository.count());
        } else {
            out.setDataElementsCount(dataElementRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)).size());
            out.setApplicationsCount(applicationRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)).size());
            out.setEucsCount(eucRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)).size());
            out.setEndpointsCount(endpointRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)).size());
            out.setDataQualityRulesCount((int) dataQualityRuleRepository.countByDomainId(domainId));
            out.setDataQualityExceptionsCount((int) dataQualityExceptionRepository.countByRuleDomainId(domainId));
            out.setDataConcernsCount(dataConcernRepository.findByDomainIdOrderByTitleAsc(domainId).size());
        }
        return out;
    }
}
