package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.ProductReviewRequestDTO;
import com.example.Ecommerce_Backend.dto.ProductReviewResponseDTO;
import com.example.Ecommerce_Backend.dto.ProductReviewsResponseDTO;
import com.example.Ecommerce_Backend.service.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products/{productId}/reviews")
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    @GetMapping
    public ResponseEntity<ProductReviewsResponseDTO> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(productReviewService.getReviewsForProduct(productId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ProductReviewResponseDTO> upsertReview(
            @PathVariable Long productId,
            @Valid @RequestBody ProductReviewRequestDTO requestDTO
    ) {
        ProductReviewResponseDTO response = productReviewService.upsertReview(productId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> deleteMyReview(@PathVariable Long productId) {
        productReviewService.deleteMyReview(productId);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
