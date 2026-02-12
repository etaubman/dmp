package com.dmp.repository;

import com.dmp.model.Application;

import java.util.List;

public interface ApplicationRepository extends org.springframework.data.jpa.repository.JpaRepository<Application, Integer> {

    List<Application> findByDomainIdInOrderByNameAsc(List<Integer> domainIds);

    List<Application> findAllByOrderByNameAsc();
}
