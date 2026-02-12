package com.dmp.controller;

import com.dmp.dto.DataFeedDetailOut;
import com.dmp.dto.DataFeedOut;
import com.dmp.service.DataFeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-feeds")
public class DataFeedsController {

    private final DataFeedService dataFeedService;

    public DataFeedsController(DataFeedService dataFeedService) {
        this.dataFeedService = dataFeedService;
    }

    @GetMapping
    public ResponseEntity<List<DataFeedOut>> listDataFeeds(
            @RequestParam int domain_id,
            @RequestParam(defaultValue = "owned") String scope) {
        return ResponseEntity.ok(dataFeedService.listDataFeeds(domain_id, scope));
    }

    @GetMapping("/{dataFeedId}")
    public DataFeedDetailOut getDataFeed(@PathVariable int dataFeedId) {
        return dataFeedService.getDataFeed(dataFeedId);
    }
}
