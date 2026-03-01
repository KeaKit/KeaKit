package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {

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

}