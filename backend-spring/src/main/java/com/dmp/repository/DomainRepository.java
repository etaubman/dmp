package com.dmp.repository;

import com.dmp.model.Domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DomainRepository extends JpaRepository<Domain, Integer> {

    List<Domain> findAllByOrderByNameAsc();
}
