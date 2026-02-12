package com.dmp.service;

import com.dmp.dto.DataConcernOut;
import com.dmp.model.DataConcern;
import com.dmp.repository.DataConcernRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DataConcernService {

    private final DataConcernRepository concernRepository;

    public DataConcernService(DataConcernRepository concernRepository) {
        this.concernRepository = concernRepository;
    }

    public List<DataConcernOut> listDataConcerns(int domainId, Integer applicationId, Integer eucId, Integer endpointId, Integer dataElementId) {
        List<DataConcern> list = concernRepository.findByDomainIdOrderByTitleAsc(domainId);
        return list.stream()
                .filter(c -> applicationId == null || (c.getApplicationId() != null && c.getApplicationId().equals(applicationId)))
                .filter(c -> eucId == null || (c.getEucId() != null && c.getEucId().equals(eucId)))
                .filter(c -> endpointId == null || (c.getEndpointId() != null && c.getEndpointId().equals(endpointId)))
                .filter(c -> dataElementId == null || (c.getDataElementId() != null && c.getDataElementId().equals(dataElementId)))
                .map(this::toOut)
                .collect(Collectors.toList());
    }

    private DataConcernOut toOut(DataConcern c) {
        return new DataConcernOut(c.getId(), c.getDomainId(), c.getApplicationId(), c.getEucId(), c.getEndpointId(),
                c.getDataElementId(), c.getTitle(), c.getDescription(), c.getStatus(), c.getCreatedAt(), c.getUpdatedAt());
    }
}
