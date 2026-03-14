package com.example.demo.model;

public enum KitStatus {
    DRAFT, // Creado pero no pagado
    PAID, 
    ACTIVE, // Arrendatario ha recibido el kit
    CANCELLED, // Arrendatario no va a pagar el kit
    FINISHED, // Arrendadores han recibido sus items de vuelta
}

