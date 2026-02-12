package com.dmp.controller;

import com.dmp.dto.DataFeedDetailOut;
import com.dmp.dto.DataFeedOut;
import com.dmp.service.DataFeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Data feed listing and detail by domain/scope. */
@RestController
@RequestMapping("/api/data-feeds")
@Tag(name = "data-feeds", description = "Data feed catalog")
public class DataFeedsController {

    private final DataFeedService dataFeedService;

    public DataFeedsController(DataFeedService dataFeedService) {
        this.dataFeedService = dataFeedService;
    }

    @GetMapping
    @Operation(summary = "List data feeds", description = "Feeds for the given domain and scope (owned | all)")
    public ResponseEntity<List<DataFeedOut>> listDataFeeds(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataFeedService.listDataFeeds(domain_id, scope));
    }

    @GetMapping("/{dataFeedId}")
    @Operation(summary = "Get data feed", description = "Full detail including data elements and controls")
    public DataFeedDetailOut getDataFeed(@PathVariable int dataFeedId) {
        return dataFeedService.getDataFeed(dataFeedId);
    }
}
