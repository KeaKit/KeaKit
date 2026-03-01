package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.repository.UserRepository;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;

@SpringBootApplication
public class DemoApplication {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {

		// Solo cargar .env si no estamos en modo test
		String activeProfile = System.getProperty("spring.profiles.active");
		if (activeProfile == null || !activeProfile.contains("test")) {
			Dotenv dotenv = Dotenv.configure()
					.directory("../")
					.ignoreIfMissing()
					.load();

			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
				System.out.println("Variable cargada: " + entry.getKey());
			});
		}

		SpringApplication.run(DemoApplication.class, args);
	}

	@PostConstruct
	public void initAdmin() {
		if (!userRepository.existsByEmail("adminUser@test.com")) {
			User admin = new User(
				"adminUser@test.com",
				passwordEncoder.encode("admin123"),
				"Admin User Test",
				UserRole.ADMIN
			);

			userRepository.save(admin);
			System.out.println("ADMIN creado automáticamente");
		}
	}
}
