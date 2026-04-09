package com.example.demo.demandanalysis;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;

import com.example.demo.model.Category;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.repository.ItemMementoRepository;

@DataJpaTest
class ItemMementoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ItemMementoRepository itemMementoRepository;

    // Verifica que la consulta agrupa correctamente por artículo, suma las unidades, 
    // cuenta las veces alquilado y ordena por popularidad.
    @Test
    void findTopDemandedItems_groupsAndOrdersCorrectly() {
        Kit kitPaid = createAndPersistKit(KitStatus.PAID);
        Kit kitActive = createAndPersistKit(KitStatus.ACTIVE);

        // Artículo 1: Alquilado 2 veces (Total unidades: 3)
        createAndPersistMemento(10L, "Laptop", null, 1, kitPaid);
        createAndPersistMemento(10L, "Laptop", null, 2, kitActive);

        // Artículo 2: Alquilado 1 vez (Total unidades: 5)
        createAndPersistMemento(20L, "Taladro", null, 5, kitPaid);

        List<Object[]> results = itemMementoRepository.findTopDemandedItems(PageRequest.of(0, 10));

        assertEquals(2, results.size());
        
        // El primero debe ser la Laptop porque se ha alquilado más veces (COUNT=2)
        Object[] top1 = results.get(0);
        assertEquals(10L, top1[0]); // originalItemId
        assertEquals("Laptop", top1[1]); // nameAtRental
        assertEquals(2L, top1[4]); // COUNT(s) -> 2 veces alquilado
        assertEquals(3L, top1[5]); // SUM(units) -> 1 + 2 = 3 unidades

        // El segundo debe ser el Taladro (COUNT=1)
        Object[] top2 = results.get(1);
        assertEquals(20L, top2[0]);
        assertEquals(1L, top2[4]); // COUNT(s) -> 1 vez alquilado
        assertEquals(5L, top2[5]); // SUM(units) -> 5 unidades
    }

    // Verifica que la consulta excluye los kits en estado DRAFT, CANCELLED, etc.
    @Test
    void findTopDemandedItems_ignoresInvalidKitStatuses() {
        Kit kitDraft = createAndPersistKit(KitStatus.DRAFT);
        Kit kitPaid = createAndPersistKit(KitStatus.PAID);

        createAndPersistMemento(10L, "Laptop", null, 1, kitDraft); // No debe contar
        createAndPersistMemento(20L, "Taladro", null, 1, kitPaid); // Sí debe contar

        List<Object[]> results = itemMementoRepository.findTopDemandedItems(PageRequest.of(0, 10));

        assertEquals(1, results.size());
        assertEquals(20L, results.get(0)[0]); // Solo recupera el Taladro
    }

    // Verifica que el filtrado por categoría exacta funciona correctamente y respeta el LEFT JOIN
    @Test
    void findTopDemandedItemsByCategory_filtersCorrectly() {
        // Usamos el nuevo helper para que no falte ningún campo obligatorio
        Category techCategory = createAndPersistCategory("Tecnologia");

        Kit kitActive = createAndPersistKit(KitStatus.ACTIVE);

        createAndPersistMemento(10L, "Laptop", techCategory, 1, kitActive);
        createAndPersistMemento(20L, "Bicicleta", null, 1, kitActive);

        List<Object[]> results = itemMementoRepository.findTopDemandedItemsByCategory("Tecnologia", PageRequest.of(0, 10));

        assertEquals(1, results.size());
        assertEquals(10L, results.get(0)[0]); // Solo trae la Laptop
        assertEquals("Tecnologia", results.get(0)[2]); // categoryName
    }

    // Helper para crear Kits
    private Kit createAndPersistKit(KitStatus status) {
        Kit kit = new Kit();
        kit.setStatus(status);
        return entityManager.persist(kit);
    }

    // Helper para crear Mementos (Items)
    private ItemMemento createAndPersistMemento(Long originalId, String name, Category category, int units, Kit kit) {
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(originalId);
        memento.setNameAtRental(name);
        memento.setCategoryAtRental(category);
        memento.setSelectedUnits(units);
        memento.setPriceAtRental(10.0);
        memento.setKit(kit);
        return entityManager.persist(memento);
    }

    private Category createAndPersistCategory(String name) {
        Category category = new Category();
        category.setName(name);
        category.setDescription("Descripción de prueba");
        
        // NOTA: Si en tu modelo estos campos son Double, usa 0.0 y 1000.0. 
        // Si son BigDecimal, usa BigDecimal.ZERO y BigDecimal.valueOf(1000.0)
        category.setMinPrice(0.0);  
        category.setMaxPrice(1000.0); 
        
        // Si 'status' es un Enum (ej. CategoryStatus.ACTIVE), asígnalo aquí:
        // category.setStatus(CategoryStatus.ACTIVE); 
        
        return entityManager.persist(category);
    }
}