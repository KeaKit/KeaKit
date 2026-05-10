package com.example.demo.promocode;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.demo.BaseControllerTest;
import com.example.demo.controller.AdminPromoCodeController;
import com.example.demo.dto.PromoCodeRequest;
import com.example.demo.dto.PromoCodeResponse;
import com.example.demo.exception.PromoCodeAlreadyExistsException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.PromoCode;
import com.example.demo.model.PromoCodeType;
import com.example.demo.service.PromoCodeService;

@WebMvcTest(AdminPromoCodeController.class)
class AdminPromoCodeControllerTest extends BaseControllerTest {

    @MockitoBean
    private PromoCodeService promoCodeService;

    private static final String BASE_URL = "/api/admin/promo-codes";
    private static final String PROMOCODE_URL = BASE_URL + "/{id}";

    private PromoCodeRequest validRequest;
    private PromoCodeRequest invalidRequest;
    private PromoCode validPromoCode;
    private PromoCodeResponse validResponse;

    @BeforeEach
    void setUp() {
        validRequest = new PromoCodeRequest(
                "PROMO10",
                0.2,
                true,
                false,
                PromoCodeType.TENANT_DISCOUNT,
                false,
                List.of());
        validPromoCode = new PromoCode();
        validPromoCode.setId(1L);
        validPromoCode.setCode(validRequest.code());
        validPromoCode.setDiscountRate(validRequest.discountRate());
        validPromoCode.setActive(validRequest.active());
        validPromoCode.setSingleUse(validRequest.singleUse());
        validPromoCode.setType(validRequest.type());
        validPromoCode.setPilotUserOnly(validRequest.pilotUserOnly());
        validPromoCode.setPilotEmails(validRequest.pilotEmails());
        validResponse = new PromoCodeResponse(validPromoCode);

        invalidRequest = new PromoCodeRequest(
                null,
                0.2,
                true,
                false,
                PromoCodeType.TENANT_DISCOUNT,
                false,
                List.of());
    }

    // CREATE PROMO CODE TESTS

    @Test
    void createPromoCode_success_returns_PromoCodeResponse() throws Exception {
        when(promoCodeService.create(any())).thenReturn(validResponse);

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void createPromoCode_duplicateCode_returns_Conflict() throws Exception {
        when(promoCodeService.create(any())).thenThrow(new PromoCodeAlreadyExistsException());

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void createPromoCode_invalidPromoCode_returns_BadRequest() throws Exception {
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPromoCode_discountRateLessThanMinimum_returns_BadRequest() throws Exception {
        invalidRequest = new PromoCodeRequest(
                "PROMO10",
                0.0, // Descuento del 0%
                true,
                false,
                PromoCodeType.TENANT_DISCOUNT,
                false,
                List.of());

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.discountRate").exists());
    }

    // UPDATE PROMO CODE TESTS

    @Test
    void updatePromoCode_success_returns_PromoCodeResponse() throws Exception {
        when(promoCodeService.update(any(), any())).thenReturn(validResponse);

        mockMvc.perform(put(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(validResponse.getId()));
    }

    @Test
    void updatePromoCode_notFound_returns_NotFound() throws Exception {
        when(promoCodeService.update(any(), any()))
                .thenThrow(new ResourceNotFoundException("Código promocional no encontrado"));

        mockMvc.perform(put(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePromoCode_duplicateCode_returns_Conflict() throws Exception {
        when(promoCodeService.update(any(), any())).thenThrow(new PromoCodeAlreadyExistsException());
        mockMvc.perform(put(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void updatePromoCode_discountRateLessThanMinimum_returns_BadRequest() throws Exception {
        invalidRequest = new PromoCodeRequest(
                "PROMO10",
                0.0, // Descuento del 0%
                true,
                false,
                PromoCodeType.TENANT_DISCOUNT,
                false,
                List.of());

        mockMvc.perform(put(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.discountRate").exists());
    }

    // GET PROMO CODE TESTS

    @Test
    void getPromoCodeById_success_returns_PromoCodeResponse() throws Exception {
        when(promoCodeService.findById(validPromoCode.getId())).thenReturn(validResponse);

        mockMvc.perform(get(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(validResponse.getId()));
    }

    @Test
    void getPromoCodeById_notFound_returns_NotFound() throws Exception {
        when(promoCodeService.findById(validPromoCode.getId()))
                .thenThrow(new ResourceNotFoundException("Código promocional no encontrado"));

        mockMvc.perform(get(PROMOCODE_URL, validPromoCode.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

}