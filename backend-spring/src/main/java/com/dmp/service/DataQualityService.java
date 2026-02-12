package com.dmp.service;

import com.dmp.dto.*;
import com.dmp.model.*;
import com.dmp.repository.*;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
public class DataQualityService {

    private final DataQualityRuleRepository ruleRepository;
    private final DataQualityExceptionRepository exceptionRepository;
    private final DataQualityRuleInstanceRepository instanceRepository;
    private final DataQualitySqlVersionRepository sqlVersionRepository;
    private final RuleModRequestRepository modRequestRepository;
    private final ApplicationRepository applicationRepository;
    private final EndpointRepository endpointRepository;
    private final SqlFormatterService sqlFormatterService;
    private final EntityManager entityManager;

    public DataQualityService(DataQualityRuleRepository ruleRepository,
                              DataQualityExceptionRepository exceptionRepository,
                              DataQualityRuleInstanceRepository instanceRepository,
                              DataQualitySqlVersionRepository sqlVersionRepository,
                              RuleModRequestRepository modRequestRepository,
                              ApplicationRepository applicationRepository,
                              EndpointRepository endpointRepository,
                              SqlFormatterService sqlFormatterService,
                              EntityManager entityManager) {
        this.ruleRepository = ruleRepository;
        this.exceptionRepository = exceptionRepository;
        this.instanceRepository = instanceRepository;
        this.sqlVersionRepository = sqlVersionRepository;
        this.modRequestRepository = modRequestRepository;
        this.applicationRepository = applicationRepository;
        this.endpointRepository = endpointRepository;
        this.sqlFormatterService = sqlFormatterService;
        this.entityManager = entityManager;
    }

    public List<DataQualityRuleOut> listRules(Integer domainId, Integer dataElementId, Integer endpointId) {
        List<DataQualityRule> list;
        if (domainId != null) list = ruleRepository.findByDomainIdOrderByNameAsc(domainId);
        else if (dataElementId != null) list = ruleRepository.findByDataElementIdOrderByNameAsc(dataElementId);
        else if (endpointId != null) list = ruleRepository.findByEndpointIdOrderByNameAsc(endpointId);
        else list = ruleRepository.findAll().stream().sorted(Comparator.comparing(DataQualityRule::getName)).toList();
        return list.stream().map(this::toRuleOut).toList();
    }

    public DataQualityRuleOut getRule(int ruleId) {
        DataQualityRule r = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data quality rule not found"));
        return toRuleOut(r);
    }

    @Transactional
    public DataQualityRuleOut createRule(DataQualityRuleCreate body) {
        DataQualityRule r = new DataQualityRule();
        r.setDomainId(body.getDomainId());
        r.setDataElementId(body.getDataElementId());
        r.setEndpointId(body.getEndpointId());
        r.setName(body.getName());
        r.setDescription(body.getDescription());
        r.setRuleType(body.getRuleType());
        r.setExceptionThresholdPct(body.getExceptionThresholdPct());
        r.setFlaggedForMonitoring(body.isFlaggedForMonitoring() ? 1 : 0);
        r = ruleRepository.save(r);
        entityManager.refresh(r);
        return toRuleOut(r);
    }

    @Transactional
    public DataQualityRuleOut updateRule(int ruleId, DataQualityRuleUpdate body) {
        DataQualityRule r = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Data quality rule not found"));
        if (body.hasNameUpdate()) r.setName(body.getName());
        if (body.hasDescriptionUpdate()) r.setDescription(body.getDescription());
        if (body.hasRuleTypeUpdate()) r.setRuleType(body.getRuleType());
        if (body.hasExceptionThresholdPctUpdate()) r.setExceptionThresholdPct(body.getExceptionThresholdPct());
        if (body.hasFlaggedUpdate()) r.setFlaggedForMonitoring(Boolean.TRUE.equals(body.getFlaggedForMonitoring()) ? 1 : 0);
        r = ruleRepository.save(r);
        return toRuleOut(r);
    }

    public List<DataQualityRuleInstanceOut> listInstances(Integer ruleId, Integer dataElementId, Integer applicationId,
                                                          OffsetDateTime fromDate, OffsetDateTime toDate, int limit) {
        List<DataQualityRuleInstance> list = instanceRepository.findWithFilters(
                ruleId, dataElementId, applicationId, fromDate, toDate,
                org.springframework.data.domain.PageRequest.of(0, Math.min(limit, 500)));
        return list.stream().map(this::toInstanceOut).toList();
    }

    @Transactional
    public DataQualityRuleInstanceOut createInstance(DataQualityRuleInstanceCreate body) {
        if (!ruleRepository.existsById(body.getRuleId()))
            throw new ResponseStatusException(BAD_REQUEST, "Rule not found");
        if (!applicationRepository.existsById(body.getApplicationId()))
            throw new ResponseStatusException(BAD_REQUEST, "Application not found");
        DataQualityRuleInstance inst = new DataQualityRuleInstance();
        inst.setRuleId(body.getRuleId());
        inst.setDataElementId(body.getDataElementId());
        inst.setApplicationId(body.getApplicationId());
        inst.setRunAt(OffsetDateTime.now(ZoneOffset.UTC));
        inst.setPassed(body.isPassed() ? 1 : 0);
        inst.setExceptionCount(body.getExceptionCount());
        inst.setExceptionPct(body.getExceptionPct());
        inst.setNotes(body.getNotes());
        inst.setSqlVersionId(body.getSqlVersionId());
        inst = instanceRepository.save(inst);
        entityManager.refresh(inst);
        return toInstanceOut(inst);
    }

    public DataQualityRuleInstanceDetailOut getInstance(int instanceId, boolean prettify) {
        DataQualityRuleInstance inst = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule instance not found"));
        DataQualityRuleInstanceDetailOut out = new DataQualityRuleInstanceDetailOut();
        toInstanceOut(inst, out);
        String sqlText;
        if (inst.getSqlVersionId() != null) {
            sqlText = sqlVersionRepository.findById(inst.getSqlVersionId()).map(DataQualitySqlVersion::getSqlText).orElse(null);
        } else {
            sqlText = sqlVersionRepository.findByRuleIdAndIsLive(inst.getRuleId(), 1).map(DataQualitySqlVersion::getSqlText).orElse(null);
        }
        out.setSqlText(sqlText);
        out.setSqlTextPrettified(prettify && sqlText != null ? sqlFormatterService.prettify(sqlText) : null);
        return out;
    }

    @Transactional
    public Map<String, Object> markInstanceFalsePositive(int instanceId) {
        DataQualityRuleInstance inst = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule instance not found"));
        inst.setMarkedFalsePositive(1);
        instanceRepository.save(inst);
        return Map.of("id", inst.getId(), "marked_false_positive", true);
    }

    public List<RuleInstanceCountOut> listInstanceCounts(int domainId) {
        List<DataQualityRule> rules = ruleRepository.findByDomainIdOrderByNameAsc(domainId);
        List<RuleInstanceCountOut> out = new ArrayList<>();
        for (DataQualityRule r : rules) {
            long count = instanceRepository.countByRuleId(r.getId());
            var latest = instanceRepository.findTop1ByRuleIdOrderByRunAtDesc(r.getId());
            out.add(new RuleInstanceCountOut(r.getId(), (int) count,
                    latest.map(i -> i.getPassed() != null && i.getPassed() == 1).orElse(null)));
        }
        return out;
    }

    public List<DataQualityExceptionOut> listExceptions(Integer domainId, Integer dataElementId) {
        List<DataQualityException> list;
        if (domainId != null) {
            List<Integer> ruleIds = ruleRepository.findByDomainIdOrderByNameAsc(domainId).stream()
                    .map(DataQualityRule::getId).toList();
            list = ruleIds.isEmpty() ? List.of() : exceptionRepository.findByRuleIdInOrderByIdentifiedAtDesc(ruleIds);
        } else if (dataElementId != null) {
            list = exceptionRepository.findByDataElementIdOrderByIdentifiedAtDesc(dataElementId);
        } else {
            list = exceptionRepository.findAll().stream()
                    .sorted(Comparator.comparing(DataQualityException::getIdentifiedAt,
                            Comparator.nullsLast(Comparator.reverseOrder()))).toList();
        }
        return list.stream().map(this::toExceptionOut).toList();
    }

    @Transactional
    public Map<String, Object> markExceptionFalsePositive(int exceptionId) {
        DataQualityException exc = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exception not found"));
        exc.setIsFalsePositive(1);
        exc.setMarkedAt(OffsetDateTime.now(ZoneOffset.UTC));
        exceptionRepository.save(exc);
        return Map.of("id", exc.getId(), "is_false_positive", true);
    }

    public List<DataQualitySqlVersionOut> listSqlVersions(int ruleId) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        return sqlVersionRepository.findByRuleIdOrderByVersionDesc(ruleId).stream()
                .map(this::toSqlVersionOut).toList();
    }

    @Transactional
    public DataQualitySqlVersionOut createSqlVersion(int ruleId, DataQualitySqlVersionCreate body) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        long maxV = sqlVersionRepository.countByRuleId(ruleId);
        int version = body.getVersion() != null ? body.getVersion() : (int) maxV + 1;
        if (body.isLive()) {
            sqlVersionRepository.findByRuleIdOrderByVersionDesc(ruleId).forEach(sv -> {
                sv.setIsLive(0);
                sqlVersionRepository.save(sv);
            });
        }
        DataQualitySqlVersion sv = new DataQualitySqlVersion();
        sv.setRuleId(ruleId);
        sv.setSqlText(body.getSqlText());
        sv.setVersion(version);
        sv.setIsLive(body.isLive() ? 1 : 0);
        sv = sqlVersionRepository.save(sv);
        entityManager.refresh(sv);
        return toSqlVersionOut(sv);
    }

    @Transactional
    public Map<String, Object> setSqlVersionLive(int ruleId, int versionId) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        DataQualitySqlVersion sv = sqlVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "SQL version not found"));
        if (!sv.getRuleId().equals(ruleId))
            throw new ResponseStatusException(BAD_REQUEST, "SQL version does not belong to this rule");
        sqlVersionRepository.findByRuleIdOrderByVersionDesc(ruleId).forEach(s -> {
            s.setIsLive(0);
            sqlVersionRepository.save(s);
        });
        sv.setIsLive(1);
        sqlVersionRepository.save(sv);
        return Map.of("id", sv.getId(), "is_live", true);
    }

    public DQPerformanceSummary getPerformance(int ruleId, Integer dataElementId, Integer applicationId) {
        DataQualityRule r = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        List<DataQualityRuleInstance> instances;
        var page = org.springframework.data.domain.PageRequest.of(0, 10);
        if (dataElementId != null && applicationId != null)
            instances = instanceRepository.findByRuleIdOrderByRunAtDesc(ruleId, page).stream()
                    .filter(i -> dataElementId.equals(i.getDataElementId()) && applicationId.equals(i.getApplicationId()))
                    .limit(10).toList();
        else if (dataElementId != null)
            instances = instanceRepository.findByRuleIdAndDataElementIdOrderByRunAtDesc(ruleId, dataElementId, page);
        else if (applicationId != null)
            instances = instanceRepository.findByRuleIdAndApplicationIdOrderByRunAtDesc(ruleId, applicationId, page);
        else
            instances = instanceRepository.findByRuleIdOrderByRunAtDesc(ruleId, page);

        DataQualityRuleInstance last = instances.isEmpty() ? null : instances.get(0);
        int appId = applicationId != null ? applicationId : (last != null && last.getApplicationId() != null ? last.getApplicationId() : 0);
        if (appId == 0 && r.getEndpointId() != null) {
            appId = endpointRepository.findById(r.getEndpointId()).map(ep -> ep.getApplicationId() != null ? ep.getApplicationId() : 0).orElse(0);
        }
        Integer deId = dataElementId != null ? dataElementId : (r.getDataElementId());
        DQPerformanceSummary sum = new DQPerformanceSummary();
        sum.setRuleId(ruleId);
        sum.setDataElementId(deId);
        sum.setApplicationId(appId);
        sum.setLastRunAt(last != null ? last.getRunAt() : null);
        sum.setLastPassed(last != null ? last.getPassed() != null && last.getPassed() == 1 : null);
        sum.setLastExceptionPct(last != null ? last.getExceptionPct() : null);
        sum.setThresholdPct(r.getExceptionThresholdPct());
        sum.setRecentRuns(instances.stream().map(this::toInstanceOut).toList());
        return sum;
    }

    public DQTrendResponse getTrend(int ruleId, Integer dataElementId, Integer applicationId,
                                    OffsetDateTime fromDate, OffsetDateTime toDate, int limit) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        List<DataQualityRuleInstance> list = instanceRepository.findWithFilters(
                ruleId, dataElementId, applicationId, fromDate, toDate,
                org.springframework.data.domain.PageRequest.of(0, Math.min(limit, 200)));
        Collections.reverse(list);
        List<DQTrendPoint> points = list.stream()
                .map(i -> new DQTrendPoint(i.getRunAt(), i.getPassed() != null && i.getPassed() == 1,
                        i.getExceptionPct(), i.getExceptionCount() != null ? i.getExceptionCount() : 0))
                .toList();
        int appId = applicationId != null ? applicationId : (list.isEmpty() ? 0 : list.get(0).getApplicationId());
        Integer deId = dataElementId != null ? dataElementId : (list.isEmpty() ? null : list.get(0).getDataElementId());
        DQTrendResponse res = new DQTrendResponse();
        res.setRuleId(ruleId);
        res.setDataElementId(deId);
        res.setApplicationId(appId);
        res.setPoints(points);
        return res;
    }

    @Transactional
    public RuleModRequestOut requestMod(int ruleId, Integer requestedBy) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        RuleModRequest req = new RuleModRequest();
        req.setRuleId(ruleId);
        req.setStatus("requested");
        req.setRequestedBy(requestedBy);
        req = modRequestRepository.save(req);
        entityManager.refresh(req);
        return toModRequestOut(req);
    }

    public List<RuleModRequestOut> listModRequests(int ruleId) {
        ruleRepository.findById(ruleId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        return modRequestRepository.findByRuleIdOrderByRequestedAtDesc(ruleId).stream()
                .map(this::toModRequestOut).toList();
    }

    @Transactional
    public Map<String, Object> flagForMonitoring(int ruleId, boolean flagged) {
        DataQualityRule r = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Rule not found"));
        r.setFlaggedForMonitoring(flagged ? 1 : 0);
        ruleRepository.save(r);
        return Map.of("id", r.getId(), "flagged_for_monitoring", flagged);
    }

    private DataQualityRuleOut toRuleOut(DataQualityRule r) {
        DataQualityRuleOut out = new DataQualityRuleOut();
        out.setId(r.getId());
        out.setDomainId(r.getDomainId());
        out.setDataElementId(r.getDataElementId());
        out.setEndpointId(r.getEndpointId());
        out.setName(r.getName());
        out.setDescription(r.getDescription());
        out.setRuleType(r.getRuleType());
        out.setExceptionThresholdPct(r.getExceptionThresholdPct());
        out.setFlaggedForMonitoring(r.getFlaggedForMonitoring() != null && r.getFlaggedForMonitoring() == 1);
        out.setCreatedAt(r.getCreatedAt());
        out.setUpdatedAt(r.getUpdatedAt());
        return out;
    }

    private DataQualityRuleInstanceOut toInstanceOut(DataQualityRuleInstance i) {
        DataQualityRuleInstanceOut out = new DataQualityRuleInstanceOut();
        toInstanceOut(i, out);
        return out;
    }

    private void toInstanceOut(DataQualityRuleInstance i, DataQualityRuleInstanceOut out) {
        out.setId(i.getId());
        out.setRuleId(i.getRuleId());
        out.setDataElementId(i.getDataElementId());
        out.setApplicationId(i.getApplicationId());
        out.setRunAt(i.getRunAt());
        out.setPassed(i.getPassed() != null && i.getPassed() == 1);
        out.setExceptionCount(i.getExceptionCount() != null ? i.getExceptionCount() : 0);
        out.setExceptionPct(i.getExceptionPct());
        out.setNotes(i.getNotes());
        out.setSqlVersionId(i.getSqlVersionId());
        out.setMarkedFalsePositive(i.getMarkedFalsePositive() != null && i.getMarkedFalsePositive() == 1);
    }

    private DataQualityExceptionOut toExceptionOut(DataQualityException e) {
        DataQualityExceptionOut out = new DataQualityExceptionOut();
        out.setId(e.getId());
        out.setRuleId(e.getRuleId());
        out.setDataElementId(e.getDataElementId());
        out.setDescription(e.getDescription());
        out.setStatus(e.getStatus());
        out.setFalsePositive(e.getIsFalsePositive() != null && e.getIsFalsePositive() == 1);
        out.setMarkedAt(e.getMarkedAt());
        out.setMarkedBy(e.getMarkedBy());
        out.setIdentifiedAt(e.getIdentifiedAt());
        out.setCreatedAt(e.getCreatedAt());
        return out;
    }

    private DataQualitySqlVersionOut toSqlVersionOut(DataQualitySqlVersion sv) {
        DataQualitySqlVersionOut out = new DataQualitySqlVersionOut();
        out.setId(sv.getId());
        out.setRuleId(sv.getRuleId());
        out.setSqlText(sv.getSqlText());
        out.setVersion(sv.getVersion());
        out.setLive(sv.getIsLive() != null && sv.getIsLive() == 1);
        out.setCreatedAt(sv.getCreatedAt());
        return out;
    }

    private RuleModRequestOut toModRequestOut(RuleModRequest r) {
        RuleModRequestOut out = new RuleModRequestOut();
        out.setId(r.getId());
        out.setRuleId(r.getRuleId());
        out.setStatus(r.getStatus());
        out.setRequestedAt(r.getRequestedAt());
        out.setRequestedBy(r.getRequestedBy());
        return out;
    }
}
