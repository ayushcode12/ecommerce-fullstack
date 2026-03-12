package com.example.Ecommerce_Backend.dto;

import com.example.Ecommerce_Backend.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderStatusUpdateRequestDTO {

    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
