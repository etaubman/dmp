package com.dmp.repository;

import com.dmp.model.DataElement;

import java.util.List;

public interface DataElementRepository extends org.springframework.data.jpa.repository.JpaRepository<DataElement, Integer> {

    List<DataElement> findByDomainIdInOrderByNameAsc(List<Integer> domainIds);

    List<DataElement> findAllByOrderByNameAsc();
}
