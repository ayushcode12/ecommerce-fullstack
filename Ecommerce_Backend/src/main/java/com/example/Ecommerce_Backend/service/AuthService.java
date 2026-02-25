package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.AuthResponseDTO;
import com.example.Ecommerce_Backend.dto.LoginRequestDTO;
import com.example.Ecommerce_Backend.dto.RegisterRequestDTO;
import com.example.Ecommerce_Backend.exception.EmailAlreadyExistsException;
import com.example.Ecommerce_Backend.exception.InvalidCredentialsException;
import com.example.Ecommerce_Backend.model.Role;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.UserRepository;
import com.example.Ecommerce_Backend.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDTO register(RegisterRequestDTO request) {

        Boolean isExist = userRepository.existsByEmail(request.getEmail());

        if (isExist) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setName(request.getName());
        userEntity.setEmail(request.getEmail());
        userEntity.setPassword(passwordEncoder.encode(request.getPassword()));
        userEntity.setRole(Role.USER);

        userRepository.save(userEntity);
        String token = jwtService.generateToken(userEntity);

        return AuthResponseDTO.builder()
                .token(token)
                .role(Role.USER)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Invalid Credentials");
        }
        String token = jwtService.generateToken(user);
        return AuthResponseDTO.builder()
                .token(token)
                .role(user.getRole())
                .build();
    }

}
