package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout/cod")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> checkoutCashOnDelivery() {
        orderService.checkout();
        return ResponseEntity.ok("COD order placed successfully");
    }

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

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponseDTO> cancelMyOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelMyOrder(orderId));
    }

    @PostMapping("/{orderId}/reorder")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> reorderPastOrder(@PathVariable Long orderId) {
        OrderService.ReorderResult result = orderService.reorderPastOrder(orderId);
        return ResponseEntity.ok(
                "Reorder completed. Added " + result.addedItems() + " item(s), skipped " + result.skippedItems() + " item(s)."
        );
    }

}
