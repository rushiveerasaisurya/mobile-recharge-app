package com.example.demo.repository;

import com.example.demo.models.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    @Query("SELECT s FROM Subscriber s WHERE s.expiryDate <= :date AND s.status = 'Active'")
    List<Subscriber> findExpiringSubscriptions(LocalDateTime date);
    Optional<Subscriber> findByUserId(Long userId);
}