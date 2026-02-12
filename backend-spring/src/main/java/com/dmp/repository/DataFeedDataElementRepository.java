package com.dmp.repository;

import com.dmp.model.DataFeedDataElement;

import java.util.List;

public interface DataFeedDataElementRepository extends org.springframework.data.jpa.repository.JpaRepository<DataFeedDataElement, Integer> {

    List<DataFeedDataElement> findByDataFeedId(Integer dataFeedId);
}
