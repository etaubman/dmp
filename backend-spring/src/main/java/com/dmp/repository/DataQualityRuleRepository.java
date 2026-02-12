package com.dmp.repository;

import com.dmp.model.DataQualityRule;

import java.util.List;

public interface DataQualityRuleRepository extends org.springframework.data.jpa.repository.JpaRepository<DataQualityRule, Integer> {

    List<DataQualityRule> findByDataElementIdOrderByNameAsc(Integer dataElementId);

    long countByDomainId(Integer domainId);

    List<DataQualityRule> findByDomainIdOrderByNameAsc(Integer domainId);

    List<DataQualityRule> findByEndpointIdOrderByNameAsc(Integer endpointId);
}
