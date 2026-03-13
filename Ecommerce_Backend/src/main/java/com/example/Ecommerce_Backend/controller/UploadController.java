package com.example.Ecommerce_Backend.controller;

import com.example.Ecommerce_Backend.dto.ImageDeleteRequestDTO;
import com.example.Ecommerce_Backend.dto.ImageDeleteResponseDTO;
import com.example.Ecommerce_Backend.dto.ImageUploadResponseDTO;
import com.example.Ecommerce_Backend.service.CloudinaryImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/uploads")
public class UploadController {

    private final CloudinaryImageService cloudinaryImageService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImageUploadResponseDTO> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        List<String> imageUrls = cloudinaryImageService.uploadImages(files);
        return ResponseEntity.ok(ImageUploadResponseDTO.builder().imageUrls(imageUrls).build());
    }

    @DeleteMapping("/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImageDeleteResponseDTO> deleteImages(@Valid @RequestBody ImageDeleteRequestDTO requestDTO) {
        List<String> deletedUrls = cloudinaryImageService.deleteImagesByUrls(requestDTO.getImageUrls());
        return ResponseEntity.ok(
                ImageDeleteResponseDTO.builder()
                        .deletedCount(deletedUrls.size())
                        .deletedUrls(deletedUrls)
                        .build()
        );
    }
}
