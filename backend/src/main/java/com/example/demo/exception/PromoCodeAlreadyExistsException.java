package com.example.demo.exception;

public class PromoCodeAlreadyExistsException extends RuntimeException {
    public PromoCodeAlreadyExistsException() {
        super("Este código promocional ya existe");
    }
}
