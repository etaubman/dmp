package com.dmp.repository;

import com.dmp.model.DataFeed;

import java.util.List;

public interface DataFeedRepository extends org.springframework.data.jpa.repository.JpaRepository<DataFeed, Integer> {

    List<DataFeed> findByDomainIdInOrderByNameAsc(List<Integer> domainIds);
}
