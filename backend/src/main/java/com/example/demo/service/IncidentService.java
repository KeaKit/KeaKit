package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.demo.model.Incident;
import com.example.demo.repository.IncidentRepository;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    public Incident createIncident(Incident incident) {
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
        if (updateData.getType() != null) {
            incident.setType(updateData.getType());
        }
        if (updateData.getStatus() != null) {
            incident.setStatus(updateData.getStatus());
        }
        if (updateData.getRelatedItem() != null) {
            incident.setRelatedItem(updateData.getRelatedItem());
        }

        return incidentRepository.save(incident);
    }

    public void deleteIncident(Long id) {
        Incident incident = getIncidentById(id);
        incidentRepository.delete(incident);
    }
}