package com.example.demo.controller;

import com.example.demo.dto.DemandAnalysisDTO;
import com.example.demo.service.DemandAnalysisService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demand-analysis")
@CrossOrigin(origins = "*")
public class DemandAnalysisController {

    private final DemandAnalysisService demandAnalysisService;

    public DemandAnalysisController(DemandAnalysisService demandAnalysisService) {
        this.demandAnalysisService = demandAnalysisService;
    }

    @GetMapping("/top")
    public ResponseEntity<?> getTopDemandedItems(
            @RequestParam(required = false) Integer limit) {
        try {
            List<DemandAnalysisDTO> topItems = demandAnalysisService.getTopDemandedItems(limit);
            return ResponseEntity.ok(topItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top/category")
    public ResponseEntity<?> getTopDemandedItemsByCategory(
            @RequestParam String categoryName,
            @RequestParam(required = false) Integer limit) {
        try {
            List<DemandAnalysisDTO> topItems = demandAnalysisService.getTopDemandedItemsByCategory(categoryName, limit);
            return ResponseEntity.ok(topItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
