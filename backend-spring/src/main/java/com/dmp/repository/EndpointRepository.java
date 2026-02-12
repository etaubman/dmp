package com.dmp.repository;

import com.dmp.model.Endpoint;

import java.util.List;

public interface EndpointRepository extends org.springframework.data.jpa.repository.JpaRepository<Endpoint, Integer> {

    List<Endpoint> findByDomainIdInOrderByNameAsc(List<Integer> domainIds);

    List<Endpoint> findByApplicationIdOrderByNameAsc(Integer applicationId);

    List<Endpoint> findByDomainIdInAndApplicationIdOrderByNameAsc(List<Integer> domainIds, Integer applicationId);

    List<Endpoint> findAllByOrderByNameAsc();
}
