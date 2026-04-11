package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PublicUserProfileDto;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile; 
import java.io.IOException; 

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getEmail(),
                hashedPassword,
                request.getName(),
                UserRole.USER,
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getCountry());

        User savedUser = userRepository.save(user);
        this.createWalletForUser(savedUser);

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole());
        return new UserResponse(savedUser, token);
    }

    private void createWalletForUser(User user) {
        if (user == null) {
            throw new ResourceNotFoundException("User not found. Cannot create wallet.");
        }
        Wallet wallet = new Wallet(user);

        walletRepository.save(wallet);
    }

    public UserResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        return new UserResponse(user, token);
    }

    public UserResponse updateUser(Long id, UserUpdateData updateData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

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
        if (updateData.getCountry() != null) {
            user.setCountry(updateData.getCountry());
        }

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return new UserResponse(user);
    }

    public UserResponse getUserByEmail(String email) throws UserNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return new UserResponse(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    public User updateProfileImage(Long userId, MultipartFile image) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        String imageUrl = cloudinaryService.uploadImage(image);
        user.setProfileImageUrl(imageUrl);
        return userRepository.save(user);
    }

    public PublicUserProfileDto getPublicUserProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return new PublicUserProfileDto(user);
    }
}
