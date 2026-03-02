package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.model.Service;
import com.example.demo.model.User;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ServiceRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service")
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ServiceController(
        ServiceRepository serviceRepository,
        UserRepository userRepository,
        CategoryRepository categoryRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadService(
        @RequestParam Long ownerId,
        @RequestParam Long categoryId,
        @RequestBody Service service
    ) {
        try {
            User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

            service.setOwner(owner);
            service.setCategory(category);

            if (service.getTotalUnits() == null || service.getTotalUnits() < 1) {
                service.setTotalUnits(1);
            }

            Service saved = serviceRepository.save(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
