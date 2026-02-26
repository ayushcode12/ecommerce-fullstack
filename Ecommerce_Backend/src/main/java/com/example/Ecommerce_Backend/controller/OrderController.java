package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public List<OrderResponseDTO> getMyOrders() {
        return orderService.getMyOrders();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER')")
    public OrderResponseDTO getOrderDetails(@PathVariable Long orderId) {
        return orderService.getOrderDetails(orderId);
    }

}
