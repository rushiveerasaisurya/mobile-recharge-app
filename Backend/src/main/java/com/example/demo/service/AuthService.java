package com.example.demo.service;

import com.example.demo.models.User;

public interface AuthService {
    User register(User user);
    User login(String mobileNumber, String password);
    void initializeAdmin();
    boolean resetPassword(String email, String newPassword);
    String getEmailByMobileNumber(String mobileNumber);
}