package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserDeletionService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final ServiceRepository serviceRepository;
    private final ItemRepository itemRepository;
    private final KitRepository kitRepository;
    private final KitItemRepository kitItemRepository;
    private final WalletRepository walletRepository;

    public AdminUserDeletionService(
            UserRepository userRepository,
            ArticleRepository articleRepository,
            ServiceRepository serviceRepository,
            ItemRepository itemRepository,
            KitRepository kitRepository,
            KitItemRepository kitItemRepository,
            WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.serviceRepository = serviceRepository;
        this.itemRepository = itemRepository;
        this.kitRepository = kitRepository;
        this.kitItemRepository = kitItemRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public void deleteUserWithItems(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Kit> activeKitsAsTenant = kitRepository.findByTenantIdAndStatus(userId, KitStatus.ACTIVE);
        List<Kit> paidKitsAsTenant = kitRepository.findByTenantIdAndStatus(userId, KitStatus.PAID);
        
        if (!activeKitsAsTenant.isEmpty() || !paidKitsAsTenant.isEmpty()) {
            int activeCount = activeKitsAsTenant.size();
            int paidCount = paidKitsAsTenant.size();
            
            String message;
            if (activeCount > 0 && paidCount > 0) {
                message = String.format(
                    "No se puede eliminar el usuario porque tiene %d alquiler(es) activo(s) y %d alquiler(es) pagado(s) pendientes. " +
                    "Debe esperar a que finalicen o cancelarlos primero.",
                    activeCount, paidCount
                );
            } else if (activeCount > 0) {
                message = String.format(
                    "No se puede eliminar el usuario porque tiene %d alquiler(es) activo(s). " +
                    "Debe esperar a que finalicen antes de eliminar al usuario.",
                    activeCount
                );
            } else {
                message = String.format(
                    "No se puede eliminar el usuario porque tiene %d alquiler(es) pagado(s) pendientes. " +
                    "Debe esperar a que se entreguen o cancelarlos antes de eliminar.",
                    paidCount
                );
            }
            throw new RuntimeException(message);
        }

        List<Item> userItems = itemRepository.findByOwnerId(userId);

        for (Item item : userItems) {
            boolean itemInActiveKit = kitRepository.existsByItemIdAndStatusNotIn(
                item.getId(),
                List.of(KitStatus.FINISHED, KitStatus.CANCELLED, KitStatus.DRAFT)
            );
            
            if (itemInActiveKit) {
                String itemType = item instanceof Article ? "artículo" : "servicio";
                throw new RuntimeException(
                    "No se puede eliminar el " + itemType + " \"" + item.getTitle() + 
                    "\" porque está en un alquiler activo o pagado.\n\n" +
                    "Para eliminar este usuario, primero debe esperar a que finalice el alquiler de este " + itemType + "."
                );
            }
            
            kitItemRepository.deleteByItemId(item.getId());
        }
        
        articleRepository.deleteByOwnerId(userId);
        
        serviceRepository.deleteByOwnerId(userId);
        
        List<Kit> draftKits = kitRepository.findByTenantIdAndStatus(userId, KitStatus.DRAFT);
        for (Kit kit : draftKits) {
            kitRepository.delete(kit);
        }
        
        kitRepository.updateTenantToNullForFinishedKits(userId);
        
        walletRepository.deleteByUserId(userId);
        
        userRepository.delete(user);
    }
}