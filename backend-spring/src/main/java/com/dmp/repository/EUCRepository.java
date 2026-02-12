package com.dmp.repository;

import com.dmp.model.EUC;

import java.util.List;

public interface EUCRepository extends org.springframework.data.jpa.repository.JpaRepository<EUC, Integer> {

    List<EUC> findByDomainIdInOrderByNameAsc(List<Integer> domainIds);

    List<EUC> findAllByOrderByNameAsc();
}
