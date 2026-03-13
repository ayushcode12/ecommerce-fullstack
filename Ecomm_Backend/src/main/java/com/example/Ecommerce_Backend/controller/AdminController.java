package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.AdminDashboardResponseDTO;
import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.dto.OrderStatusUpdateRequestDTO;
import com.example.Ecommerce_Backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderService orderService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponseDTO> getDashboard() {
        return ResponseEntity.ok(orderService.getDashboardForAdmin());
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponseDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin(page, size, sortBy, direction, status, keyword));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetailsForAdmin(orderId));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatusForAdmin(orderId, requestDTO.getStatus()));
    }
}
