package com.example.demo.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DotenvPropertySourceFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        Map<String, Object> properties = new HashMap<>();
        
        // Load all env variables into map
        dotenv.entries().forEach(entry -> properties.put(entry.getKey(), entry.getValue()));
        
        return new org.springframework.core.env.MapPropertySource("dotenv", properties);
    }
}
