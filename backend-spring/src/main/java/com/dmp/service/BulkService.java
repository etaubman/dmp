package com.dmp.service;

import com.dmp.exception.BadRequestException;
import com.dmp.model.*;
import com.dmp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.*;

import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class BulkService {

    private final DomainRepository domainRepository;
    private final DataElementRepository dataElementRepository;
    private final ApplicationRepository applicationRepository;
    private final EUCRepository eucRepository;
    private final EndpointRepository endpointRepository;
    private final DataQualityRuleRepository ruleRepository;
    private final DataQualityExceptionRepository exceptionRepository;
    private final DataConcernRepository concernRepository;
    private final S3Service s3Service;

    private static final Map<String, EntityHandler> HANDLERS = new HashMap<>();

    public BulkService(DomainRepository domainRepository, DataElementRepository dataElementRepository,
                      ApplicationRepository applicationRepository, EUCRepository eucRepository,
                      EndpointRepository endpointRepository, DataQualityRuleRepository ruleRepository,
                      DataQualityExceptionRepository exceptionRepository, DataConcernRepository concernRepository,
                      S3Service s3Service) {
        this.domainRepository = domainRepository;
        this.dataElementRepository = dataElementRepository;
        this.applicationRepository = applicationRepository;
        this.eucRepository = eucRepository;
        this.endpointRepository = endpointRepository;
        this.ruleRepository = ruleRepository;
        this.exceptionRepository = exceptionRepository;
        this.concernRepository = concernRepository;
        this.s3Service = s3Service;
        initHandlers();
    }

    private void initHandlers() {
        HANDLERS.put("domains", new DomainHandler());
        HANDLERS.put("data_elements", new DataElementHandler());
        HANDLERS.put("applications", new ApplicationHandler());
        HANDLERS.put("eucs", new EucHandler());
        HANDLERS.put("endpoints", new EndpointHandler());
        HANDLERS.put("data_quality_rules", new DataQualityRuleHandler());
        HANDLERS.put("data_quality_exceptions", new DataQualityExceptionHandler());
        HANDLERS.put("data_concerns", new DataConcernHandler());
    }

    public static Set<String> getSupportedEntityTypes() {
        return HANDLERS.keySet();
    }

    @Transactional
    public Map<String, Object> upload(String entityType, MultipartFile file) throws IOException {
        EntityHandler handler = HANDLERS.get(entityType);
        if (handler == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Unknown entity_type: " + entityType);
        }

        byte[] content = file.getBytes();
        String text;
        try {
            text = new String(content, StandardCharsets.UTF_8);
        } catch (Exception e) {
            text = new String(content, StandardCharsets.UTF_8);
        }

        s3Service.upload(entityType, file.getOriginalFilename(), content, file.getContentType());

        List<Map<String, String>> rows;
        try (CSVReader reader = new CSVReader(new InputStreamReader(new java.io.ByteArrayInputStream(content), StandardCharsets.UTF_8))) {
            List<String[]> all = reader.readAll();
            if (all.isEmpty()) {
                return Map.of("created", 0, "updated", 0, "errors", List.<Map<String, Object>>of());
            }
            String[] headers = all.get(0);
            rows = new ArrayList<>();
            for (int i = 1; i < all.size(); i++) {
                Map<String, String> row = new HashMap<>();
                for (int j = 0; j < headers.length; j++) {
                    row.put(headers[j], j < all.get(i).length ? all.get(i)[j] : "");
                }
                rows.add(row);
            }
        } catch (CsvException e) {
            throw new BadRequestException("Invalid CSV: " + (e.getMessage() != null ? e.getMessage() : "parse error"));
        }

        return handler.upsert(rows, this);
    }

    public String download(String entityType, Integer domainId) throws IOException {
        EntityHandler handler = HANDLERS.get(entityType);
        if (handler == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Unknown entity_type: " + entityType);
        }
        return handler.export(domainId, this);
    }

    private interface EntityHandler {
        Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc);
        String export(Integer domainId, BulkService svc);
    }

    private class DomainHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    String name = getRequired(row, "name");
                    String description = getOptional(row, "description");
                    Integer parentId = getOptionalInt(row, "parent_id");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0) {
                        var existing = domainRepository.findById(id);
                        if (existing.isPresent()) {
                            Domain d = existing.get();
                            d.setName(name);
                            d.setDescription(description);
                            d.setParentId(parentId);
                            domainRepository.save(d);
                            updated++;
                            continue;
                        }
                    }
                    Domain d = new Domain();
                    d.setName(name);
                    d.setDescription(description);
                    d.setParentId(parentId);
                    domainRepository.save(d);
                    created++;
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<Domain> list = domainRepository.findAllByOrderByNameAsc();
            return toCsv(list, "id", "name", "description", "parent_id", "created_at", "updated_at",
                    d -> List.of(str(d.getId()), d.getName(), d.getDescription(), str(d.getParentId()), str(d.getCreatedAt()), str(d.getUpdatedAt())));
        }
    }

    private class DataElementHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    int domainId = getRequiredInt(row, "domain_id");
                    String name = getRequired(row, "name");
                    String description = getOptional(row, "description");
                    String elementType = getOptional(row, "element_type");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && dataElementRepository.existsById(id)) {
                        DataElement de = dataElementRepository.findById(id).orElseThrow();
                        de.setDomainId(domainId);
                        de.setName(name);
                        de.setDescription(description);
                        de.setElementType(elementType);
                        dataElementRepository.save(de);
                        updated++;
                    } else {
                        DataElement de = new DataElement();
                        de.setDomainId(domainId);
                        de.setName(name);
                        de.setDescription(description);
                        de.setElementType(elementType);
                        dataElementRepository.save(de);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<DataElement> list = domainId != null ? dataElementRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)) : dataElementRepository.findAllByOrderByNameAsc();
            return toCsv(list, "id", "domain_id", "name", "description", "element_type", "created_at", "updated_at",
                    de -> List.of(str(de.getId()), str(de.getDomainId()), de.getName(), de.getDescription(), de.getElementType(), str(de.getCreatedAt()), str(de.getUpdatedAt())));
        }
    }

    private class ApplicationHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    int domainId = getRequiredInt(row, "domain_id");
                    String name = getRequired(row, "name");
                    String description = getOptional(row, "description");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && applicationRepository.existsById(id)) {
                        Application a = applicationRepository.findById(id).orElseThrow();
                        a.setDomainId(domainId);
                        a.setName(name);
                        a.setDescription(description);
                        applicationRepository.save(a);
                        updated++;
                    } else {
                        Application a = new Application();
                        a.setDomainId(domainId);
                        a.setName(name);
                        a.setDescription(description);
                        applicationRepository.save(a);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<Application> list = domainId != null ? applicationRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)) : applicationRepository.findAllByOrderByNameAsc();
            return toCsv(list, "id", "domain_id", "name", "description", "created_at", "updated_at",
                    a -> List.of(str(a.getId()), str(a.getDomainId()), a.getName(), a.getDescription(), str(a.getCreatedAt()), str(a.getUpdatedAt())));
        }
    }

    private class EucHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    int domainId = getRequiredInt(row, "domain_id");
                    String name = getRequired(row, "name");
                    String description = getOptional(row, "description");
                    String eucType = getOptional(row, "euc_type");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && eucRepository.existsById(id)) {
                        EUC e = eucRepository.findById(id).orElseThrow();
                        e.setDomainId(domainId);
                        e.setName(name);
                        e.setDescription(description);
                        e.setEucType(eucType);
                        eucRepository.save(e);
                        updated++;
                    } else {
                        EUC e = new EUC();
                        e.setDomainId(domainId);
                        e.setName(name);
                        e.setDescription(description);
                        e.setEucType(eucType);
                        eucRepository.save(e);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<EUC> list = domainId != null ? eucRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)) : eucRepository.findAllByOrderByNameAsc();
            return toCsv(list, "id", "domain_id", "name", "description", "euc_type", "created_at", "updated_at",
                    e -> List.of(str(e.getId()), str(e.getDomainId()), e.getName(), e.getDescription(), e.getEucType(), str(e.getCreatedAt()), str(e.getUpdatedAt())));
        }
    }

    private class EndpointHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    String name = getRequired(row, "name");
                    Integer domainId = getOptionalInt(row, "domain_id");
                    Integer applicationId = getOptionalInt(row, "application_id");
                    String description = getOptional(row, "description");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && endpointRepository.existsById(id)) {
                        Endpoint e = endpointRepository.findById(id).orElseThrow();
                        e.setDomainId(domainId);
                        e.setApplicationId(applicationId);
                        e.setName(name);
                        e.setDescription(description);
                        endpointRepository.save(e);
                        updated++;
                    } else {
                        Endpoint e = new Endpoint();
                        e.setDomainId(domainId);
                        e.setApplicationId(applicationId);
                        e.setName(name);
                        e.setDescription(description);
                        endpointRepository.save(e);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<Endpoint> list = domainId != null ? endpointRepository.findByDomainIdInOrderByNameAsc(List.of(domainId)) : endpointRepository.findAllByOrderByNameAsc();
            return toCsv(list, "id", "domain_id", "application_id", "name", "description", "created_at", "updated_at",
                    e -> List.of(str(e.getId()), str(e.getDomainId()), str(e.getApplicationId()), e.getName(), e.getDescription(), str(e.getCreatedAt()), str(e.getUpdatedAt())));
        }
    }

    private class DataQualityRuleHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    String name = getRequired(row, "name");
                    Integer domainId = getOptionalInt(row, "domain_id");
                    Integer dataElementId = getOptionalInt(row, "data_element_id");
                    Integer endpointId = getOptionalInt(row, "endpoint_id");
                    String description = getOptional(row, "description");
                    String ruleType = getOptional(row, "rule_type");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && ruleRepository.existsById(id)) {
                        DataQualityRule r = ruleRepository.findById(id).orElseThrow();
                        r.setName(name);
                        r.setDomainId(domainId);
                        r.setDataElementId(dataElementId);
                        r.setEndpointId(endpointId);
                        r.setDescription(description);
                        r.setRuleType(ruleType);
                        ruleRepository.save(r);
                        updated++;
                    } else {
                        DataQualityRule r = new DataQualityRule();
                        r.setName(name);
                        r.setDomainId(domainId);
                        r.setDataElementId(dataElementId);
                        r.setEndpointId(endpointId);
                        r.setDescription(description);
                        r.setRuleType(ruleType);
                        ruleRepository.save(r);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<DataQualityRule> list = domainId != null ? ruleRepository.findByDomainIdOrderByNameAsc(domainId) : ruleRepository.findAll().stream().sorted(Comparator.comparing(DataQualityRule::getName)).toList();
            return toCsv(list, "id", "domain_id", "data_element_id", "endpoint_id", "name", "description", "rule_type", "exception_threshold_pct", "flagged_for_monitoring", "created_at", "updated_at",
                    r -> List.of(str(r.getId()), str(r.getDomainId()), str(r.getDataElementId()), str(r.getEndpointId()), r.getName(), r.getDescription(), r.getRuleType(), str(r.getExceptionThresholdPct()), str(r.getFlaggedForMonitoring()), str(r.getCreatedAt()), str(r.getUpdatedAt())));
        }
    }

    private class DataQualityExceptionHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    int ruleId = getRequiredInt(row, "rule_id");
                    Integer dataElementId = getOptionalInt(row, "data_element_id");
                    String description = getOptional(row, "description");
                    String status = getOptional(row, "status");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && exceptionRepository.existsById(id)) {
                        DataQualityException e = exceptionRepository.findById(id).orElseThrow();
                        e.setRuleId(ruleId);
                        e.setDataElementId(dataElementId);
                        e.setDescription(description);
                        e.setStatus(status);
                        exceptionRepository.save(e);
                        updated++;
                    } else {
                        DataQualityException e = new DataQualityException();
                        e.setRuleId(ruleId);
                        e.setDataElementId(dataElementId);
                        e.setDescription(description);
                        e.setStatus(status);
                        exceptionRepository.save(e);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<DataQualityException> list = exceptionRepository.findAll();
            return toCsv(list, "id", "rule_id", "data_element_id", "description", "status", "is_false_positive", "identified_at", "created_at",
                    e -> List.of(str(e.getId()), str(e.getRuleId()), str(e.getDataElementId()), e.getDescription(), e.getStatus(), str(e.getIsFalsePositive()), str(e.getIdentifiedAt()), str(e.getCreatedAt())));
        }
    }

    private class DataConcernHandler implements EntityHandler {
        @Override
        public Map<String, Object> upsert(List<Map<String, String>> rows, BulkService svc) {
            int created = 0, updated = 0;
            List<Map<String, Object>> errors = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                Map<String, String> row = rows.get(i);
                try {
                    int domainId = getRequiredInt(row, "domain_id");
                    String title = getRequired(row, "title");
                    Integer applicationId = getOptionalInt(row, "application_id");
                    Integer eucId = getOptionalInt(row, "euc_id");
                    Integer endpointId = getOptionalInt(row, "endpoint_id");
                    Integer dataElementId = getOptionalInt(row, "data_element_id");
                    String description = getOptional(row, "description");
                    String status = getOptional(row, "status");
                    Integer id = getOptionalInt(row, "id");
                    if (id != null && id > 0 && concernRepository.existsById(id)) {
                        DataConcern c = concernRepository.findById(id).orElseThrow();
                        c.setDomainId(domainId);
                        c.setTitle(title);
                        c.setApplicationId(applicationId);
                        c.setEucId(eucId);
                        c.setEndpointId(endpointId);
                        c.setDataElementId(dataElementId);
                        c.setDescription(description);
                        c.setStatus(status);
                        concernRepository.save(c);
                        updated++;
                    } else {
                        DataConcern c = new DataConcern();
                        c.setDomainId(domainId);
                        c.setTitle(title);
                        c.setApplicationId(applicationId);
                        c.setEucId(eucId);
                        c.setEndpointId(endpointId);
                        c.setDataElementId(dataElementId);
                        c.setDescription(description);
                        c.setStatus(status);
                        concernRepository.save(c);
                        created++;
                    }
                } catch (Exception e) {
                    errors.add(Map.of("row", i + 2, "error", e.getMessage()));
                }
            }
            return Map.of("created", created, "updated", updated, "errors", errors);
        }

        @Override
        public String export(Integer domainId, BulkService svc) {
            List<DataConcern> list = domainId != null ? concernRepository.findByDomainIdOrderByTitleAsc(domainId) : concernRepository.findAll().stream().sorted(Comparator.comparing(DataConcern::getTitle)).toList();
            return toCsv(list, "id", "domain_id", "application_id", "euc_id", "endpoint_id", "data_element_id", "title", "description", "status", "created_at", "updated_at",
                    c -> List.of(str(c.getId()), str(c.getDomainId()), str(c.getApplicationId()), str(c.getEucId()), str(c.getEndpointId()), str(c.getDataElementId()), c.getTitle(), c.getDescription(), c.getStatus(), str(c.getCreatedAt()), str(c.getUpdatedAt())));
        }
    }

    private String getRequired(Map<String, String> row, String key) {
        String v = row.get(key);
        if (v == null || v.isBlank()) throw new IllegalArgumentException("Missing required: " + key);
        return v.trim();
    }

    private String getOptional(Map<String, String> row, String key) {
        String v = row.get(key);
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    private int getRequiredInt(Map<String, String> row, String key) {
        return Integer.parseInt(getRequired(row, key));
    }

    private Integer getOptionalInt(Map<String, String> row, String key) {
        String v = getOptional(row, key);
        if (v == null) return null;
        try {
            return Integer.parseInt(v);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer for " + key + ": " + v);
        }
    }

    private String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    private <T> String toCsv(List<T> list, String[] headers, java.util.function.Function<T, List<String>> rowMapper) {
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw, ',', '\u0000', '\u0000', "\n")) {
            writer.writeNext(headers);
            for (T item : list) {
                writer.writeNext(rowMapper.apply(item).toArray(new String[0]));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return sw.toString();
    }

    private <T> String toCsv(List<T> list, String header1, String header2, String header3, String header4, String header5, String header6,
                            java.util.function.Function<T, List<String>> rowMapper) {
        return toCsv(list, new String[]{header1, header2, header3, header4, header5, header6}, rowMapper);
    }

    private <T> String toCsv(List<T> list, String h1, String h2, String h3, String h4, String h5, String h6, String h7,
                            java.util.function.Function<T, List<String>> rowMapper) {
        return toCsv(list, new String[]{h1, h2, h3, h4, h5, h6, h7}, rowMapper);
    }

    private <T> String toCsv(List<T> list, String h1, String h2, String h3, String h4, String h5, String h6, String h7, String h8,
                            java.util.function.Function<T, List<String>> rowMapper) {
        return toCsv(list, new String[]{h1, h2, h3, h4, h5, h6, h7, h8}, rowMapper);
    }

    private <T> String toCsv(List<T> list, String h1, String h2, String h3, String h4, String h5, String h6, String h7, String h8, String h9, String h10, String h11,
                            java.util.function.Function<T, List<String>> rowMapper) {
        return toCsv(list, new String[]{h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11}, rowMapper);
    }

    private <T> String toCsv(List<T> list, String h1, String h2, String h3, String h4, String h5, String h6, String h7, String h8, String h9,
                            java.util.function.Function<T, List<String>> rowMapper) {
        return toCsv(list, new String[]{h1, h2, h3, h4, h5, h6, h7, h8, h9}, rowMapper);
    }
}
