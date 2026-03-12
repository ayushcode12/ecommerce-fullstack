package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.AddressRequestDTO;
import com.example.Ecommerce_Backend.dto.AddressResponseDTO;
import com.example.Ecommerce_Backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/addresses")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AddressResponseDTO>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AddressResponseDTO> addAddress(@Valid @RequestBody AddressRequestDTO addressRequestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.addAddress(addressRequestDTO));
    }

    @GetMapping("/{addressId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AddressResponseDTO> getAddressById(@PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.getAddressById(addressId));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequestDTO addressRequestDTO
    ) {
        return ResponseEntity.ok(addressService.updateAddress(addressId, addressRequestDTO));
    }

    @PutMapping("/{addressId}/select")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AddressResponseDTO> selectAddress(@PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.selectAddress(addressId));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok("Address deleted successfully");
    }
}
