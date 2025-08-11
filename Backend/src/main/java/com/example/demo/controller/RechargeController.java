package com.example.demo.controller;

import com.example.demo.models.RechargeHistory;
import com.example.demo.service.RechargeHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RechargeController {
    private final RechargeHistoryService rechargeHistoryService;

    @GetMapping("/recharge-history")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistory() {
        return ResponseEntity.ok(rechargeHistoryService.getRechargeHistory());
    }
    @GetMapping("/recharge-history/{userId}")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistoryById(@PathVariable Long userId) {
    	try {
            List<RechargeHistory> history = rechargeHistoryService.getRechargeHistoryById(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    @PostMapping("/recharge")
    public ResponseEntity<RechargeHistory> performRecharge(@RequestBody RechargeHistory recharge) {
        return ResponseEntity.ok(rechargeHistoryService.performRecharge(recharge));
    }
}