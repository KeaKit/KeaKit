package com.example.demo.service;

import com.example.demo.dto.ItemPaymentDetailDTO;
import com.example.demo.dto.TransactionDetailsDTO;
import com.example.demo.dto.TransactionWithDetailsDTO;
import com.example.demo.exception.NotEnoughBalanceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.ItemRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ItemRepository itemRepository;

    public Wallet getWalletByUserId(Long userId) throws ResourceNotFoundException {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartera no encontrada para el usuario: " + userId));
    }

    public List<Transaction> getTransactionsForUser(Long userId) throws ResourceNotFoundException {
        Wallet wallet = getWalletByUserId(userId);
        return transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(wallet.getId());
    }

    public TransactionWithDetailsDTO getTransactionWithDetails(Long transactionId, Long userId) throws ResourceNotFoundException {
        Wallet wallet = getWalletByUserId(userId);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada"));
        
        if (!transaction.getDestinationWallet().getId().equals(wallet.getId())) {
            throw new ResourceNotFoundException("Transacción no encontrada");
        }
        
        TransactionWithDetailsDTO dto = new TransactionWithDetailsDTO(transaction);
        
        if (transaction.getType() == TransactionType.PAYOUT && transaction.getAmount() < 0) {
            if (transaction.getRelatedKit() != null) {
                dto.setDetails(buildTransactionDetails(transaction.getRelatedKit()));
            } else if (transaction.getType() == TransactionType.TOP_UP) {
                TransactionDetailsDTO details = new TransactionDetailsDTO();
                details.setDescription(transaction.getDescription() != null ? 
                    transaction.getDescription() : "Ingreso de dinero a la cartera");
                dto.setDetails(details);
            }
        } else if (transaction.getType() == TransactionType.TOP_UP) {
            TransactionDetailsDTO details = new TransactionDetailsDTO();
            details.setDescription("Ingreso de dinero a la cartera");
            dto.setDetails(details);
        }
        
        return dto;
    }


    private TransactionDetailsDTO buildTransactionDetails(Kit kit) {
        TransactionDetailsDTO details = new TransactionDetailsDTO();
        details.setKitId(kit.getId());
        details.setKitName(kit.getName());
        
        double months = calculateMonthsBetween(kit.getStartDate(), kit.getEndDate());
        
        List<ItemPaymentDetailDTO> items = kit.getSnapshots().stream()
                .map(snapshot -> {
                    Item item = itemRepository.findById(snapshot.getOriginalItemId()).orElse(null);
                    ItemPaymentDetailDTO itemDetail = new ItemPaymentDetailDTO();
                    itemDetail.setItemId(snapshot.getOriginalItemId());
                    itemDetail.setItemType(item instanceof Article ? "ARTICLE" : "SERVICE");
                    itemDetail.setName(snapshot.getNameAtRental());
                    itemDetail.setCategory(snapshot.getCategoryAtRental() != null ? 
                        snapshot.getCategoryAtRental().getName() : null);
                    itemDetail.setImageUrl(snapshot.getImageUrlAtRental());
                    itemDetail.setOwnerName(snapshot.getOwnerAtRental() != null ? 
                        snapshot.getOwnerAtRental().getName() : null);
                    itemDetail.setOwnerId(snapshot.getOwnerAtRental() != null ? 
                        snapshot.getOwnerAtRental().getId() : null);
                    itemDetail.setQuantity(snapshot.getSelectedUnits());
                    itemDetail.setPricePerMonth(snapshot.getPriceAtRental());
                    itemDetail.setTotal(snapshot.getPriceAtRental() * snapshot.getSelectedUnits() * months);
                    return itemDetail;
                })
                .collect(Collectors.toList());
        
        details.setItems(items);
        
        double subtotal = items.stream().mapToDouble(ItemPaymentDetailDTO::getTotal).sum();
        double guarantee = subtotal * 0.2;
        double courierFee = kit.getCourierPrice() != null ? kit.getCourierPrice() : 0;
        double discount = kit.getAppliedDiscount() != null ? subtotal * kit.getAppliedDiscount() : 0;
        double total = subtotal + guarantee + courierFee - discount;
        
        details.setSubtotal(subtotal);
        details.setGuarantee(guarantee);
        details.setPlatformFee(0.0);
        details.setCourierFee(courierFee);
        details.setDiscount(discount);
        details.setTotal(total);
        
        return details;
    }

    private double calculateMonthsBetween(LocalDate start, LocalDate end) {
        long diffDays = ChronoUnit.DAYS.between(start, end) + 1;
        return diffDays / 30.0;
    }

    @Transactional
    public void updateWalletBalance(Long userId, Double amount) throws ResourceNotFoundException {
        Wallet wallet = getWalletByUserId(userId);
        
        if (amount <= 0.0) {
            throw new NotEnoughBalanceException("El monto debe ser positivo");
        }
        
        Double MIN_WITHDRAW_AMOUNT = 1.00;
        if (amount < MIN_WITHDRAW_AMOUNT) {
            throw new NotEnoughBalanceException(
                String.format("La cantidad mínima de dinero para retirar es de %.2f €", MIN_WITHDRAW_AMOUNT)
            );
        }
        
        if (wallet.getBalance() < amount) {
            throw new NotEnoughBalanceException("Saldo insuficiente en la cartera");
        }
        
        Transaction transaction = new Transaction();
        transaction.setAmount(-amount);
        transaction.setDestinationWallet(wallet);
        transaction.setType(TransactionType.PAYOUT);
        transaction.setPayoutSubtype(PayoutSubtype.WITHDRAWAL_TO_BANK);
        transaction.setDescription("Retirada a cuenta bancaria");
        transactionRepository.save(transaction);
    }
}