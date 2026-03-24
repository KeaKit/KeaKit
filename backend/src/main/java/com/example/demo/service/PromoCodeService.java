package com.example.demo.service;

import com.example.demo.dto.PromoCodeRequest;
import com.example.demo.dto.PromoCodeResponse;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PromoCode;
import com.example.demo.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    public List<PromoCodeResponse> findAll() {
        return promoCodeRepository.findAll()
                .stream()
                .map(PromoCodeResponse::new)
                .collect(Collectors.toList());
    }

    public PromoCodeResponse findById(Long id) {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promo code not found"));
        return new PromoCodeResponse(promoCode);
    }

    public PromoCodeResponse create(PromoCodeRequest request) {
        promoCodeRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            throw new RuntimeException("A promo code with this code already exists");
        });

        PromoCode promoCode = new PromoCode();
        mapRequestToEntity(request, promoCode);
        return new PromoCodeResponse(promoCodeRepository.save(promoCode));
    }

    public PromoCodeResponse update(Long id, PromoCodeRequest request) {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promo code not found"));

        promoCodeRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("A promo code with this code already exists");
            }
        });

        mapRequestToEntity(request, promoCode);
        return new PromoCodeResponse(promoCodeRepository.save(promoCode));
    }

    public PromoCodeValidationResponse validate(String code, String userEmail) {
        PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCase(code)
                .orElse(null);

        if (promoCode == null) {
            return new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        }
        if (!promoCode.isActive()) {
            return new PromoCodeValidationResponse(false, null, "Este código promocional no está activo");
        }

        if (promoCode.isPilotUserOnly()) {
            boolean emailAllowed = promoCode.getPilotEmails().stream()
                    .anyMatch(e -> e.equalsIgnoreCase(userEmail));
            if (!emailAllowed) {
                return new PromoCodeValidationResponse(false, null, "Este código es exclusivo para usuarios piloto");
            }
            // Para piloto: uso único por email
            boolean alreadyUsed = promoCode.getUsedByEmails().stream()
                    .anyMatch(e -> e.equalsIgnoreCase(userEmail));
            if (alreadyUsed) {
                return new PromoCodeValidationResponse(false, null, "Ya has utilizado este código en una compra anterior");
            }
        } else if (promoCode.isSingleUse()) {
            if (!promoCode.getUsedByEmails().isEmpty()) {
                return new PromoCodeValidationResponse(false, null, "Este código de un solo uso ya ha sido utilizado");
            }
        }

        return new PromoCodeValidationResponse(true, promoCode.getDiscountRate(), "Código aplicado correctamente");
    }

    public void markAsUsed(String code, String userEmail) {
        promoCodeRepository.findByCodeIgnoreCase(code).ifPresent(promoCode -> {
            if (!promoCode.getUsedByEmails().contains(userEmail.toLowerCase())) {
                promoCode.getUsedByEmails().add(userEmail.toLowerCase());
            }
            promoCodeRepository.save(promoCode);
        });
    }

    private void mapRequestToEntity(PromoCodeRequest request, PromoCode promoCode) {
        double percentValue = request.discountRate() * 100;
        if (Math.abs(percentValue - Math.round(percentValue)) > 0.0001) {
            throw new RuntimeException("El porcentaje de descuento debe ser un número entero (sin decimales)");
        }

        promoCode.setCode(request.code().trim().toUpperCase());
        promoCode.setDiscountRate(request.discountRate());
        promoCode.setActive(request.active());
        promoCode.setSingleUse(request.singleUse());
        promoCode.setPilotUserOnly(request.pilotUserOnly());
        promoCode.setPilotEmails(request.pilotEmails() != null
                ? request.pilotEmails().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList())
                : List.of());
    }
}