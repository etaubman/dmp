package com.dmp.repository;

import com.dmp.model.DataConcern;

import java.util.List;

public interface DataConcernRepository extends org.springframework.data.jpa.repository.JpaRepository<DataConcern, Integer> {

    List<DataConcern> findByDomainIdOrderByTitleAsc(Integer domainId);
}
