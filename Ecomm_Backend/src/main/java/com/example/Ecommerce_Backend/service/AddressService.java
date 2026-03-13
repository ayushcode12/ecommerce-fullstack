package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.AddressRequestDTO;
import com.example.Ecommerce_Backend.dto.AddressResponseDTO;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.AddressEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.AddressRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponseDTO> getMyAddresses() {
        UserEntity user = getCurrentUser();
        return addressRepository.findByUserOrderBySelectedDescCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AddressResponseDTO addAddress(AddressRequestDTO request) {
        UserEntity user = getCurrentUser();

        List<AddressEntity> existingAddresses = addressRepository.findByUser(user);
        if (!existingAddresses.isEmpty()) {
            existingAddresses.forEach(address -> address.setSelected(false));
            addressRepository.saveAll(existingAddresses);
        }

        AddressEntity address = AddressEntity.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .landmark(request.getLandmark())
                .label(request.getLabel() == null || request.getLabel().isBlank() ? "Home" : request.getLabel())
                .selected(true)
                .build();

        AddressEntity saved = addressRepository.save(address);
        return toResponse(saved);
    }

    public AddressResponseDTO getAddressById(Long addressId) {
        UserEntity user = getCurrentUser();
        AddressEntity address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        return toResponse(address);
    }

    public AddressResponseDTO updateAddress(Long addressId, AddressRequestDTO request) {
        UserEntity user = getCurrentUser();
        AddressEntity address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLandmark(request.getLandmark());
        address.setLabel(request.getLabel() == null || request.getLabel().isBlank() ? "Home" : request.getLabel());

        AddressEntity saved = addressRepository.save(address);
        return toResponse(saved);
    }

    public AddressResponseDTO selectAddress(Long addressId) {
        UserEntity user = getCurrentUser();
        AddressEntity targetAddress = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        List<AddressEntity> addresses = addressRepository.findByUser(user);
        addresses.forEach(address -> address.setSelected(address.getId().equals(targetAddress.getId())));
        addressRepository.saveAll(addresses);

        return toResponse(targetAddress);
    }

    public void deleteAddress(Long addressId) {
        UserEntity user = getCurrentUser();
        AddressEntity targetAddress = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        boolean wasSelected = Boolean.TRUE.equals(targetAddress.getSelected());
        addressRepository.delete(targetAddress);

        if (wasSelected) {
            List<AddressEntity> remainingAddresses = addressRepository.findByUserOrderBySelectedDescCreatedAtDesc(user);
            if (!remainingAddresses.isEmpty()) {
                AddressEntity newSelected = remainingAddresses.get(0);
                newSelected.setSelected(true);
                addressRepository.save(newSelected);
            }
        }
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AddressResponseDTO toResponse(AddressEntity address) {
        return AddressResponseDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .landmark(address.getLandmark())
                .label(address.getLabel())
                .selected(address.getSelected())
                .build();
    }
}
