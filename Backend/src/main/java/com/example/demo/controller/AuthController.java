package com.example.demo.controller;

import com.example.demo.models.User;
import com.example.demo.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        try {
            if (!isValidMobileNumber(request.getMobileNumber())) {
                logger.warn("Invalid mobile number format: {}", request.getMobileNumber());
                return ResponseEntity.badRequest().body(null);
            }
            if (!isValidEmail(request.getEmail())) {
                logger.warn("Invalid email format: {}", request.getEmail());
                return ResponseEntity.badRequest().body(null);
            }

            User user = User.builder()
                    .name(sanitizeInput(request.getName()))
                    .mobileNumber(request.getMobileNumber())
                    .email(request.getEmail())
                    .password(request.getPassword())
                    .role("user")
                    .build();

            User registeredUser = authService.register(user);
            logger.info("User registered successfully: {}", registeredUser.getMobileNumber());
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest loginRequest) {
        try {
            if (!isValidMobileNumber(loginRequest.getMobileNumber())) {
                logger.warn("Invalid mobile number format: {}", loginRequest.getMobileNumber());
                return ResponseEntity.status(400).body(null);
            }

            User user = authService.login(loginRequest.getMobileNumber(), loginRequest.getPassword());
            logger.info("User logged in successfully: {}", user.getMobileNumber());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401).body(null);
        }
    }

    @PostMapping("/forgot-password/get-email")
    public ResponseEntity<Map<String, Object>> getEmail(@RequestBody MobileNumberRequest request) {
        try {
            if (!isValidMobileNumber(request.getMobileNumber())) {
                logger.warn("Invalid mobile number format: {}", request.getMobileNumber());
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid mobile number format"));
            }

            String email = authService.getEmailByMobileNumber(request.getMobileNumber());
            logger.info("Email fetched for mobile number: {}", request.getMobileNumber());
            return ResponseEntity.ok(Map.of("success", true, "email", email, "userName", "User"));
        } catch (Exception e) {
            logger.error("Failed to fetch email: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (!isValidEmail(request.getEmail())) {
                logger.warn("Invalid email format: {}", request.getEmail());
                return ResponseEntity.status(400).body("Invalid email format");
            }

            boolean success = authService.resetPassword(request.getEmail(), request.getNewPassword());
            logger.info("Password reset successfully for email: {}", request.getEmail());
            return success ? ResponseEntity.ok("Password reset successfully") : ResponseEntity.badRequest().body("Failed to reset password");
        } catch (Exception e) {
            logger.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTOs for requests
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Mobile number is required")
        private String mobileNumber;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Mobile number is required")
        private String mobileNumber;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class MobileNumberRequest {
        @NotBlank(message = "Mobile number is required")
        private String mobileNumber;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "New password is required")
        private String newPassword;
    }

    // Input validation and sanitization methods
    private boolean isValidMobileNumber(String mobileNumber) {
        return mobileNumber != null && mobileNumber.matches("\\d{10}");
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    private String sanitizeInput(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"&'%;]", "");
    }
}