package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.model.Wallet;
import com.example.demo.model.User;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    // TODO: Crear una waller de administrador fija para observar el dinero que administra la empresa
    private static final Long KEAKIT_WALLET_ID = 1L;

    @Autowired
    private WalletService walletService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(Long amount) throws StripeException {
        PaymentIntent intent = PaymentIntent.create(
                PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency("eur")
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                        .build()
                        )
                        .build()
        );
        return intent;
    }

    public Transaction transferFee(User owner, Integer amountInCents){
        Transaction getFeeTransaction = new Transaction();
        getFeeTransaction.setAmount(-amountInCents / 100.0); // Convertir a euros, restar cantidad
        Wallet ownerWallet = walletService.getWalletByUserId(owner.getId());
        getFeeTransaction.setDestinationWallet(ownerWallet);
        getFeeTransaction.setType(TransactionType.FEE);
        Transaction feeTransaction = new Transaction();
        feeTransaction.setAmount(amountInCents / 100.0); // Convertir a euros
        Wallet destinationWallet = walletService.getWalletByUserId(KEAKIT_WALLET_ID);
        feeTransaction.setDestinationWallet(destinationWallet);
        feeTransaction.setType(TransactionType.FEE);
        return feeTransaction;
    }

    private Transaction createTransaction(Double amount, Wallet destinationWallet, TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDestinationWallet(destinationWallet);
        transaction.setType(type);
        return transaction;
    }

    private Double toEuros(Integer amountInCents){
        return amountInCents / 100.0;
    }
    
}
