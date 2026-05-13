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
    private WalletRepository walletRepository;

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
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException("El correo ya está registrado.");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getName(),
                request.getRole() != null ? request.getRole() : UserRole.USER,
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getCountry()
        );

        User savedUser = userRepository.save(user);

        Wallet wallet = new Wallet(savedUser);
        walletRepository.save(wallet);

        return new UserResponse(savedUser);
    }

    public UserResponse updateUser(Long id, AdminUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        if (request.getEmail() != null) {
            String normalizedEmail = request.getEmail().toLowerCase().trim();

            if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                throw new UserAlreadyExistsException("El correo ya está registrado.");
            }
            user.setEmail(normalizedEmail); 
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

        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }

        user.incrementTokenVersion();

        User updatedUser = userRepository.save(user);

        return new UserResponse(updatedUser);
    }

    public UserResponse toggleFounderBadge(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        user.setFounderBadge(!user.isFounderBadge());
        return new UserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("Usuario no encontrado");
        }

        // 1. borrar wallet primero
        walletRepository.deleteByUserId(id);

        // 2. borrar usuario
        userRepository.deleteById(id);
    }
}