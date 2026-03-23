package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.example.demo.model.Incident;
import com.example.demo.model.IncidentComment;
import com.example.demo.model.IncidentStatus;
import com.example.demo.model.Item;
import com.example.demo.model.User;
import com.example.demo.repository.IncidentCommentRepository;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserRepository;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private IncidentCommentRepository incidentCommentRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    public List<Incident> getIncidentsByUserId(Long userId) {
        return incidentRepository.findByUserId(userId);
    }

    public List<Incident> getReceivedIncidentsByOwnerId(Long ownerId) {
        return incidentRepository.findReceivedByOwnerId(ownerId);
    }

    public Incident createIncident(Incident incident) {
        if (incident.getUser() != null && incident.getUser().getId() != null) {
            User user = userRepository.findById(incident.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            incident.setUser(user);
        }
        if (incident.getRelatedItem() != null && incident.getRelatedItem().getId() != null) {
            Item relatedItem = itemRepository.findById(incident.getRelatedItem().getId())
                .orElseThrow(() -> new RuntimeException("Objeto relacionado no encontrado"));
            incident.setRelatedItem(relatedItem);
        }
        return incidentRepository.save(incident);
    }

    public Incident updateIncident(Long id, Incident updateData) {
        Incident incident = getIncidentById(id);

        if (updateData.getTitle() != null && !updateData.getTitle().trim().isEmpty()) {
            incident.setTitle(updateData.getTitle());
        }
        if (updateData.getDescription() != null && !updateData.getDescription().trim().isEmpty()) {
            incident.setDescription(updateData.getDescription());
        }
        if (updateData.getStatus() != null) {
            incident.setStatus(updateData.getStatus());
        }

        return incidentRepository.save(incident);
    }

    public Incident resolveIncident(Long id) {
        Incident incident = getIncidentById(id);
        incident.setStatus(IncidentStatus.RESOLVED);
        return incidentRepository.save(incident);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = getIncidentById(id);
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new RuntimeException("No se puede eliminar una incidencia resuelta");
        }
        incidentCommentRepository.deleteByIncidentId(id);
        incidentRepository.delete(incident);
    }

    // Métodos de comentarios
    public List<IncidentComment> getCommentsByIncidentId(Long incidentId) {
        return incidentCommentRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
    }

    public IncidentComment addComment(Long incidentId, IncidentComment comment) {
        Incident incident = getIncidentById(incidentId);
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new RuntimeException("No se pueden añadir comentarios a una incidencia resuelta");
        }
        comment.setIncident(incident);
        if (comment.getAuthor() != null && comment.getAuthor().getId() != null) {
            User author = userRepository.findById(comment.getAuthor().getId())
                .orElseThrow(() -> new RuntimeException("Author not found"));
            comment.setAuthor(author);
        }
        return incidentCommentRepository.save(comment);
    }
}