package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.CategoryRequestDTO;
import com.example.Ecommerce_Backend.dto.CategoryResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.model.CategoryEntity;
import com.example.Ecommerce_Backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> CategoryResponseDTO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .build())
                .toList();
    }

    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        String normalizedName = requestDTO.getName().trim();
        if (categoryRepository.findByName(normalizedName).isPresent()) {
            throw new BadRequestException("Category already exists");
        }

        CategoryEntity category = CategoryEntity.builder()
                .name(normalizedName)
                .build();

        CategoryEntity saved = categoryRepository.save(category);
        return CategoryResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build();
    }
}
