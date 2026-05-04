package com.example.demo.promocode;

import com.example.demo.BaseControllerTest;
import com.example.demo.controller.PromoCodeController;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.service.PromoCodeService;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PromoCodeController.class)
class PromoCodeControllerTest extends BaseControllerTest {

    @MockitoBean
    private PromoCodeService promoCodeService;

    private static final String VALIDATE_URL = "/api/promo-codes/validate";

    // ==========================================
    // GET /api/promo-codes/validate — sin type (por defecto TENANT_DISCOUNT)
    // ==========================================

    @Test
    void validate_noType_defaultsTenantDiscount_valid_returnsOk() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(true, 0.20, "Código aplicado correctamente");
        when(promoCodeService.validateForTenantDiscount("DESCUENTO20", "user@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "DESCUENTO20")
                .param("email", "user@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.discountRate").value(0.20))
                .andExpect(jsonPath("$.message").value("Código aplicado correctamente"));

        verify(promoCodeService).validateForTenantDiscount("DESCUENTO20", "user@test.com");
    }

    @Test
    void validate_noType_invalidCode_returnsOkWithInvalidResponse() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        when(promoCodeService.validateForTenantDiscount("INVALIDO", "user@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "INVALIDO")
                .param("email", "user@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.discountRate").doesNotExist())
                .andExpect(jsonPath("$.message").value("Código promocional no válido"));
    }

    @Test
    void validate_noType_inactiveCode_returnsInvalid() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Este código promocional no está activo");
        when(promoCodeService.validateForTenantDiscount("INACTIVO", "user@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "INACTIVO")
                .param("email", "user@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Este código promocional no está activo"));
    }

    @Test
    void validate_noType_alreadyUsed_returnsInvalid() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Código promocional ya utilizado");
        when(promoCodeService.validateForTenantDiscount("UNICO15", "user@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "UNICO15")
                .param("email", "user@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Código promocional ya utilizado"));
    }

    // ==========================================
    // GET /api/promo-codes/validate — type=TENANT_DISCOUNT explícito
    // ==========================================

    @Test
    void validate_withTypeTenantDiscount_callsValidateForTenantDiscount() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(true, 0.15, "Código aplicado correctamente");
        when(promoCodeService.validateForTenantDiscount("DESCUENTO15", "tenant@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "DESCUENTO15")
                .param("email", "tenant@test.com")
                .param("type", "TENANT_DISCOUNT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.discountRate").value(0.15));

        verify(promoCodeService).validateForTenantDiscount("DESCUENTO15", "tenant@test.com");
    }

    // ==========================================
    // GET /api/promo-codes/validate — type=OWNER_COMMISSION_REDUCTION
    // ==========================================

    @Test
    void validate_withTypeOwnerCommissionReduction_callsValidateForOwnerCommissionReduction() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente");
        when(promoCodeService.validateForOwnerCommissionReduction("OWNER10", "owner@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "OWNER10")
                .param("email", "owner@test.com")
                .param("type", "OWNER_COMMISSION_REDUCTION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.discountRate").value(0.10));

        verify(promoCodeService).validateForOwnerCommissionReduction("OWNER10", "owner@test.com");
    }

    @Test
    void validate_ownerType_invalidCode_returnsInvalid() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        when(promoCodeService.validateForOwnerCommissionReduction("INVALIDO", "owner@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "INVALIDO")
                .param("email", "owner@test.com")
                .param("type", "OWNER_COMMISSION_REDUCTION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void validate_ownerType_codeIsActuallyTenantDiscount_returnsInvalid() throws Exception {
        // Un código de tipo TENANT_DISCOUNT no es válido para OWNER_COMMISSION_REDUCTION
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Código promocional no válido");
        when(promoCodeService.validateForOwnerCommissionReduction("DESCUENTO20", "owner@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "DESCUENTO20")
                .param("email", "owner@test.com")
                .param("type", "OWNER_COMMISSION_REDUCTION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void validate_ownerType_alreadyUsed_returnsInvalid() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(false, null, "Código promocional ya utilizado");
        when(promoCodeService.validateForOwnerCommissionReduction("OWNERUNICO", "owner@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "OWNERUNICO")
                .param("email", "owner@test.com")
                .param("type", "OWNER_COMMISSION_REDUCTION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.message").value("Código promocional ya utilizado"));
    }

    // ==========================================
    // Parámetros obligatorios faltantes
    // ==========================================

    @Test
    void validate_missingCodeParam_returnsServerError() throws Exception {
        mockMvc.perform(get(VALIDATE_URL)
                .param("email", "user@test.com"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void validate_missingEmailParam_returnsServerError() throws Exception {
        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "DESCUENTO20"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void validate_missingBothParams_returnsServerError() throws Exception {
        mockMvc.perform(get(VALIDATE_URL))
                .andExpect(status().isInternalServerError());
    }

    // ==========================================
    // Verificar que el tipo correcto de método es invocado según el parámetro type
    // ==========================================

    @Test
    void validate_noType_neverCallsOwnerCommissionReductionMethod() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(true, 0.20, "Código aplicado correctamente");
        when(promoCodeService.validateForTenantDiscount("DESCUENTO20", "user@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "DESCUENTO20")
                .param("email", "user@test.com"))
                .andExpect(status().isOk());

        // Solo debe llamarse validateForTenantDiscount, nunca validateForOwnerCommissionReduction
        verify(promoCodeService).validateForTenantDiscount("DESCUENTO20", "user@test.com");
        org.mockito.Mockito.verify(promoCodeService,
                org.mockito.Mockito.never())
                .validateForOwnerCommissionReduction(
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void validate_ownerType_neverCallsTenantDiscountMethod() throws Exception {
        PromoCodeValidationResponse response =
                new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente");
        when(promoCodeService.validateForOwnerCommissionReduction("OWNER10", "owner@test.com"))
                .thenReturn(response);

        mockMvc.perform(get(VALIDATE_URL)
                .param("code", "OWNER10")
                .param("email", "owner@test.com")
                .param("type", "OWNER_COMMISSION_REDUCTION"))
                .andExpect(status().isOk());

        verify(promoCodeService).validateForOwnerCommissionReduction("OWNER10", "owner@test.com");
        org.mockito.Mockito.verify(promoCodeService,
                org.mockito.Mockito.never())
                .validateForTenantDiscount(
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.anyString());
    }
}
