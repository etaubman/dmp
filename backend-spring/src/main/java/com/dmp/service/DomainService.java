package com.dmp.service;

import com.dmp.dto.DomainCreate;
import com.dmp.dto.DomainOut;
import com.dmp.dto.DomainTreeOut;
import com.dmp.dto.DomainUpdate;
import com.dmp.model.Domain;
import com.dmp.repository.DomainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
public class DomainService {

    private static final int MAX_DEPTH = 4;  // L0 through L3

    private final DomainRepository domainRepository;

    public DomainService(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    public List<DomainTreeOut> getDomainTree() {
        List<Domain> roots = domainRepository.findByParentIdIsNullOrderByNameAsc();
        return roots.stream()
                .map(d -> toTreeNode(d, 0))
                .collect(Collectors.toList());
    }

    private DomainTreeOut toTreeNode(Domain d, int level) {
        List<Domain> childDomains = domainRepository.findByParentIdOrderByNameAsc(d.getId());
        List<DomainTreeOut> children = childDomains.stream()
                .map(c -> toTreeNode(c, level + 1))
                .collect(Collectors.toList());
        return new DomainTreeOut(d.getId(), d.getName(), d.getDescription(), d.getParentId(), level, children);
    }

    public DomainOut getDomain(int domainId) {
        Domain d = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Domain not found"));
        return toDomainOut(d);
    }

    @Transactional
    public DomainOut createDomain(DomainCreate body) {
        if (body.getParentId() != null) {
            Domain parent = domainRepository.findById(body.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Parent domain not found"));
            int depth = depthOf(body.getParentId());
            if (depth >= MAX_DEPTH - 1) {
                throw new ResponseStatusException(BAD_REQUEST, "Maximum hierarchy depth is " + MAX_DEPTH + " (L0–L3). Cannot add a child here.");
            }
        }

        Domain domain = new Domain();
        domain.setName((body.getName() != null ? body.getName() : "").trim());
        domain.setDescription(body.getDescription() != null && !body.getDescription().trim().isEmpty() ? body.getDescription().trim() : null);
        domain.setParentId(body.getParentId());
        domain = domainRepository.save(domain);
        return toDomainOut(domain);
    }

    @Transactional
    public DomainOut updateDomain(int domainId, DomainUpdate body) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Domain not found"));

        if (body.getName() != null) {
            domain.setName(body.getName().trim());
        }
        if (body.getDescription() != null) {
            domain.setDescription(body.getDescription().trim().isEmpty() ? null : body.getDescription().trim());
        }
        // parent_id: use getParentId() - if DomainUpdate was built from JSON with "parent_id" key, it's set.
        // To support "set to root" (parent_id=null), we must allow null. We update whenever the field was provided.
        // With a simple DTO we can't distinguish omit vs null - assume caller sends parent_id explicitly when changing.
        if (body.hasParentIdUpdate()) {
            Integer newParentId = body.getParentId();
            if (newParentId.equals(domainId)) {
                throw new ResponseStatusException(BAD_REQUEST, "Domain cannot be its own parent");
            }
            if (newParentId < 1) {
                throw new ResponseStatusException(BAD_REQUEST, "Invalid parent_id");
            }
            if (newParentId != null) {
                Set<Integer> descendants = descendantIds(domainId);
                if (descendants.contains(newParentId)) {
                    throw new ResponseStatusException(BAD_REQUEST, "Circular parent: cannot move under a descendant");
                }
                Domain parent = domainRepository.findById(newParentId)
                        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Parent domain not found"));
                int newDepth = depthOf(newParentId) + 1;
                int subtreeDepth = subtreeDepth(domainId);
                if (newDepth + subtreeDepth >= MAX_DEPTH) {
                    throw new ResponseStatusException(BAD_REQUEST, "Maximum hierarchy depth is " + MAX_DEPTH + " (L0–L3). Moving here would exceed it.");
                }
            }
            domain.setParentId(newParentId);  // can be null (make root)
        }

        domain = domainRepository.save(domain);
        return toDomainOut(domain);
    }

    @Transactional
    public void deleteDomain(int domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Domain not found"));

        if (!domainRepository.findByParentIdOrderByNameAsc(domainId).isEmpty()) {
            throw new ResponseStatusException(CONFLICT, "Cannot delete domain that has child domains. Remove or move children first.");
        }
        long relatedCount = domainRepository.countRelatedData(domainId);
        if (relatedCount > 0) {
            throw new ResponseStatusException(CONFLICT, "Cannot delete domain that has related data (data elements, applications, EUCs, endpoints, data feeds, DQ rules, or data concerns). Remove or reassign them first.");
        }
        domainRepository.delete(domain);
    }

    private int depthOf(int domainId) {
        int depth = 0;
        Domain d = domainRepository.findById(domainId).orElse(null);
        while (d != null && d.getParentId() != null) {
            depth++;
            d = domainRepository.findById(d.getParentId()).orElse(null);
        }
        return depth;
    }

    private Set<Integer> descendantIds(int domainId) {
        Set<Integer> result = new HashSet<>();
        var stack = new java.util.Stack<Integer>();
        stack.push(domainId);
        while (!stack.isEmpty()) {
            int pid = stack.pop();
            for (Domain child : domainRepository.findByParentIdOrderByNameAsc(pid)) {
                result.add(child.getId());
                stack.push(child.getId());
            }
        }
        return result;
    }

    private int subtreeDepth(int domainId) {
        int maxDepth = 0;
        var stack = new java.util.Stack<int[]>();
        stack.push(new int[]{domainId, 0});
        while (!stack.isEmpty()) {
            int[] pair = stack.pop();
            int nid = pair[0], d = pair[1];
            maxDepth = Math.max(maxDepth, d);
            for (Domain child : domainRepository.findByParentIdOrderByNameAsc(nid)) {
                stack.push(new int[]{child.getId(), d + 1});
            }
        }
        return maxDepth;
    }

    public DomainOut toDomainOut(Domain d) {
        return new DomainOut(d.getId(), d.getName(), d.getDescription(), d.getParentId(), d.getCreatedAt(), d.getUpdatedAt());
    }
}
