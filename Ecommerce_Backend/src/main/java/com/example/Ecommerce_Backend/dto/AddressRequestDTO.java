package com.example.Ecommerce_Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name can be at most 120 characters")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 200, message = "Address line 1 can be at most 200 characters")
    private String line1;

    @Size(max = 200, message = "Address line 2 can be at most 200 characters")
    private String line2;

    @NotBlank(message = "City is required")
    @Size(max = 80, message = "City can be at most 80 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 80, message = "State can be at most 80 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Postal code must be 6 digits")
    private String postalCode;

    @Size(max = 120, message = "Landmark can be at most 120 characters")
    private String landmark;

    @Size(max = 40, message = "Label can be at most 40 characters")
    private String label;
}
