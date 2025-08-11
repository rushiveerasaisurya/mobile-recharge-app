package com.example.demo.controller;

import com.example.demo.models.Subscriber;
import com.example.demo.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriberController {
    private final SubscriberService subscriberService;

    @GetMapping("/subscribers")
    public ResponseEntity<List<Subscriber>> getSubscribers() {
        return ResponseEntity.ok(subscriberService.getAllSubscribers());
    }

    @GetMapping("/subscribers/expiring")
    public ResponseEntity<List<Subscriber>> getExpiringSubscriptions(@RequestParam(defaultValue = "3") int days) {
        return ResponseEntity.ok(subscriberService.getExpiringSubscriptions(days));
    }

    @GetMapping("/subscribers/user/{userId}")
    public ResponseEntity<Subscriber> getSubscriberByUserId(@PathVariable Long userId) {
        Subscriber subscriber = subscriberService.getSubscriberByUserId(userId);
        return subscriber != null
            ? ResponseEntity.ok(subscriber)
            : ResponseEntity.noContent().build();
    }
}