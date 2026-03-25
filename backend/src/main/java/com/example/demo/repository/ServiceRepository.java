package com.example.demo.repository;

import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByOwnerId(Long ownerId);
    List<ServiceItem> findByCategoryId(Long categoryId);
    List<ServiceItem> findByStatus(ServiceStatus status);

    @Modifying
    @Transactional
    @Query("DELETE FROM ServiceItem s WHERE s.owner.id = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
