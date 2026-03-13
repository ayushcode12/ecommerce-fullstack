package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.RazorpayOrderResponseDTO;
import com.example.Ecommerce_Backend.dto.RazorpayVerifyPaymentRequestDTO;
import com.example.Ecommerce_Backend.service.RazorpayPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments/razorpay")
public class RazorpayPaymentController {

    private final RazorpayPaymentService razorpayPaymentService;

    @PostMapping("/order")
    @PreAuthorize("hasRole('USER')")
    public RazorpayOrderResponseDTO createCheckoutOrder() {
        return razorpayPaymentService.createCheckoutOrder();
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> verifyPayment(@Valid @RequestBody RazorpayVerifyPaymentRequestDTO requestDTO) {
        razorpayPaymentService.verifyPaymentAndPlaceOrder(requestDTO);
        return ResponseEntity.ok("Payment verified and order placed successfully");
    }
}

