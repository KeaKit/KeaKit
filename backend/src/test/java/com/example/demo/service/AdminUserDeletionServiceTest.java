package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AdminUserDeletionServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock
    private KitItemRepository kitItemRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private AdminUserDeletionService adminUserDeletionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    
    @Test
    void deleteUserWithItems_userHasActiveKits_throws() {
        User user = new User();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(1L, KitStatus.ACTIVE))
                .thenReturn(List.of(new Kit()));
        when(kitRepository.findByTenantIdAndStatus(1L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> adminUserDeletionService.deleteUserWithItems(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("alquiler(es) activo(s)");

        verify(userRepository).findById(1L);
    }

    @Test
    void deleteUserWithItems_userHasPaidKits_throws() {
        User user = new User();
        user.setId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(2L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(2L, KitStatus.PAID))
                .thenReturn(List.of(new Kit()));

        assertThatThrownBy(() -> adminUserDeletionService.deleteUserWithItems(2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("alquiler(es) pagado(s)");

        verify(userRepository).findById(2L);
    }

    @Test
    void deleteUserWithItems_userHasActiveAndPaidKits_throws() {
        User user = new User();
        user.setId(3L);

        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(3L, KitStatus.ACTIVE))
                .thenReturn(List.of(new Kit()));
        when(kitRepository.findByTenantIdAndStatus(3L, KitStatus.PAID))
                .thenReturn(List.of(new Kit()));

        assertThatThrownBy(() -> adminUserDeletionService.deleteUserWithItems(3L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("activo(s) y 1 alquiler(es) pagado(s)");

        verify(userRepository).findById(3L);
    }

    @Test
    void deleteUserWithItems_itemInActiveKit_throws() {
        User user = new User();
        user.setId(4L);

        Item item = new Article();
        item.setId(10L);
        item.setTitle("Taladro");

        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(4L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(4L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());
        when(itemRepository.findByOwnerId(4L)).thenReturn(List.of(item));

        when(kitRepository.existsByItemIdAndStatusNotIn(eq(10L), any()))
                .thenReturn(true);

        assertThatThrownBy(() -> adminUserDeletionService.deleteUserWithItems(4L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Taladro");

        verify(itemRepository).findByOwnerId(4L);
    }

    @Test
    void deleteUserWithItems_success() {
        User user = new User();
        user.setId(5L);

        Item item = new Article();
        item.setId(20L);
        item.setTitle("Martillo");

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(5L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(5L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());
        when(itemRepository.findByOwnerId(5L)).thenReturn(List.of(item));

        when(kitRepository.existsByItemIdAndStatusNotIn(eq(20L), any()))
                .thenReturn(false);

        when(kitRepository.findByTenantIdAndStatus(5L, KitStatus.DRAFT))
                .thenReturn(Collections.emptyList());

        doNothing().when(walletRepository).deleteByUserId(5L);

        adminUserDeletionService.deleteUserWithItems(5L);

        verify(kitItemRepository).deleteByItemId(20L);
        verify(articleRepository).deleteByOwnerId(5L);
        verify(serviceRepository).deleteByOwnerId(5L);
        verify(walletRepository).deleteByUserId(5L);
        verify(userRepository).delete(user);
    }


    @Test
    void deleteUserWithItems_noItems_success() {
        User user = new User();
        user.setId(6L);

        when(userRepository.findById(6L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(6L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(6L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());
        when(itemRepository.findByOwnerId(6L)).thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(6L, KitStatus.DRAFT))
                .thenReturn(Collections.emptyList());

        adminUserDeletionService.deleteUserWithItems(6L);

        verify(articleRepository).deleteByOwnerId(6L);
        verify(serviceRepository).deleteByOwnerId(6L);
        verify(walletRepository).deleteByUserId(6L);
        verify(userRepository).delete(user);
    }

    @Test
    void deleteUserWithItems_draftKitsAreDeleted() {
        User user = new User();
        user.setId(7L);

        Kit draftKit = new Kit();
        draftKit.setId(100L);

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(7L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(7L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());
        when(itemRepository.findByOwnerId(7L)).thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(7L, KitStatus.DRAFT))
                .thenReturn(List.of(draftKit));

        adminUserDeletionService.deleteUserWithItems(7L);

        verify(kitRepository).delete(draftKit);
    }

    @Test
    void deleteUserWithItems_finishedKitsTenantSetToNull() {
        User user = new User();
        user.setId(8L);

        when(userRepository.findById(8L)).thenReturn(Optional.of(user));
        when(kitRepository.findByTenantIdAndStatus(8L, KitStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(8L, KitStatus.PAID))
                .thenReturn(Collections.emptyList());
        when(itemRepository.findByOwnerId(8L)).thenReturn(Collections.emptyList());
        when(kitRepository.findByTenantIdAndStatus(8L, KitStatus.DRAFT))
                .thenReturn(Collections.emptyList());

        adminUserDeletionService.deleteUserWithItems(8L);

        verify(kitRepository).updateTenantToNullForFinishedKits(8L);
    }
}
