package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.CartResponseDTO;
import com.example.Ecommerce_Backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> addToCart(@RequestParam Long productId, @RequestParam Integer quantity){
        cartService.addToCart(productId, quantity);
        return ResponseEntity.ok("Product added to cart");
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public CartResponseDTO getCart(){
        return cartService.getCart();
    }

    @PutMapping("/update")
    public void updateQuantity(@RequestParam Long productId, @RequestParam Integer quantity){
        cartService.updateQuantity(productId, quantity);
    }

}
