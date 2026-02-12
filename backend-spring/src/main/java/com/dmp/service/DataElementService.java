package com.dmp.service;

import com.dmp.dto.*;
import com.dmp.model.*;
import com.dmp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DataElementService {

    private final DataElementRepository dataElementRepository;
    private final DataElementSORRepository sorRepository;
    private final DataQualityRuleRepository ruleRepository;
    private final DataConcernRepository concernRepository;
    private final DomainRepository domainRepository;
    private final ApplicationRepository applicationRepository;
    private final EndpointRepository endpointRepository;
    private final DomainScopeService domainScopeService;

    public DataElementService(DataElementRepository dataElementRepository, DataElementSORRepository sorRepository,
                              DataQualityRuleRepository ruleRepository, DataConcernRepository concernRepository,
                              DomainRepository domainRepository, ApplicationRepository applicationRepository,
                              EndpointRepository endpointRepository, DomainScopeService domainScopeService) {
        this.dataElementRepository = dataElementRepository;
        this.sorRepository = sorRepository;
        this.ruleRepository = ruleRepository;
        this.concernRepository = concernRepository;
        this.domainRepository = domainRepository;
        this.applicationRepository = applicationRepository;
        this.endpointRepository = endpointRepository;
        this.domainScopeService = domainScopeService;
    }

    public List<DataElementOut> listDataElements(int domainId, String scope) {
        List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
        if (domainIds.isEmpty()) return List.of();
        return dataElementRepository.findByDomainIdInOrderByNameAsc(domainIds).stream()
                .map(this::toOut).toList();
    }

    public List<DataElementSORSummaryOut> listSorByDomain(int domainId, String scope) {
        List<Integer> domainIds = domainScopeService.domainIdsForScope(domainId, scope);
        if (domainIds.isEmpty()) return List.of();
        List<DataElementSOR> sors = sorRepository.findByDataElementDomainIdIn(domainIds);
        List<DataElementSORSummaryOut> out = new ArrayList<>();
        for (DataElementSOR sor : sors) {
            Application app = applicationRepository.findById(sor.getApplicationId()).orElse(null);
            out.add(new DataElementSORSummaryOut(sor.getDataElementId(), sor.getApplicationId(),
                    app != null ? app.getName() : null, sor.getPhysicalDataAttribute()));
        }
        return out;
    }

    public List<DataElementSOROut> getElementSor(int dataElementId) {
        DataElement de = dataElementRepository.findById(dataElementId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data element not found"));
        List<DataElementSOR> sors = sorRepository.findByDataElementIdOrderByApplicationIdAsc(dataElementId);
        List<DataElementSOROut> out = new ArrayList<>();
        for (DataElementSOR sor : sors) {
            Application app = applicationRepository.findById(sor.getApplicationId()).orElse(null);
            out.add(new DataElementSOROut(sor.getApplicationId(), app != null ? app.getName() : null, sor.getPhysicalDataAttribute()));
        }
        return out;
    }

    public List<LineageApplicationOut> getLineageApplications(int dataElementId) {
        dataElementRepository.findById(dataElementId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data element not found"));
        Set<String> seen = new HashSet<>();
        List<LineageApplicationOut> out = new ArrayList<>();

        List<DataElementSOR> sors = sorRepository.findByDataElementIdOrderByApplicationIdAsc(dataElementId);
        for (DataElementSOR sor : sors) {
            String key = sor.getApplicationId() + ":sor";
            if (!seen.contains(key)) {
                seen.add(key);
                Application app = applicationRepository.findById(sor.getApplicationId()).orElse(null);
                out.add(new LineageApplicationOut(sor.getApplicationId(), app != null ? app.getName() : "?", "sor"));
            }
        }

        List<DataQualityRule> rules = ruleRepository.findByDataElementIdOrderByNameAsc(dataElementId);
        for (DataQualityRule rule : rules) {
            if (rule.getEndpointId() == null) continue;
            Endpoint ep = endpointRepository.findById(rule.getEndpointId()).orElse(null);
            if (ep == null || ep.getApplicationId() == null) continue;
            String key = ep.getApplicationId() + ":endpoint";
            if (!seen.contains(key)) {
                seen.add(key);
                Application app = applicationRepository.findById(ep.getApplicationId()).orElse(null);
                out.add(new LineageApplicationOut(ep.getApplicationId(), app != null ? app.getName() : "?", "endpoint"));
            }
        }
        return out;
    }

    public LineageResponse getLineage(int dataElementId) {
        DataElement de = dataElementRepository.findById(dataElementId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data element not found"));

        List<LineageNode> nodes = new ArrayList<>();
        List<LineageEdge> edges = new ArrayList<>();
        String centerId = "de-" + de.getId();

        Map<String, Object> deData = new HashMap<>();
        deData.put("id", de.getId()); deData.put("name", de.getName()); deData.put("description", de.getDescription());
        deData.put("element_type", de.getElementType()); deData.put("domain_id", de.getDomainId());
        nodes.add(new LineageNode(centerId, "data_element", de.getName(), deData));

        Domain domain = domainRepository.findById(de.getDomainId()).orElse(null);
        if (domain != null) {
            String domainId = "domain-" + domain.getId();
            Map<String, Object> domData = new HashMap<>();
            domData.put("id", domain.getId()); domData.put("name", domain.getName()); domData.put("description", domain.getDescription());
            domData.put("parent_id", domain.getParentId());
            nodes.add(new LineageNode(domainId, "domain", domain.getName(), domData));
            edges.add(new LineageEdge("e-domain-" + domain.getId() + "-de-" + de.getId(), domainId, centerId, "upstream"));
        }

        for (DataQualityRule r : ruleRepository.findByDataElementIdOrderByNameAsc(dataElementId)) {
            String ruleId = "rule-" + r.getId();
            Map<String, Object> rData = new HashMap<>();
            rData.put("id", r.getId()); rData.put("name", r.getName()); rData.put("description", r.getDescription());
            rData.put("rule_type", r.getRuleType()); rData.put("data_element_id", r.getDataElementId()); rData.put("endpoint_id", r.getEndpointId());
            nodes.add(new LineageNode(ruleId, "dq_rule", r.getName(), rData));
            edges.add(new LineageEdge("e-de-" + de.getId() + "-rule-" + r.getId(), centerId, ruleId, "downstream"));

            if (r.getEndpointId() != null) {
                Endpoint ep = endpointRepository.findById(r.getEndpointId()).orElse(null);
                if (ep != null) {
                    String epId = "endpoint-" + ep.getId();
                    if (nodes.stream().noneMatch(n -> n.getId().equals(epId))) {
                        Map<String, Object> epData = new HashMap<>();
                        epData.put("id", ep.getId()); epData.put("name", ep.getName()); epData.put("description", ep.getDescription());
                        epData.put("domain_id", ep.getDomainId()); epData.put("application_id", ep.getApplicationId());
                        nodes.add(new LineageNode(epId, "endpoint", ep.getName(), epData));
                    }
                    edges.add(new LineageEdge("e-rule-" + r.getId() + "-endpoint-" + ep.getId(), ruleId, epId, "downstream"));
                }
            }
        }

        for (DataConcern c : concernRepository.findByDomainIdOrderByTitleAsc(de.getDomainId()).stream()
                .filter(c -> Objects.equals(c.getDataElementId(), dataElementId)).toList()) {
            String concernId = "concern-" + c.getId();
            Map<String, Object> cData = new HashMap<>();
            cData.put("id", c.getId()); cData.put("title", c.getTitle()); cData.put("description", c.getDescription());
            cData.put("status", c.getStatus()); cData.put("domain_id", c.getDomainId()); cData.put("application_id", c.getApplicationId());
            cData.put("euc_id", c.getEucId()); cData.put("endpoint_id", c.getEndpointId()); cData.put("data_element_id", c.getDataElementId());
            nodes.add(new LineageNode(concernId, "data_concern", c.getTitle(), cData));
            edges.add(new LineageEdge("e-de-" + de.getId() + "-concern-" + c.getId(), centerId, concernId, "downstream"));
        }

        return new LineageResponse(nodes, edges);
    }

    private DataElementOut toOut(DataElement de) {
        return new DataElementOut(de.getId(), de.getDomainId(), de.getName(), de.getDescription(), de.getElementType(),
                de.getCreatedAt(), de.getUpdatedAt());
    }
}
