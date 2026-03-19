package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.ChangePasswordRequestDTO;
import com.example.Ecommerce_Backend.dto.UpdateProfileRequestDTO;
import com.example.Ecommerce_Backend.dto.UserProfileResponseDTO;
import com.example.Ecommerce_Backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateMyProfile(@Valid @RequestBody UpdateProfileRequestDTO requestDTO) {
        return ResponseEntity.ok(userService.updateMyProfile(requestDTO));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<String> changeMyPassword(@Valid @RequestBody ChangePasswordRequestDTO requestDTO) {
        userService.changeMyPassword(requestDTO);
        return ResponseEntity.ok("Password updated successfully");
    }
}
