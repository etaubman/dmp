package com.dmp.service;

import com.dmp.dto.*;
import com.dmp.model.*;
import com.dmp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DataFeedService {

    private final DataFeedRepository feedRepository;
    private final DataFeedDataElementRepository feedElementRepository;
    private final DataFeedControlRepository controlRepository;
    private final ApplicationRepository applicationRepository;
    private final DataElementRepository dataElementRepository;
    private final DomainScopeService domainScopeService;

    public DataFeedService(DataFeedRepository feedRepository, DataFeedDataElementRepository feedElementRepository,
                          DataFeedControlRepository controlRepository, ApplicationRepository applicationRepository,
                          DataElementRepository dataElementRepository, DomainScopeService domainScopeService) {
        this.feedRepository = feedRepository;
        this.feedElementRepository = feedElementRepository;
        this.controlRepository = controlRepository;
        this.applicationRepository = applicationRepository;
        this.dataElementRepository = dataElementRepository;
        this.domainScopeService = domainScopeService;
    }

    public List<DataFeedOut> listDataFeeds(int domainId, String scope) {
        List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
        if (domainIds.isEmpty()) return List.of();
        List<DataFeed> feeds = feedRepository.findByDomainIdInOrderByNameAsc(domainIds);
        List<DataFeedOut> out = new ArrayList<>();
        for (DataFeed f : feeds) {
            int elemCount = feedElementRepository.findByDataFeedId(f.getId()).size();
            int ctrlCount = controlRepository.findByDataFeedId(f.getId()).size();
            String producerName = f.getProducerApplicationId() != null ? applicationRepository.findById(f.getProducerApplicationId()).map(Application::getName).orElse(null) : null;
            String consumerName = f.getConsumerApplicationId() != null ? applicationRepository.findById(f.getConsumerApplicationId()).map(Application::getName).orElse(null) : null;
            DataFeedOut dto = new DataFeedOut();
            dto.setId(f.getId()); dto.setDomainId(f.getDomainId()); dto.setName(f.getName()); dto.setDescription(f.getDescription());
            dto.setSourceType(f.getSourceType()); dto.setFormat(f.getFormat()); dto.setTransmissionMethod(f.getTransmissionMethod());
            dto.setProducerApplicationId(f.getProducerApplicationId()); dto.setConsumerApplicationId(f.getConsumerApplicationId());
            dto.setCreatedAt(f.getCreatedAt()); dto.setUpdatedAt(f.getUpdatedAt());
            dto.setDataElementCount(elemCount); dto.setControlCount(ctrlCount);
            dto.setProducerApplicationName(producerName); dto.setConsumerApplicationName(consumerName);
            out.add(dto);
        }
        return out;
    }

    public DataFeedDetailOut getDataFeed(int dataFeedId) {
        DataFeed feed = feedRepository.findById(dataFeedId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data feed not found"));

        List<DataFeedDataElement> links = feedElementRepository.findByDataFeedId(dataFeedId);
        List<DataFeedDataElementRefOut> elements = new ArrayList<>();
        for (DataFeedDataElement link : links) {
            DataElement de = dataElementRepository.findById(link.getDataElementId()).orElse(null);
            elements.add(new DataFeedDataElementRefOut(link.getDataElementId(),
                    de != null ? de.getName() : null,
                    de != null ? de.getDescription() : null));
        }

        List<DataFeedControl> controls = controlRepository.findByDataFeedId(dataFeedId);
        List<DataFeedControlOut> controlOuts = controls.stream()
                .map(c -> new DataFeedControlOut(c.getId(), c.getDataFeedId(), c.getControlType(), c.getName(), c.getDescription()))
                .toList();

        DataFeedDetailOut detail = new DataFeedDetailOut();
        detail.setId(feed.getId()); detail.setDomainId(feed.getDomainId()); detail.setName(feed.getName());
        detail.setDescription(feed.getDescription()); detail.setSourceType(feed.getSourceType());
        detail.setFormat(feed.getFormat()); detail.setTransmissionMethod(feed.getTransmissionMethod());
        detail.setProducerApplicationId(feed.getProducerApplicationId());
        detail.setConsumerApplicationId(feed.getConsumerApplicationId());
        detail.setCreatedAt(feed.getCreatedAt()); detail.setUpdatedAt(feed.getUpdatedAt());
        detail.setDataElementCount(links.size()); detail.setControlCount(controls.size());
        detail.setProducerApplicationName(feed.getProducerApplicationId() != null ? applicationRepository.findById(feed.getProducerApplicationId()).map(Application::getName).orElse(null) : null);
        detail.setConsumerApplicationName(feed.getConsumerApplicationId() != null ? applicationRepository.findById(feed.getConsumerApplicationId()).map(Application::getName).orElse(null) : null);
        detail.setDataElements(elements);
        detail.setControls(controlOuts);
        return detail;
    }
}
