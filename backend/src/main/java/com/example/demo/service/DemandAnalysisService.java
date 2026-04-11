package com.example.demo.service;

import com.example.demo.dto.DemandAnalysisDTO;
import com.example.demo.repository.ItemMementoRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandAnalysisService {

    private static final int DEFAULT_TOP_SIZE = 10;

    private final ItemMementoRepository itemMementoRepository;

    public DemandAnalysisService(ItemMementoRepository itemMementoRepository) {
        this.itemMementoRepository = itemMementoRepository;
    }

    public List<DemandAnalysisDTO> getTopDemandedItems(Integer limit) {
        int size = (limit != null && limit > 0) ? limit : DEFAULT_TOP_SIZE;
        Pageable pageable = PageRequest.of(0, size);

        List<Object[]> results = itemMementoRepository.findTopDemandedItems(pageable);
        return mapResultsToDTOs(results);
    }

    public List<DemandAnalysisDTO> getTopDemandedItemsByCategory(String categoryName, Integer limit) {
        int size = (limit != null && limit > 0) ? limit : DEFAULT_TOP_SIZE;
        Pageable pageable = PageRequest.of(0, size);

        List<Object[]> results = itemMementoRepository.findTopDemandedItemsByCategory(categoryName, pageable);
        return mapResultsToDTOs(results);
    }

    private List<DemandAnalysisDTO> mapResultsToDTOs(List<Object[]> results) {
        return results.stream()
                .map(row -> new DemandAnalysisDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (Long) row[4],
                        (Long) row[5]
                ))
                .collect(Collectors.toList());
    }
}
