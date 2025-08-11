package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Plan;
import com.example.demo.service.PlanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PlanController {

    private final PlanService planService;

    @GetMapping("/plans")
    public ResponseEntity<?> getPlans(@RequestParam(required = false) String category) {
        try {
            List<Plan> plans;
            if (category != null && !category.equalsIgnoreCase("all")) {
                plans = planService.getPlansByCategory(category); // Assume this method exists
            } else {
                plans = planService.getAllPlans();
            }
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching plans: " + e.getMessage());
        }
    }
    @GetMapping("/plans/{id}")
    public ResponseEntity<Plan> getPlan(@PathVariable Long id) {
        Plan plan = planService.getPlanById(id);
        return plan != null 
            ? ResponseEntity.ok(plan) 
            : ResponseEntity.notFound().build();
    }
    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.ok(planService.createPlan(plan));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<Plan> updatePlan(@PathVariable Long id, @RequestBody Plan plan) {
        return ResponseEntity.ok(planService.updatePlan(id, plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
