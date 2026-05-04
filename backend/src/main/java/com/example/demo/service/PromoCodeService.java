package com.example.demo.service;

import com.example.demo.dto.PromoCodeRequest;
import com.example.demo.dto.PromoCodeResponse;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.exception.PromoCodeAlreadyExistsException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PromoCode;
import com.example.demo.model.PromoCodeType;
import com.example.demo.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public PromoCodeResponse findById(Long id) throws ResourceNotFoundException {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Código promocional no encontrado"));
        return new PromoCodeResponse(promoCode);
    }

    public PromoCodeResponse create(PromoCodeRequest request) throws PromoCodeAlreadyExistsException {
        promoCodeRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            throw new PromoCodeAlreadyExistsException();
        });

        PromoCode promoCode = new PromoCode();
        mapRequestToEntity(request, promoCode);
        return new PromoCodeResponse(promoCodeRepository.save(promoCode));
    }

    public PromoCodeResponse update(Long id, PromoCodeRequest request) throws ResourceNotFoundException, PromoCodeAlreadyExistsException {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Código promocional no encontrado"));

        promoCodeRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new PromoCodeAlreadyExistsException();
            }
        });

        mapRequestToEntity(request, promoCode);
        return new PromoCodeResponse(promoCodeRepository.save(promoCode));
    }

    public PromoCodeValidationResponse validate(String code, String userEmail) {
        return validateForTenantDiscount(code, userEmail);
    }

    public PromoCodeValidationResponse validateForTenantDiscount(String code, String userEmail) {
        return validateByType(code, userEmail, PromoCodeType.TENANT_DISCOUNT);
    }

    public PromoCodeValidationResponse validateForOwnerCommissionReduction(String code, String userEmail) {
        return validateByType(code, userEmail, PromoCodeType.OWNER_COMMISSION_REDUCTION);
    }

    public PromoCodeValidationResponse validateForOwnerCommissionReductionAllowReservedByUser(String code, String userEmail) {
        return validateByType(code, userEmail, PromoCodeType.OWNER_COMMISSION_REDUCTION, true);
    }

    @Transactional
    public PromoCodeValidationResponse validateForOwnerCommissionReductionAndConsumeSingleUse(String code, String userEmail) {
        PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCaseForUpdate(code)
                .orElse(null);

        PromoCodeValidationResponse validation = validatePromoEntityByType(promoCode, userEmail, PromoCodeType.OWNER_COMMISSION_REDUCTION);
        if (!validation.isValid()) {
            return validation;
        }

        if (promoCode != null && promoCode.isSingleUse()) {
            String marker = (userEmail != null && !userEmail.isBlank())
                    ? userEmail.toLowerCase()
                    : "__single_use_consumed__";

            if (!promoCode.getUsedByEmails().contains(marker)) {
                promoCode.getUsedByEmails().add(marker);
                promoCodeRepository.save(promoCode);
            }
        }

        return validation;
    }

    private PromoCodeValidationResponse validateByType(String code, String userEmail, PromoCodeType expectedType) {
        return validateByType(code, userEmail, expectedType, false);
    }

    private PromoCodeValidationResponse validateByType(String code, String userEmail, PromoCodeType expectedType, boolean allowSingleUseIfReservedBySameUser) {
        PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCase(code)
                .orElse(null);

        return validatePromoEntityByType(promoCode, userEmail, expectedType, allowSingleUseIfReservedBySameUser);
    }

    private PromoCodeValidationResponse validatePromoEntityByType(PromoCode promoCode, String userEmail, PromoCodeType expectedType) {
        return validatePromoEntityByType(promoCode, userEmail, expectedType, false);
    }

    private PromoCodeValidationResponse validatePromoEntityByType(PromoCode promoCode, String userEmail, PromoCodeType expectedType, boolean allowSingleUseIfReservedBySameUser) {

        if (promoCode == null) {
            return new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        }

        PromoCodeType promoType = resolvePromoType(promoCode);
        if (promoType != expectedType) {
            return new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        }

        if (!promoCode.isActive()) {
            return new PromoCodeValidationResponse(false, null, "Este código promocional no está activo");
        }

        if (promoCode.isPilotUserOnly()) {
            boolean emailAllowed = promoCode.getPilotEmails().stream()
                    .anyMatch(e -> e.equalsIgnoreCase(userEmail));
            if (!emailAllowed) {
                return new PromoCodeValidationResponse(false, null, "Código promocional no válido");
            }
            // Para piloto: uso único por email
            boolean alreadyUsed = promoCode.getUsedByEmails().stream()
                    .anyMatch(e -> e.equalsIgnoreCase(userEmail));
            if (alreadyUsed) {
                return new PromoCodeValidationResponse(false, null, "Código promocional ya utilizado");
            }
        } else if (promoCode.isSingleUse()) {
            if (!promoCode.getUsedByEmails().isEmpty()) {
                if (allowSingleUseIfReservedBySameUser && userEmail != null && !userEmail.isBlank()) {
                    boolean reservedExclusivelyBySameUser = promoCode.getUsedByEmails().stream()
                            .allMatch(e -> e.equalsIgnoreCase(userEmail));
                    if (reservedExclusivelyBySameUser) {
                        return new PromoCodeValidationResponse(true, promoCode.getDiscountRate(), "Código aplicado correctamente");
                    }
                }
                return new PromoCodeValidationResponse(false, null, "Código promocional ya utilizado");
            }
        }

        return new PromoCodeValidationResponse(true, promoCode.getDiscountRate(), "Código aplicado correctamente");
    }

    private PromoCodeType resolvePromoType(PromoCode promoCode) {
        return promoCode.getType() != null ? promoCode.getType() : PromoCodeType.TENANT_DISCOUNT;
    }

    public void markAsUsed(String code, String userEmail) {
        promoCodeRepository.findByCodeIgnoreCase(code).ifPresent(promoCode -> {
            String marker;
            if (userEmail != null && !userEmail.isBlank()) {
                marker = userEmail.toLowerCase();
            } else if (promoCode.isSingleUse()) {
                marker = "__single_use_consumed__";
            } else {
                marker = null;
            }

            if (marker != null && !promoCode.getUsedByEmails().contains(marker)) {
                promoCode.getUsedByEmails().add(marker);
            }

            promoCodeRepository.save(promoCode);
        });
    }

    @Transactional
    public void reserveOwnerSingleUseIfNeeded(String code, String userEmail) {
        if (code == null || code.isBlank()) {
            return;
        }

        PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCaseForUpdate(code)
                .orElseThrow(() -> new RuntimeException("Código promocional no válido"));

        PromoCodeValidationResponse validation = validatePromoEntityByType(
                promoCode,
                userEmail,
                PromoCodeType.OWNER_COMMISSION_REDUCTION,
                true);

        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }

        if (!promoCode.isSingleUse()) {
            return;
        }

        String marker = (userEmail != null && !userEmail.isBlank())
                ? userEmail.toLowerCase()
                : "__single_use_consumed__";

        if (!promoCode.getUsedByEmails().contains(marker)) {
            promoCode.getUsedByEmails().add(marker);
            promoCodeRepository.save(promoCode);
        }
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
        promoCode.setType(request.type() != null ? request.type() : PromoCodeType.TENANT_DISCOUNT);
        promoCode.setPilotUserOnly(request.pilotUserOnly());
        promoCode.setPilotEmails(request.pilotEmails() != null
                ? request.pilotEmails().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList())
                : List.of());
    }
}