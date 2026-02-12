package com.dmp.repository;

import com.dmp.model.RuleModRequest;

import java.util.List;

public interface RuleModRequestRepository extends org.springframework.data.jpa.repository.JpaRepository<RuleModRequest, Integer> {

    List<RuleModRequest> findByRuleIdOrderByRequestedAtDesc(Integer ruleId);
}
