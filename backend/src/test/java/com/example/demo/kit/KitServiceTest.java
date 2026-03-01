package com.example.demo.kit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.Article;
import com.example.demo.repository.ItemRepository;
import com.example.demo.model.User;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.KitService;

@ExtendWith(MockitoExtension.class)
public class KitServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private KitService kitService;

    // TEST DE ESTADO DE UN KIT Y ALGUNAS VALIDACIONES

    @Test
    void createKit_withExplicitStatus_success() {
        KitCreateRequest req = new KitCreateRequest();
        req.setName("Kit Test");
        req.setStatus(KitStatus.ACTIVE);

        when(kitRepository.save(any())).thenAnswer(inv -> {
            Kit k = inv.getArgument(0);
            k.setId(1L);
            return k;
        });

        KitResponse res = kitService.create(req);

        assertEquals(KitStatus.ACTIVE, res.getStatus());
    }


    @Test
    void createKit_withoutStatus_defaultsToUpcoming() {
        KitCreateRequest req = new KitCreateRequest();
        req.setName("Kit Test");

        when(kitRepository.save(any())).thenAnswer(inv -> {
            Kit k = inv.getArgument(0);
            k.setId(1L);
            return k;
        });

        KitResponse res = kitService.create(req);

        assertEquals(KitStatus.UPCOMING, res.getStatus());
    }

    @Test
    void updateKit_changeStatus_success() {
        Kit existing = new Kit();
        existing.setId(1L);
        existing.setStatus(KitStatus.UPCOMING);

        Kit update = new Kit();
        update.setStatus(KitStatus.ACTIVE);

        when(kitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(kitRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        KitResponse res = kitService.update(1L, update);

        assertEquals(KitStatus.ACTIVE, res.getStatus());
    }

    @Test
    void updateKit_notFound_throwsException() {
        when(kitRepository.findById(1L)).thenReturn(Optional.empty());

        Kit update = new Kit();
        update.setStatus(KitStatus.ACTIVE);

        assertThrows(RuntimeException.class, () -> kitService.update(1L, update));
    }

    @Test
    void createKit_invalidDates_throwsException() {
        KitCreateRequest req = new KitCreateRequest();
        req.setStartDate(LocalDate.of(2024, 5, 10));
        req.setEndDate(LocalDate.of(2024, 5, 1));

        assertThrows(RuntimeException.class, () -> kitService.create(req));
    }

    @Test
    void updateKit_invalidDates_throwsException() {
        Kit existing = new Kit();
        existing.setId(1L);
        existing.setStartDate(LocalDate.of(2024, 5, 1));
        existing.setEndDate(LocalDate.of(2024, 5, 10));

        Kit update = new Kit();
        update.setStartDate(LocalDate.of(2024, 6, 1));
        update.setEndDate(LocalDate.of(2024, 5, 1));

        when(kitRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class, () -> kitService.update(1L, update));
    }

    @Test
    void findTrackingKitById_success() {
        User tenant = new User();
        tenant.setId(10L);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.ACTIVE);
        kit.setTenant(tenant);

        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));

        KitResponse res = kitService.findTrackingKitById(1L, 10L);

        assertEquals(KitStatus.ACTIVE, res.getStatus());
    }

    @Test
    void findTrackingKitById_wrongTenant_throwsException() {
        User tenant = new User();
        tenant.setId(10L);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.ACTIVE);
        kit.setTenant(tenant);

        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));

        assertThrows(RuntimeException.class, () -> kitService.findTrackingKitById(1L, 99L));
    }

    @Test
    void createKit_itemQuantityExceedsTotalUnits_throwsException() {
        KitCreateRequest req = new KitCreateRequest();
        req.setName("Kit con exceso");

        KitCreateRequest.KitItemSelectionRequest selection = new KitCreateRequest.KitItemSelectionRequest();
        selection.setItemId(5L);
        selection.setQuantity(3);
        req.setItemSelections(List.of(selection));

        Article article = new Article();
        article.setId(5L);
        article.setTotalUnits(2);

        when(itemRepository.findAllById(any())).thenReturn(List.of(article));

        assertThrows(RuntimeException.class, () -> kitService.create(req));
    }

    @Test
    void createKit_withItemSelections_success() {
        KitCreateRequest req = new KitCreateRequest();
        req.setName("Kit con cantidades");

        KitCreateRequest.KitItemSelectionRequest selection = new KitCreateRequest.KitItemSelectionRequest();
        selection.setItemId(5L);
        selection.setQuantity(2);
        req.setItemSelections(List.of(selection));

        Article article = new Article();
        article.setId(5L);
        article.setTotalUnits(3);

        when(itemRepository.findAllById(any())).thenReturn(List.of(article));
        when(kitRepository.save(any())).thenAnswer(inv -> {
            Kit k = inv.getArgument(0);
            k.setId(99L);
            return k;
        });

        KitResponse res = kitService.create(req);

        assertNotNull(res.getItemSelections());
        assertEquals(1, res.getItemSelections().size());
        assertEquals(5L, res.getItemSelections().get(0).getItemId());
        assertEquals(2, res.getItemSelections().get(0).getQuantity());
        assertEquals(2, res.getTotalSelectedItems());
    }
}
