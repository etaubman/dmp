package com.dmp.repository;

import com.dmp.model.DataElementSOR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DataElementSORRepository extends JpaRepository<DataElementSOR, Integer> {

    @Query("SELECT sor FROM DataElementSOR sor WHERE sor.dataElementId IN " +
           "(SELECT de.id FROM DataElement de WHERE de.domainId IN :domainIds) " +
           "ORDER BY sor.dataElementId, sor.applicationId")
    List<DataElementSOR> findByDataElementDomainIdIn(@Param("domainIds") List<Integer> domainIds);

    List<DataElementSOR> findByDataElementIdOrderByApplicationIdAsc(Integer dataElementId);
}
