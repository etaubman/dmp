package com.dmp.repository;

import com.dmp.model.DataQualityRuleInstance;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface DataQualityRuleInstanceRepository extends JpaRepository<DataQualityRuleInstance, Integer> {

    @Query("SELECT i FROM DataQualityRuleInstance i WHERE " +
           "(:ruleId IS NULL OR i.ruleId = :ruleId) AND " +
           "(:dataElementId IS NULL OR i.dataElementId = :dataElementId) AND " +
           "(:applicationId IS NULL OR i.applicationId = :applicationId) AND " +
           "i.runAt >= COALESCE(:fromDate, i.runAt) AND " +
           "i.runAt <= COALESCE(:toDate, i.runAt) " +
           "ORDER BY i.runAt DESC")
    List<DataQualityRuleInstance> findWithFilters(@Param("ruleId") Integer ruleId,
                                                   @Param("dataElementId") Integer dataElementId,
                                                   @Param("applicationId") Integer applicationId,
                                                   @Param("fromDate") OffsetDateTime fromDate,
                                                   @Param("toDate") OffsetDateTime toDate,
                                                   Pageable pageable);

    List<DataQualityRuleInstance> findByRuleIdOrderByRunAtDesc(Integer ruleId, Pageable pageable);

    List<DataQualityRuleInstance> findByRuleIdAndDataElementIdOrderByRunAtDesc(Integer ruleId, Integer dataElementId, Pageable pageable);

    List<DataQualityRuleInstance> findByRuleIdAndApplicationIdOrderByRunAtDesc(Integer ruleId, Integer applicationId, Pageable pageable);

    long countByRuleId(Integer ruleId);

    java.util.Optional<DataQualityRuleInstance> findTop1ByRuleIdOrderByRunAtDesc(Integer ruleId);
}
