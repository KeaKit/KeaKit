package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;

import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(
            request.getEmail(),
            request.getPassword(),
            request.getName(),
            UserRole.USER
        );

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new UserResponse(user);
    }

    public UserResponse updateUser(Long id, User updateData) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateData.getName() != null) {
            user.setName(updateData.getName());
        }
        if (updateData.getPhone() != null) {
            user.setPhone(updateData.getPhone());
        }
        if (updateData.getAddress() != null) {
            user.setAddress(updateData.getAddress());
        }
        if (updateData.getCity() != null) {
            user.setCity(updateData.getCity());
        }

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user);
    }
}
