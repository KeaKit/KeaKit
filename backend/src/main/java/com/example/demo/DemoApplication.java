package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		
		Dotenv dotenv = Dotenv.configure()
                .directory("../")
                .ignoreIfMissing()             
                .load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
			System.out.println("Variable cargada: " + entry.getKey());
        });
		

		SpringApplication.run(DemoApplication.class, args);
	}

}
