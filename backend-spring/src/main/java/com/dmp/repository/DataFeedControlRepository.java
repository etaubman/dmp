package com.dmp.repository;

import com.dmp.model.DataFeedControl;

import java.util.List;

public interface DataFeedControlRepository extends org.springframework.data.jpa.repository.JpaRepository<DataFeedControl, Integer> {

    List<DataFeedControl> findByDataFeedId(Integer dataFeedId);
}
