package com.example.demo.repository;

import com.example.demo.model.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface IncidentCommentRepository extends JpaRepository<IncidentComment, Long> {
    List<IncidentComment> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM IncidentComment c WHERE c.incident.id = :incidentId")
    void deleteByIncidentId(@Param("incidentId") Long incidentId);
}
