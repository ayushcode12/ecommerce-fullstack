package com.example.Ecommerce_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImageDeleteResponseDTO {
    private Integer deletedCount;
    private List<String> deletedUrls;
}
