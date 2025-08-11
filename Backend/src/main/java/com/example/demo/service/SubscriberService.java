package com.example.demo.service;

import com.example.demo.models.Subscriber;
import com.example.demo.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriberService {
    private final SubscriberRepository subscriberRepository;

    public List<Subscriber> getAllSubscribers() {
        return subscriberRepository.findAll();
    }

    public List<Subscriber> getExpiringSubscriptions(int days) {
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(days);
        return subscriberRepository.findExpiringSubscriptions(expiryDate);
    }

    public Subscriber getSubscriberByUserId(Long userId) {
        return subscriberRepository.findByUserId(userId).orElse(null);
    }

    public Long getTotalSubscribersCount() {
        return subscriberRepository.count();
    }
    
}