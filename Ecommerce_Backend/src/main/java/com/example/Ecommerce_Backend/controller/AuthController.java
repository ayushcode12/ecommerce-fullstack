package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.AuthResponseDTO;
import com.example.Ecommerce_Backend.dto.LoginRequestDTO;
import com.example.Ecommerce_Backend.dto.RefreshTokenRequestDTO;
import com.example.Ecommerce_Backend.dto.RegisterRequestDTO;
import com.example.Ecommerce_Backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        AuthResponseDTO authResponseDTO = authService.register(registerRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponseDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        AuthResponseDTO authResponseDTO = authService.login(loginRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(authResponseDTO);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO) {
        AuthResponseDTO authResponseDTO = authService.refresh(refreshTokenRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(authResponseDTO);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok("Logged out successfully");
    }

}
