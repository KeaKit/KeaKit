package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.example.demo.dto.IncidentRequestDTO;
import com.example.demo.model.Incident;
import com.example.demo.model.IncidentComment;
import com.example.demo.model.IncidentStatus;
import com.example.demo.model.IncidentType;
import com.example.demo.model.Item;
import com.example.demo.model.Kit;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.IncidentCommentRepository;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
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

    @Autowired
    private KitRepository kitRepository;

    public List<Incident> getAllIncidents() {
        if (!checkUserAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para listar las incidencias.");
        }
        return incidentRepository.findAll();
    }
    
    private boolean checkUserAuthor(Incident incident) {
        String currentUserEmail = getCurrentUserEmail();
        return incident.getUser().getEmail().equals(currentUserEmail);
    } 

    private boolean checkUserAdmin() {
        String currentUserEmail = getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

        return currentUser.getRole() == UserRole.ADMIN;
    }

    private boolean checkUserOwner(Incident incident) {
        String currentUserEmail = getCurrentUserEmail();
        boolean isOwner = false;

        if (incident.getType() == IncidentType.DAMAGED_ITEM && incident.getRelatedItem() != null) {
            isOwner = incident.getRelatedItem().getOwner().getEmail().equals(currentUserEmail);
        }
        
        return isOwner;
    }

    public Incident getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));

        if (!(checkUserAdmin() || checkUserAuthor(incident) || checkUserOwner(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para ver esta incidencia.");
        }

        return incident;
    }

    public List<Incident> getIncidentsByUserId(Long userId) {
        List<Incident> incidents = incidentRepository.findByUserId(userId);
        if (incidents.isEmpty()) return incidents; // Protección anti-errores

        if (!(checkUserAdmin() || checkUserAuthor(incidents.get(0)))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para listar las incidencias");
        }
        return incidents;
    }

    public List<Incident> getReceivedIncidentsByOwnerId(Long ownerId) {
        List<Incident> incidents = incidentRepository.findReceivedByOwnerId(ownerId);
        if (incidents.isEmpty()) return incidents; // Protección anti-errores

        if (!(checkUserAdmin() || checkUserOwner(incidents.get(0)))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para listar las incidencias");
        }
        return incidents;
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
        if (incident.getRelatedKit() != null && incident.getRelatedKit().getId() != null) {
            Kit relatedKit = kitRepository.findById(incident.getRelatedKit().getId())
                .orElseThrow(() -> new RuntimeException("Kit de alquiler no encontrado"));
            incident.setRelatedKit(relatedKit);
        }
        validateIncident(incident);
        return incidentRepository.save(incident);
    }

    public Incident createIncident(IncidentRequestDTO dto) {
    Incident incident = new Incident();
    
    incident.setTitle(dto.getTitle());
    incident.setDescription(dto.getDescription());
    incident.setType(dto.getType());

    if (dto.getUser() != null && dto.getUser().getId() != null) {
        User user = userRepository.findById(dto.getUser().getId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        incident.setUser(user);
    }
    
    if (dto.getRelatedItem() != null && dto.getRelatedItem().getId() != null) {
        Item relatedItem = itemRepository.findById(dto.getRelatedItem().getId())
            .orElseThrow(() -> new RuntimeException("Objeto relacionado no encontrado"));
        incident.setRelatedItem(relatedItem);
    }
    
    if (dto.getRelatedKit() != null && dto.getRelatedKit().getId() != null) {
        Kit relatedKit = kitRepository.findById(dto.getRelatedKit().getId())
            .orElseThrow(() -> new RuntimeException("Kit de alquiler no encontrado"));
        incident.setRelatedKit(relatedKit);
    }

    validateIncident(incident);
    return incidentRepository.save(incident);
}

    public Incident updateIncident(Long id, Incident updateData) {
        Incident incident = getIncidentById(id);

        if (!(checkUserAdmin() || checkUserAuthor(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para modificar esta incidencia.");
        }

        if (updateData.getTitle() != null ) {
            incident.setTitle(updateData.getTitle());
        }
        if (updateData.getDescription() != null) {
            incident.setDescription(updateData.getDescription());
        }
        if (updateData.getStatus() != null) {
            incident.setStatus(updateData.getStatus());
        }

        validateIncident(incident);

        return incidentRepository.save(incident);
    }

    public Incident resolveIncident(Long id) {
        Incident incident = getIncidentById(id);
        
        if (!(checkUserAdmin() || checkUserAuthor(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para modificar esta incidencia.");
        }
        
        incident.setStatus(IncidentStatus.RESOLVED);
        return incidentRepository.save(incident);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = getIncidentById(id);
        
        if (!(checkUserAdmin() || checkUserAuthor(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para modificar esta incidencia.");
        }
        
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new RuntimeException("No se puede eliminar una incidencia resuelta");
        }
        incidentCommentRepository.deleteByIncidentId(id);
        incidentRepository.delete(incident);
    }

    public List<IncidentComment> getCommentsByIncidentId(Long incidentId) {
        Incident incident = getIncidentById(incidentId);
        
        if (!(checkUserAdmin() || checkUserAuthor(incident) || checkUserOwner(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para ver esta incidencia.");
        }
        return incidentCommentRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
    }

    public IncidentComment addComment(Long incidentId, IncidentComment comment) {
        Incident incident = getIncidentById(incidentId);
        
        if (!(checkUserAdmin() || checkUserAuthor(incident) || checkUserOwner(incident))) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permiso para modificar esta incidencia.");
        }
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new RuntimeException("No se pueden añadir comentarios a una incidencia resuelta");
        }
        comment.setIncident(incident);
        if (comment.getAuthor() != null && comment.getAuthor().getId() != null) {
            User author = userRepository.findById(comment.getAuthor().getId())
                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
            comment.setAuthor(author);
        }
        return incidentCommentRepository.save(comment);
    }

    public void validateIncident(Incident incident) {
        if (incident.getTitle() == null || incident.getTitle().isBlank()) {
            throw new IllegalArgumentException("El título de la incidencia es obligatorio.");
        }
        if (incident.getDescription() == null || incident.getDescription().isBlank()) {
            throw new IllegalArgumentException("La descripción de la incidencia es obligatoria.");
        }

        if (incident.getType() == IncidentType.DAMAGED_ITEM) {
            if (incident.getRelatedItem() == null) {
                throw new IllegalArgumentException("Para incidencias de tipo objeto dañado, el ítem es obligatorio.");
            }
        }

        if (incident.getType() == IncidentType.GENERAL) {
            incident.setRelatedItem(null);
            incident.setRelatedKit(null);
        }
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}