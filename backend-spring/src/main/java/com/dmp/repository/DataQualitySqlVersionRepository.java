package com.dmp.repository;

import com.dmp.model.DataQualitySqlVersion;

import java.util.List;

public interface DataQualitySqlVersionRepository extends org.springframework.data.jpa.repository.JpaRepository<DataQualitySqlVersion, Integer> {

    List<DataQualitySqlVersion> findByRuleIdOrderByVersionDesc(Integer ruleId);

    long countByRuleId(Integer ruleId);

    java.util.Optional<DataQualitySqlVersion> findByRuleIdAndIsLive(Integer ruleId, Integer isLive);
}
