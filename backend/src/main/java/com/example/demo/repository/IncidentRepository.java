package com.example.demo.repository;

import com.example.demo.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByUserId(Long userId);

    @Query("SELECT i FROM Incident i WHERE i.relatedItem.owner.id = :ownerId")
    List<Incident> findReceivedByOwnerId(@Param("ownerId") Long ownerId);
}
