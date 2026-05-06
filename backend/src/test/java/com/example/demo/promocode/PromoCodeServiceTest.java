package com.example.demo.promocode;

import com.example.demo.dto.PromoCodeRequest;
import com.example.demo.dto.PromoCodeResponse;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.exception.PromoCodeAlreadyExistsException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PromoCode;
import com.example.demo.model.PromoCodeType;
import com.example.demo.repository.PromoCodeRepository;
import com.example.demo.service.PromoCodeService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromoCodeServiceTest {

    @Mock
    private PromoCodeRepository promoCodeRepository;

    @InjectMocks
    private PromoCodeService promoCodeService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private PromoCode tenantDiscount;         // tipo TENANT_DISCOUNT, multi-uso
    private PromoCode ownerReduction;         // tipo OWNER_COMMISSION_REDUCTION, multi-uso
    private PromoCode pilotCode;              // TENANT_DISCOUNT, pilotUserOnly
    private PromoCode singleUseTenant;        // TENANT_DISCOUNT, singleUse
    private PromoCode singleUseOwner;         // OWNER_COMMISSION_REDUCTION, singleUse

    @BeforeEach
    void setUp() {
        tenantDiscount = buildPromo(1L, "DESCUENTO20", PromoCodeType.TENANT_DISCOUNT, 0.20,
                true, false, false, new ArrayList<>(), new ArrayList<>());

        ownerReduction = buildPromo(2L, "OWNER10", PromoCodeType.OWNER_COMMISSION_REDUCTION, 0.10,
                true, false, false, new ArrayList<>(), new ArrayList<>());

        pilotCode = buildPromo(3L, "PILOTO15", PromoCodeType.TENANT_DISCOUNT, 0.15,
                true, false, true,
                new ArrayList<>(List.of("piloto@test.com", "otro@test.com")),
                new ArrayList<>());

        singleUseTenant = buildPromo(4L, "UNICO25", PromoCodeType.TENANT_DISCOUNT, 0.25,
                true, true, false, new ArrayList<>(), new ArrayList<>());

        singleUseOwner = buildPromo(5L, "OWNERUNICO", PromoCodeType.OWNER_COMMISSION_REDUCTION, 0.05,
                true, true, false, new ArrayList<>(), new ArrayList<>());
    }

    private PromoCode buildPromo(Long id, String code, PromoCodeType type, Double rate,
                                  boolean active, boolean singleUse, boolean pilotOnly,
                                  List<String> pilotEmails, List<String> usedEmails) {
        PromoCode p = new PromoCode();
        p.setId(id);
        p.setCode(code);
        p.setType(type);
        p.setDiscountRate(rate);
        p.setActive(active);
        p.setSingleUse(singleUse);
        p.setPilotUserOnly(pilotOnly);
        p.setPilotEmails(pilotEmails);
        p.setUsedByEmails(usedEmails);
        return p;
    }

    // ==========================================
    // findAll
    // ==========================================

    @Test
    void findAll_returnsAllCodes() {
        when(promoCodeRepository.findAll()).thenReturn(List.of(tenantDiscount, ownerReduction));

        List<PromoCodeResponse> result = promoCodeService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCode()).isEqualTo("DESCUENTO20");
        assertThat(result.get(1).getCode()).isEqualTo("OWNER10");
    }

    @Test
    void findAll_whenEmpty_returnsEmptyList() {
        when(promoCodeRepository.findAll()).thenReturn(List.of());

        assertThat(promoCodeService.findAll()).isEmpty();
    }

    // ==========================================
    // findById
    // ==========================================

    @Test
    void findById_whenExists_returnsResponse() {
        when(promoCodeRepository.findById(1L)).thenReturn(Optional.of(tenantDiscount));

        PromoCodeResponse result = promoCodeService.findById(1L);

        assertThat(result.getCode()).isEqualTo("DESCUENTO20");
        assertThat(result.getDiscountRate()).isEqualTo(0.20);
        assertThat(result.getType()).isEqualTo(PromoCodeType.TENANT_DISCOUNT);
    }

    @Test
    void findById_whenNotFound_throwsResourceNotFoundException() {
        when(promoCodeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> promoCodeService.findById(99L));
    }

    // ==========================================
    // create
    // ==========================================

    @Test
    void create_withValidTenantDiscountRequest_savesAndReturnsResponse() {
        PromoCodeRequest request = new PromoCodeRequest(
                "NUEVO30", 0.30, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase("NUEVO30")).thenReturn(Optional.empty());
        when(promoCodeRepository.save(any())).thenAnswer(inv -> {
            PromoCode p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        PromoCodeResponse result = promoCodeService.create(request);

        assertThat(result.getCode()).isEqualTo("NUEVO30");
        assertThat(result.getDiscountRate()).isEqualTo(0.30);
        assertThat(result.getType()).isEqualTo(PromoCodeType.TENANT_DISCOUNT);
        assertThat(result.isActive()).isTrue();
        verify(promoCodeRepository).save(any());
    }

    @Test
    void create_withOwnerReductionType_setsTypeCorrectly() {
        PromoCodeRequest request = new PromoCodeRequest(
                "OWNERCODE", 0.10, true, false, PromoCodeType.OWNER_COMMISSION_REDUCTION, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase("OWNERCODE")).thenReturn(Optional.empty());
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PromoCodeResponse result = promoCodeService.create(request);

        assertThat(result.getType()).isEqualTo(PromoCodeType.OWNER_COMMISSION_REDUCTION);
    }

    @Test
    void create_withNullType_defaultsToTenantDiscount() {
        PromoCodeRequest request = new PromoCodeRequest(
                "SINTYPE", 0.10, true, false, null, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase("SINTYPE")).thenReturn(Optional.empty());
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PromoCodeResponse result = promoCodeService.create(request);

        assertThat(result.getType()).isEqualTo(PromoCodeType.TENANT_DISCOUNT);
    }

    @Test
    void create_withDuplicateCode_throwsPromoCodeAlreadyExistsException() {
        PromoCodeRequest request = new PromoCodeRequest(
                "DESCUENTO20", 0.20, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        assertThrows(PromoCodeAlreadyExistsException.class, () -> promoCodeService.create(request));
        verify(promoCodeRepository, never()).save(any());
    }

    @Test
    void create_codeStoredUppercase() {
        PromoCodeRequest request = new PromoCodeRequest(
                "minusculas", 0.10, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase("minusculas")).thenReturn(Optional.empty());
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.create(request);

        verify(promoCodeRepository).save(argThat(p -> "MINUSCULAS".equals(p.getCode())));
    }

    @Test
    void create_pilotEmailsStoredLowercase() {
        PromoCodeRequest request = new PromoCodeRequest(
                "PILOTTEST", 0.15, true, false, PromoCodeType.TENANT_DISCOUNT, true,
                List.of("User@EXAMPLE.COM", "OTRO@TEST.COM"));
        when(promoCodeRepository.findByCodeIgnoreCase(any())).thenReturn(Optional.empty());
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.create(request);

        verify(promoCodeRepository).save(argThat(p ->
                p.getPilotEmails().contains("user@example.com") &&
                p.getPilotEmails().contains("otro@test.com")));
    }

    @Test
    void create_withNonIntegerDiscountPercent_throwsRuntimeException() {
        PromoCodeRequest request = new PromoCodeRequest(
                "MALRATE", 0.155, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findByCodeIgnoreCase(any())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> promoCodeService.create(request));
        assertThat(ex.getMessage()).containsIgnoringCase("entero");
    }

    // ==========================================
    // update
    // ==========================================

    @Test
    void update_withValidData_updatesAndReturns() {
        PromoCodeRequest request = new PromoCodeRequest(
                "DESCUENTO20", 0.25, false, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findById(1L)).thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PromoCodeResponse result = promoCodeService.update(1L, request);

        assertThat(result.getDiscountRate()).isEqualTo(0.25);
        assertThat(result.isActive()).isFalse();
    }

    @Test
    void update_whenNotFound_throwsResourceNotFoundException() {
        PromoCodeRequest request = new PromoCodeRequest(
                "CUALQUIERA", 0.10, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> promoCodeService.update(99L, request));
    }

    @Test
    void update_withCodeUsedByAnotherPromo_throwsPromoCodeAlreadyExistsException() {
        PromoCode other = buildPromo(99L, "OWNER10", PromoCodeType.OWNER_COMMISSION_REDUCTION,
                0.10, true, false, false, new ArrayList<>(), new ArrayList<>());

        PromoCodeRequest request = new PromoCodeRequest(
                "OWNER10", 0.10, true, false, PromoCodeType.TENANT_DISCOUNT, false, List.of());
        when(promoCodeRepository.findById(1L)).thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.findByCodeIgnoreCase("OWNER10")).thenReturn(Optional.of(other));

        assertThrows(PromoCodeAlreadyExistsException.class, () -> promoCodeService.update(1L, request));
        verify(promoCodeRepository, never()).save(any());
    }

    @Test
    void update_canChangeTypeToOwnerReduction() {
        PromoCodeRequest request = new PromoCodeRequest(
                "DESCUENTO20", 0.20, true, false, PromoCodeType.OWNER_COMMISSION_REDUCTION, false, List.of());
        when(promoCodeRepository.findById(1L)).thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PromoCodeResponse result = promoCodeService.update(1L, request);

        assertThat(result.getType()).isEqualTo(PromoCodeType.OWNER_COMMISSION_REDUCTION);
    }

    // ==========================================
    // validate / validateForTenantDiscount
    // ==========================================

    @Test
    void validate_delegatesToValidateForTenantDiscount() {
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        PromoCodeValidationResponse result = promoCodeService.validate("DESCUENTO20", "user@test.com");

        assertTrue(result.isValid());
        assertThat(result.getDiscountRate()).isEqualTo(0.20);
    }

    @Test
    void validateForTenantDiscount_withValidCode_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("DESCUENTO20", "user@test.com");

        assertTrue(result.isValid());
        assertThat(result.getMessage()).isEqualTo("Código aplicado correctamente");
    }

    @Test
    void validateForTenantDiscount_withOwnerTypeCode_returnsInvalid() {
        // ownerReduction es OWNER_COMMISSION_REDUCTION, no TENANT_DISCOUNT
        when(promoCodeRepository.findByCodeIgnoreCase("OWNER10"))
                .thenReturn(Optional.of(ownerReduction));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("OWNER10", "user@test.com");

        assertFalse(result.isValid());
    }

    @Test
    void validateForTenantDiscount_withUnknownCode_returnsInvalid() {
        when(promoCodeRepository.findByCodeIgnoreCase("INEXISTENTE")).thenReturn(Optional.empty());

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("INEXISTENTE", "user@test.com");

        assertFalse(result.isValid());
        assertThat(result.getDiscountRate()).isNull();
    }

    @Test
    void validateForTenantDiscount_withInactiveCode_returnsInvalid() {
        tenantDiscount.setActive(false);
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("DESCUENTO20", "user@test.com");

        assertFalse(result.isValid());
        assertThat(result.getMessage()).contains("activo");
    }

    @Test
    void validateForTenantDiscount_pilotCode_withAllowedEmail_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("PILOTO15"))
                .thenReturn(Optional.of(pilotCode));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("PILOTO15", "piloto@test.com");

        assertTrue(result.isValid());
        assertThat(result.getDiscountRate()).isEqualTo(0.15);
    }

    @Test
    void validateForTenantDiscount_pilotCode_withDisallowedEmail_returnsInvalid() {
        when(promoCodeRepository.findByCodeIgnoreCase("PILOTO15"))
                .thenReturn(Optional.of(pilotCode));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("PILOTO15", "noautorizado@test.com");

        assertFalse(result.isValid());
    }

    @Test
    void validateForTenantDiscount_pilotCode_emailCaseInsensitive_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("PILOTO15"))
                .thenReturn(Optional.of(pilotCode));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("PILOTO15", "PILOTO@TEST.COM");

        assertTrue(result.isValid());
    }

    @Test
    void validateForTenantDiscount_pilotCode_alreadyUsedByEmail_returnsInvalid() {
        pilotCode.getUsedByEmails().add("piloto@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("PILOTO15"))
                .thenReturn(Optional.of(pilotCode));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("PILOTO15", "piloto@test.com");

        assertFalse(result.isValid());
        assertThat(result.getMessage()).contains("utilizado");
    }

    @Test
    void validateForTenantDiscount_singleUseCode_notYetUsed_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("UNICO25"))
                .thenReturn(Optional.of(singleUseTenant));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("UNICO25", "any@test.com");

        assertTrue(result.isValid());
    }

    @Test
    void validateForTenantDiscount_singleUseCode_alreadyUsed_returnsInvalid() {
        singleUseTenant.getUsedByEmails().add("primero@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("UNICO25"))
                .thenReturn(Optional.of(singleUseTenant));

        PromoCodeValidationResponse result =
                promoCodeService.validateForTenantDiscount("UNICO25", "segundo@test.com");

        assertFalse(result.isValid());
        assertThat(result.getMessage()).contains("utilizado");
    }

    // ==========================================
    // validateForOwnerCommissionReduction
    // ==========================================

    @Test
    void validateForOwnerCommissionReduction_withValidOwnerCode_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("OWNER10"))
                .thenReturn(Optional.of(ownerReduction));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReduction("OWNER10", "owner@test.com");

        assertTrue(result.isValid());
        assertThat(result.getDiscountRate()).isEqualTo(0.10);
    }

    @Test
    void validateForOwnerCommissionReduction_withTenantDiscountCode_returnsInvalid() {
        // tenantDiscount es TENANT_DISCOUNT, no OWNER_COMMISSION_REDUCTION
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReduction("DESCUENTO20", "owner@test.com");

        assertFalse(result.isValid());
    }

    @Test
    void validateForOwnerCommissionReduction_singleUseAlreadyUsed_returnsInvalid() {
        singleUseOwner.getUsedByEmails().add("used@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReduction("OWNERUNICO", "other@test.com");

        assertFalse(result.isValid());
    }

    // ==========================================
    // validateForOwnerCommissionReductionAllowReservedByUser
    // ==========================================

    @Test
    void validateForOwnerCommissionReductionAllowReservedByUser_singleUseReservedBySameUser_returnsValid() {
        // Código single-use ya "reservado" por el mismo usuario (su email ya está en usedByEmails)
        singleUseOwner.getUsedByEmails().add("owner@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser(
                        "OWNERUNICO", "owner@test.com");

        assertTrue(result.isValid());
        assertThat(result.getDiscountRate()).isEqualTo(0.05);
    }

    @Test
    void validateForOwnerCommissionReductionAllowReservedByUser_singleUseReservedByDifferentUser_returnsInvalid() {
        singleUseOwner.getUsedByEmails().add("otro@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser(
                        "OWNERUNICO", "owner@test.com");

        assertFalse(result.isValid());
    }

    @Test
    void validateForOwnerCommissionReductionAllowReservedByUser_multiUseCode_returnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCase("OWNER10"))
                .thenReturn(Optional.of(ownerReduction));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser(
                        "OWNER10", "owner@test.com");

        assertTrue(result.isValid());
    }

    // ==========================================
    // validateForOwnerCommissionReductionAndConsumeSingleUse
    // ==========================================

    @Test
    void validateForOwnerCommissionReductionAndConsumeSingleUse_singleUseNotYetUsed_consumesAndReturnsValid() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAndConsumeSingleUse(
                        "OWNERUNICO", "owner@test.com");

        assertTrue(result.isValid());
        assertThat(singleUseOwner.getUsedByEmails()).contains("owner@test.com");
        verify(promoCodeRepository).save(singleUseOwner);
    }

    @Test
    void validateForOwnerCommissionReductionAndConsumeSingleUse_singleUseAlreadyUsed_returnsInvalid() {
        singleUseOwner.getUsedByEmails().add("otro@test.com");
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAndConsumeSingleUse(
                        "OWNERUNICO", "owner@test.com");

        assertFalse(result.isValid());
        verify(promoCodeRepository, never()).save(any());
    }

    @Test
    void validateForOwnerCommissionReductionAndConsumeSingleUse_multiUseCode_doesNotConsume() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNER10"))
                .thenReturn(Optional.of(ownerReduction));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAndConsumeSingleUse(
                        "OWNER10", "owner@test.com");

        assertTrue(result.isValid());
        // multi-use no debe llamar a save
        verify(promoCodeRepository, never()).save(any());
    }

    @Test
    void validateForOwnerCommissionReductionAndConsumeSingleUse_wrongType_returnsInvalid() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        PromoCodeValidationResponse result =
                promoCodeService.validateForOwnerCommissionReductionAndConsumeSingleUse(
                        "DESCUENTO20", "owner@test.com");

        assertFalse(result.isValid());
        verify(promoCodeRepository, never()).save(any());
    }

    // ==========================================
    // markAsUsed
    // ==========================================

    @Test
    void markAsUsed_withEmail_addsEmailToUsedList() {
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.markAsUsed("DESCUENTO20", "user@test.com");

        assertThat(tenantDiscount.getUsedByEmails()).contains("user@test.com");
        verify(promoCodeRepository).save(tenantDiscount);
    }

    @Test
    void markAsUsed_emailStoredLowercase() {
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.markAsUsed("DESCUENTO20", "USER@TEST.COM");

        assertThat(tenantDiscount.getUsedByEmails()).contains("user@test.com");
    }

    @Test
    void markAsUsed_emailAlreadyPresent_notAddedAgain() {
        tenantDiscount.getUsedByEmails().add("user@test.com");
        when(promoCodeRepository.findByCodeIgnoreCase("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.markAsUsed("DESCUENTO20", "user@test.com");

        assertThat(tenantDiscount.getUsedByEmails()).hasSize(1);
    }

    @Test
    void markAsUsed_withNullEmail_singleUseCode_usesMarker() {
        when(promoCodeRepository.findByCodeIgnoreCase("UNICO25"))
                .thenReturn(Optional.of(singleUseTenant));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.markAsUsed("UNICO25", null);

        assertThat(singleUseTenant.getUsedByEmails()).contains("__single_use_consumed__");
    }

    @Test
    void markAsUsed_withBlankEmail_singleUseCode_usesMarker() {
        when(promoCodeRepository.findByCodeIgnoreCase("UNICO25"))
                .thenReturn(Optional.of(singleUseTenant));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.markAsUsed("UNICO25", "  ");

        assertThat(singleUseTenant.getUsedByEmails()).contains("__single_use_consumed__");
    }

    @Test
    void markAsUsed_withUnknownCode_doesNothing() {
        when(promoCodeRepository.findByCodeIgnoreCase("INEXISTENTE")).thenReturn(Optional.empty());

        promoCodeService.markAsUsed("INEXISTENTE", "user@test.com");

        verify(promoCodeRepository, never()).save(any());
    }

    // ==========================================
    // reserveOwnerSingleUseIfNeeded
    // ==========================================

    @Test
    void reserveOwnerSingleUseIfNeeded_singleUseOwnerCode_addsEmailToUsedList() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));
        when(promoCodeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        promoCodeService.reserveOwnerSingleUseIfNeeded("OWNERUNICO", "owner@test.com");

        assertThat(singleUseOwner.getUsedByEmails()).contains("owner@test.com");
        verify(promoCodeRepository).save(singleUseOwner);
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_multiUseOwnerCode_doesNotSave() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNER10"))
                .thenReturn(Optional.of(ownerReduction));

        promoCodeService.reserveOwnerSingleUseIfNeeded("OWNER10", "owner@test.com");

        verify(promoCodeRepository, never()).save(any());
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_nullCode_doesNothing() {
        promoCodeService.reserveOwnerSingleUseIfNeeded(null, "owner@test.com");

        verify(promoCodeRepository, never()).findByCodeIgnoreCaseForUpdate(any());
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_blankCode_doesNothing() {
        promoCodeService.reserveOwnerSingleUseIfNeeded("  ", "owner@test.com");

        verify(promoCodeRepository, never()).findByCodeIgnoreCaseForUpdate(any());
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_invalidCode_throwsRuntimeException() {
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("INVALIDO"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> promoCodeService.reserveOwnerSingleUseIfNeeded("INVALIDO", "owner@test.com"));
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_wrongType_throwsRuntimeException() {
        // DESCUENTO20 es TENANT_DISCOUNT, reserveOwnerSingleUseIfNeeded espera OWNER_COMMISSION_REDUCTION
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("DESCUENTO20"))
                .thenReturn(Optional.of(tenantDiscount));

        assertThrows(RuntimeException.class,
                () -> promoCodeService.reserveOwnerSingleUseIfNeeded("DESCUENTO20", "owner@test.com"));
    }

    @Test
    void reserveOwnerSingleUseIfNeeded_alreadyReservedBySameUser_doesNotAddAgain() {
        singleUseOwner.getUsedByEmails().add("owner@test.com");
        when(promoCodeRepository.findByCodeIgnoreCaseForUpdate("OWNERUNICO"))
                .thenReturn(Optional.of(singleUseOwner));

        promoCodeService.reserveOwnerSingleUseIfNeeded("OWNERUNICO", "owner@test.com");

        assertThat(singleUseOwner.getUsedByEmails()).hasSize(1);
    }
}
