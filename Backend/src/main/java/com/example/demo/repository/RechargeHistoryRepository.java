package com.example.demo.repository;

import com.example.demo.models.RechargeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RechargeHistoryRepository extends JpaRepository<RechargeHistory, Long> {
    List<RechargeHistory> findByDateAfter(LocalDateTime date);
	

	List<RechargeHistory> findByUserId(Long userId);


	List<RechargeHistory> findByDateBetween(LocalDateTime startOfPreviousMonth, LocalDateTime endOfPreviousMonth);



}