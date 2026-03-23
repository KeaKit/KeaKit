package com.example.demo.config;

import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.model.Wallet;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    // Mapeamos la ruta del YAML
    @Value("${app.setup.admin.email}")
    private String adminEmail;

    @Value("${app.setup.admin.password}")
    private String adminRawPassword;

    @Value("${app.setup.admin.name}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.walletRepository = walletRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            
            // Creamos el objeto usando los valores inyectados
            User admin = new User(
                adminEmail,
                passwordEncoder.encode(adminRawPassword), // Hasheamos aquí
                adminName,
                UserRole.ADMIN,
                "123456789", 
                "Admin address",
                "Admin city",
                "Admin country"  
            );

            userRepository.save(admin);
            
            // Creamos una wallet para el admin
            Wallet adminWallet = new Wallet(admin);
            walletRepository.save(adminWallet);

            System.out.println(">> Seeder: Admin '" + adminName + "' creado con éxito.");
        }
    }
}
