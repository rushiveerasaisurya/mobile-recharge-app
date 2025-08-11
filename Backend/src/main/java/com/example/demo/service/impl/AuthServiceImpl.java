package com.example.demo.service.impl;

import com.example.demo.models.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostConstruct
    public void initializeAdmin() {
        if (userRepository.findByMobileNumber("9999999999").isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .mobileNumber("9999999999")
                    .email("rechargemeeet@gmail.com")
                    .password(passwordEncoder.encode("admin123")) // Hash the password
                    .role("admin")
                    .build();
            userRepository.save(admin);
        }
    }

    @Override
    public User register(User user) {
        if (userRepository.findByMobileNumber(user.getMobileNumber()).isPresent()) {
            throw new RuntimeException("Mobile number already registered");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setRole("user");
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash the password
        return userRepository.save(user);
    }

    @Override
    public User login(String mobileNumber, String password) {
        Optional<User> user = userRepository.findByMobileNumber(mobileNumber);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user.get();
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    @Override
    public boolean resetPassword(String email, String newPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setPassword(passwordEncoder.encode(newPassword)); // Hash the new password
            userRepository.save(existingUser);
            return true;
        } else {
            throw new RuntimeException("User not found with this email");
        }
    }

    @Override
    public String getEmailByMobileNumber(String mobileNumber) {
        Optional<User> user = userRepository.findByMobileNumber(mobileNumber);
        if (user.isPresent()) {
            String email = user.get().getEmail();
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email not registered for this user");
            }
            return email;
        } else {
            throw new RuntimeException("User not found");
        }
    }
}