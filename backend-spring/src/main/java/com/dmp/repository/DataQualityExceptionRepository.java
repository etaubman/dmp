package com.dmp.repository;

import com.dmp.model.DataQualityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DataQualityExceptionRepository extends JpaRepository<DataQualityException, Integer> {

    @Query(value = "SELECT COUNT(*) FROM data_quality_exceptions e " +
                   "JOIN data_quality_rules r ON e.rule_id = r.id WHERE r.domain_id = :domainId", nativeQuery = true)
    long countByRuleDomainId(@Param("domainId") Integer domainId);

    List<DataQualityException> findByDataElementIdOrderByIdentifiedAtDesc(Integer dataElementId);

    List<DataQualityException> findByRuleIdInOrderByIdentifiedAtDesc(List<Integer> ruleIds);
}
