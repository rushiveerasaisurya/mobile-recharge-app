package com.example.demo.controller;

import com.example.demo.service.PlanService;
import com.example.demo.service.RechargeHistoryService;
import com.example.demo.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StatsController {

    private final SubscriberService subscriberService;
    private final PlanService planService;
    private final RechargeHistoryService rechargeHistoryService;

    @GetMapping("/monthly-revenue")
    public ResponseEntity<Map<String, Double>> getMonthlyRevenue() {
        double revenue = rechargeHistoryService.getMonthlyRevenue();
        return ResponseEntity.ok(Map.of("revenue", revenue));
    }

    @GetMapping("/total-subscribers")
    public ResponseEntity<Map<String, Long>> getTotalSubscribers() {
        try {
            Long total = subscriberService.getTotalSubscribersCount();
            return ResponseEntity.ok(Map.of("total", total != null ? total : 0L));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("total", 0L));
        }
    }
    @GetMapping("/active-plans")
    public ResponseEntity<Map<String, Long>> getActivePlans() {
        try {
            Long count = planService.getActivePlansCount();
            return ResponseEntity.ok(Map.of("count", count != null ? count : 0L));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("count", 0L));
        }
    }
}