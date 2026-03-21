package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.KitDelivery;

import java.util.List;

public interface KitDeliveryRepository extends JpaRepository<KitDelivery, Long> {
    Optional<KitDelivery> findByKitId(Long kitId);

    List<KitDelivery> findByAssignedCourierId(Long courierId);

}
