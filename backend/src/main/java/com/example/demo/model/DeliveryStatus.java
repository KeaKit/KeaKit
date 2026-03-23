package com.example.demo.model;

public enum DeliveryStatus {
    PICKED_UP, // repartidor tiene el kit
    IN_TRANSIT, // el kit está en camino
    NEARBY, // el kit está cerca del domicilio
    DELIVERED, // entregado al arrendatario
}

