package com.example.demo.repository;

import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByOwnerId(Long ownerId);
    List<ServiceItem> findByCategoryId(Long categoryId);
    List<ServiceItem> findByStatus(ServiceStatus status);
}
