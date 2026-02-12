package com.dmp.repository;

import com.dmp.model.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DomainRepository extends JpaRepository<Domain, Integer> {

    List<Domain> findAllByOrderByNameAsc();

    List<Domain> findByParentIdIsNullOrderByNameAsc();

    List<Domain> findByParentIdOrderByNameAsc(Integer parentId);

    @Query(value = "SELECT (SELECT COUNT(*) FROM domains WHERE parent_id = :id) + " +
            "(SELECT COUNT(*) FROM data_elements WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM applications WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM eucs WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM endpoints WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM data_quality_rules WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM data_concerns WHERE domain_id = :id) + " +
            "(SELECT COUNT(*) FROM data_feeds WHERE domain_id = :id)", nativeQuery = true)
    long countRelatedData(@Param("id") int id);
}
