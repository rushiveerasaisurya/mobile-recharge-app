package com.example.demo.repository;

import com.example.demo.models.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    Optional<Plan> findByName(String name);
    List<Plan> findByCategory(String category);
	Long countByActiveTrue();
}