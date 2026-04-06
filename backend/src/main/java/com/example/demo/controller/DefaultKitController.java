package com.example.demo.controller;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.dto.DefaultKitResponse;
import com.example.demo.model.DefaultKit;
import com.example.demo.service.DefaultKitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/default-kits")
public class DefaultKitController {

    @Autowired
    private DefaultKitService defaultKitService;

    @GetMapping
    public ResponseEntity<List<DefaultKitResponse>> getAllDefaultKits() {
        return ResponseEntity.ok(defaultKitService.getAllDefaultKits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultKit> getDefaultKitById(@PathVariable Long id) {
        return ResponseEntity.ok(defaultKitService.getDefaultKitById(id));
    }

    @PostMapping
    public ResponseEntity<DefaultKit> createDefaultKit(@RequestBody DefaultKitCreateRequest request) {
        DefaultKit created = defaultKitService.createDefaultKit(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultKitResponse> updateDefaultKit(@PathVariable Long id, @RequestBody DefaultKitCreateRequest request) {
        DefaultKitResponse updated = defaultKitService.updateDefaultKit(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDefaultKit(@PathVariable Long id) {
        defaultKitService.deleteDefaultKit(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/catalog")
    public ResponseEntity<List<DefaultKitResponse>> getDefaultKitsCatalog() {
        return ResponseEntity.ok(defaultKitService.getDefaultKitsCatalog());
    }
}