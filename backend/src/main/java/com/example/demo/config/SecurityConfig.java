package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**").permitAll()
                .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                .requestMatchers("/api/users/*/public-profile").permitAll()
                .requestMatchers("/api/cities/**").permitAll()
                .requestMatchers("/api/countries/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                //Para asegurar que las url que comiencen por api/admin/ solo serán accesibles por usuarios con rol ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/kits/*/tracking").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/kits/*/tracking").hasAnyRole("COURIER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/kits/*/assign-courier/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/kits/courier/assigned").hasAnyRole("COURIER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/kits/busy-couriers").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/kits/unassigned").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/services/active", "/api/services/{id}").permitAll()
                .requestMatchers("/api/article/**").authenticated()
                .requestMatchers("/api/services/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/ratings/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/promo-codes/validate").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/category", "/api/category/**").permitAll()
                .requestMatchers("/api/rgpd/current-policy").permitAll()
                .requestMatchers("/error").permitAll()
		        .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList("https://keakit.net","https://keakitppl.web.app", "http://localhost:8081")); 
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(false);

	UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    	source.registerCorsConfiguration("/**", configuration);
    	return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
