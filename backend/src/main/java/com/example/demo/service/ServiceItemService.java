package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.model.Service;
import java.util.List;

import com.example.demo.repository.ServiceRepository;

public class ServiceItemService {
    
    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> findAll() {
        return serviceRepository.findAll();
    }

    public Service findById(Long id) {
        return serviceRepository.findById(id).orElse(null);
    }

    public Service save(Service service) {
        return serviceRepository.save(service);
    }

    /**
     * Calcula el precio dinámico de un servicio basado en meses.
     * Si la estancia es menor a un mes, se puede prorratear o cobrar el mínimo.
     */
    public Double calculateDynamicPrice(Long serviceId, int months) {
        Service service = findById(serviceId);
        if (service == null || months <= 0) return 0.0;
        
        return service.getPricePerMonth() * months;
    }
}