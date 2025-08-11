package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.models.Plan;
import com.example.demo.repository.PlanRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }
    public List<Plan> getPlansByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty");
        }
        return planRepository.findByCategory(category);
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id).orElse(null);
    }
    public Plan createPlan(Plan plan) {
    	if (plan.getActive() == null) {
            plan.setActive(true); // Default to active on creation
        }
        return planRepository.save(plan);
    }

    public Plan updatePlan(Long id, Plan plan) {
        Plan existingPlan = planRepository.findById(id)
                                          .orElseThrow(() -> new RuntimeException("Plan not found"));
        existingPlan.setName(plan.getName());
        existingPlan.setPrice(plan.getPrice());
        existingPlan.setValidity(plan.getValidity());
        existingPlan.setData(plan.getData());
        existingPlan.setCalls(plan.getCalls());
        existingPlan.setSms(plan.getSms());
        existingPlan.setCategory(plan.getCategory());
        existingPlan.setBenefits(plan.getBenefits());
        if (plan.getActive() != null) {
            existingPlan.setActive(plan.getActive()); // Only update if provided
        }
        return planRepository.save(existingPlan);
    }

    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }
    public Long getActivePlansCount() {
        return planRepository.countByActiveTrue();
    }
}
