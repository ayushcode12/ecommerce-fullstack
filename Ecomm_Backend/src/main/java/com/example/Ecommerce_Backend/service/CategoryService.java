package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.CategoryRequestDTO;
import com.example.Ecommerce_Backend.dto.CategoryResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.CategoryEntity;
import com.example.Ecommerce_Backend.repository.CategoryRepository;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> CategoryResponseDTO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .productCount(productRepository.countByCategoryId(category.getId()))
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
                .productCount(0L)
                .build();
    }

    public CategoryResponseDTO updateCategory(Long categoryId, CategoryRequestDTO requestDTO) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String normalizedName = requestDTO.getName().trim();
        categoryRepository.findByName(normalizedName)
                .filter(existing -> !existing.getId().equals(categoryId))
                .ifPresent(existing -> {
                    throw new BadRequestException("Category already exists");
                });

        category.setName(normalizedName);
        CategoryEntity saved = categoryRepository.save(category);
        return CategoryResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .productCount(productRepository.countByCategoryId(saved.getId()))
                .build();
    }

    public void deleteCategory(Long categoryId) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        long linkedProducts = productRepository.countByCategoryId(categoryId);
        if (linkedProducts > 0) {
            throw new BadRequestException("Cannot delete category with existing products");
        }

        categoryRepository.delete(category);
    }
}
