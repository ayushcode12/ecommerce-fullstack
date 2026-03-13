package com.example.Ecommerce_Backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImageDeleteRequestDTO {

    @NotEmpty(message = "imageUrls cannot be empty")
    private List<String> imageUrls;
}
