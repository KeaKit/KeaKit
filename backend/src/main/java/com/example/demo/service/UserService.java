package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PublicUserProfileDto;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.RgpdConsent;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.model.Wallet;
import com.example.demo.repository.RgpdConsentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
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
    private RgpdConsentRepository rgpdConsentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public UserResponse register(RegisterRequest request, String clientIp) {
        System.out.println("=== REGISTRO RGPD ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("acceptedPolicies: " + request.getAcceptedPolicies());

        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException("El correo ya está registrado");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                normalizedEmail,
                hashedPassword,
                request.getName(),
                UserRole.USER,
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getCountry()
        );

        User savedUser = userRepository.save(user);
        System.out.println("Usuario guardado con ID: " + savedUser.getId());

        this.createWalletForUser(savedUser);

        // Guardar consentimiento siempre que acceptedPolicies sea true
        if (request.getAcceptedPolicies() != null && request.getAcceptedPolicies()) {
            System.out.println("Guardando consentimiento RGPD para usuario: " + savedUser.getId());

            // Eliminar consentimiento previo si existe
            rgpdConsentRepository.findByUser(savedUser).ifPresent(existing -> {
                rgpdConsentRepository.delete(existing);
                System.out.println("Consentimiento previo eliminado");
            });

            RgpdConsent consent = new RgpdConsent();
            consent.setUser(savedUser);
            consent.setAcceptedVersion("1.0");
            consent.setAcceptedAt(LocalDateTime.now());
            consent.setIpAddress(clientIp);

            rgpdConsentRepository.save(consent);
            System.out.println("Consentimiento guardado correctamente");
        } else {
            System.out.println("NO se guarda consentimiento - acceptedPolicies es: " + request.getAcceptedPolicies());
        }

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole(), savedUser.getTokenVersion());
        return new UserResponse(savedUser, token);
    }

    private void createWalletForUser(User user) {
        if (user == null) {
            throw new ResourceNotFoundException("Usuario no encontrado. No se puede crear cartera.");
        }
        Wallet wallet = new Wallet(user);
        walletRepository.save(wallet);
    }

    public UserResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("Usuario no encontrado");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Contraseña inválida");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole(), user.getTokenVersion());
        return new UserResponse(user, token);
    }

    public UserResponse updateUser(Long id, UserUpdateData updateData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

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
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        return new UserResponse(user);
    }

    public UserResponse getUserByEmail(String email) throws UserNotFoundException {
        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        return new UserResponse(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
    }

    public User updateProfileImage(Long userId, MultipartFile image) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        String imageUrl = cloudinaryService.uploadImage(image);
        user.setProfileImageUrl(imageUrl);
        return userRepository.save(user);
    }

    public PublicUserProfileDto getPublicUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        return new PublicUserProfileDto(user);
    }
}
