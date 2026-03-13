package com.example.Ecommerce_Backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (!isBlank(cloudinaryUrl)) {
            return new Cloudinary(cloudinaryUrl.trim());
        }

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", safeTrim(cloudName));
        config.put("api_key", safeTrim(apiKey));
        config.put("api_secret", safeTrim(apiSecret));
        config.put("secure", "true");
        return new Cloudinary(config);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
