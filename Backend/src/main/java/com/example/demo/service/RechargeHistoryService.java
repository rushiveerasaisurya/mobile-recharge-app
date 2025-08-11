package com.example.demo.service;

import com.example.demo.models.Plan;
import com.example.demo.models.RechargeHistory;
import com.example.demo.models.Subscriber;
import com.example.demo.repository.PlanRepository;
import com.example.demo.repository.RechargeHistoryRepository;
import com.example.demo.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RechargeHistoryService {
    private final RechargeHistoryRepository rechargeHistoryRepository;
    private final SubscriberRepository subscriberRepository;
    private final PlanRepository planRepository;

    public List<RechargeHistory> getRechargeHistory() {
        return rechargeHistoryRepository.findAll();
    }

    public List<RechargeHistory> getRechargeHistoryById(Long userId) {
        return rechargeHistoryRepository.findByUserId(userId);
    }
    	
    
    public RechargeHistory performRecharge(RechargeHistory recharge) {
        if (recharge.getUserId() == null || recharge.getMobile() == null || recharge.getPlanName() == null) {
            throw new IllegalArgumentException("User ID, mobile, and plan name are required");
        }
        Plan plan = planRepository.findByName(recharge.getPlanName())
            .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + recharge.getPlanName()));
        recharge.setDate(LocalDateTime.now());
        recharge.setStatus(recharge.getAmount() == 0 ? "Free Subscription" : "Successful");
        RechargeHistory savedRecharge = rechargeHistoryRepository.save(recharge);
        Subscriber subscriber = subscriberRepository.findByUserId(recharge.getUserId())
            .orElse(new Subscriber());
        subscriber.setUserId(recharge.getUserId());
        subscriber.setName(recharge.getUserName());
        subscriber.setMobile(recharge.getMobile());
        subscriber.setPlan(recharge.getPlanName());
        String validity = plan.getValidity();
        int days = Integer.parseInt(validity.split(" ")[0]);
        subscriber.setExpiryDate(LocalDateTime.now().plus(days, ChronoUnit.DAYS));
        subscriber.setStatus("Active");
        subscriberRepository.save(subscriber);
        return savedRecharge;
    }

    public double getMonthlyRevenue() {
        LocalDateTime startOfPreviousMonth = LocalDateTime.now().minusMonths(1).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfPreviousMonth = LocalDateTime.now().minusMonths(1)
                .withDayOfMonth(LocalDateTime.now().minusMonths(1).toLocalDate().lengthOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        List<RechargeHistory> recharges = rechargeHistoryRepository.findByDateBetween(startOfPreviousMonth, endOfPreviousMonth);
        return recharges.stream()
                .filter(r -> "Successful".equals(r.getStatus()))
                .mapToDouble(r -> r.getAmount()) 
                .sum();
    }
}