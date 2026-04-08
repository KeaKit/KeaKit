package com.example.demo.service;

import com.example.demo.dto.AdminUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.model.Wallet;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.repository.WalletRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WalletRepository walletRepository; // 👈 AÑADIR

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication != null ? authentication.getName() : "";
        return userRepository.findAll()
                .stream()
                .filter(user -> !user.getEmail().equals(currentUserEmail))
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    public UserResponse createUser(AdminUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getName(),
                request.getRole() != null ? request.getRole() : UserRole.USER, // 👈 fallback
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getCountry() // 👈 IMPORTANTE
        );

        User savedUser = userRepository.save(user);

        // 👇 Crear wallet como en UserService
        Wallet wallet = new Wallet(savedUser);
        walletRepository.save(wallet);

        return new UserResponse(savedUser);
    }

    public UserResponse updateUser(Long id, AdminUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (request.getEmail() != null) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already exists");
            }

            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }

        if (request.getCountry() != null) { // 👈 IMPORTANTE
            user.setCountry(request.getCountry());
        }

        User updatedUser = userRepository.save(user);

        return new UserResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }

        // 1. borrar wallet primero
        walletRepository.deleteByUserId(id);

        // 2. borrar usuario
        userRepository.deleteById(id);
    }
}