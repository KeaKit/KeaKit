package com.example.demo.service;

import com.example.demo.dto.BulkPilotUserRequest;
import com.example.demo.dto.PilotUserRequest;
import com.example.demo.dto.PilotUserResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PilotUser;
import com.example.demo.repository.PilotUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PilotUserService {

    @Autowired
    private PilotUserRepository pilotUserRepository;

    public List<PilotUserResponse> findAll() {
        return pilotUserRepository.findAll()
                .stream()
                .map(PilotUserResponse::new)
                .collect(Collectors.toList());
    }

    public List<String> findAllActiveEmails() {
        return pilotUserRepository.findByActiveTrue()
                .stream()
                .map(PilotUser::getEmail)
                .collect(Collectors.toList());
    }

    public PilotUserResponse create(PilotUserRequest request) {
        pilotUserRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new RuntimeException("Este email ya está registrado como usuario piloto");
        });
        PilotUser pilotUser = new PilotUser(request.email().trim().toLowerCase());
        pilotUser.setActive(request.active());
        return new PilotUserResponse(pilotUserRepository.save(pilotUser));
    }

    public PilotUserResponse update(Long id, PilotUserRequest request) {
        PilotUser pilotUser = pilotUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario piloto no encontrado"));

        pilotUserRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Este email ya está registrado como usuario piloto");
            }
        });

        pilotUser.setEmail(request.email().trim().toLowerCase());
        pilotUser.setActive(request.active());
        return new PilotUserResponse(pilotUserRepository.save(pilotUser));
    }

    public void bulkSetActive(BulkPilotUserRequest request) {
        List<PilotUser> users = pilotUserRepository.findAllById(request.ids());
        users.forEach(u -> u.setActive(request.active()));
        pilotUserRepository.saveAll(users);
    }
}