package com.example.Ecommerce_Backend.service;

import com.cloudinary.Cloudinary;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CloudinaryImageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Value("${cloudinary.folder:urban-threads/products}")
    private String folder;

    public List<String> uploadImages(List<MultipartFile> files) {
        validateCloudinaryConfiguration();

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Please choose at least one image file");
        }

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            uploadedUrls.add(uploadSingleImage(file));
        }
        return uploadedUrls;
    }

    public List<String> deleteImagesByUrls(List<String> imageUrls) {
        validateCloudinaryConfiguration();

        if (imageUrls == null || imageUrls.isEmpty()) {
            throw new BadRequestException("Please provide at least one image URL to delete");
        }

        List<String> deletedUrls = new ArrayList<>();
        for (String imageUrl : imageUrls) {
            if (isBlank(imageUrl)) {
                continue;
            }

            String normalized = imageUrl.trim();
            if (!isCloudinaryUrl(normalized)) {
                continue;
            }

            String publicId = extractPublicIdFromUrl(normalized);
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "image");
            options.put("invalidate", true);

            try {
                Map<?, ?> result = cloudinary.uploader().destroy(publicId, options);
                String deleteResult = Objects.toString(result.get("result"), "");
                if ("ok".equalsIgnoreCase(deleteResult) || "not found".equalsIgnoreCase(deleteResult)) {
                    deletedUrls.add(normalized);
                }
            } catch (IOException ex) {
                throw new BadRequestException("Failed to delete image: " + ex.getMessage());
            }
        }

        return deletedUrls;
    }

    private String uploadSingleImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        Map<String, Object> options = new HashMap<>();
        options.put("folder", folder);
        options.put("resource_type", "image");
        options.put("use_filename", true);
        options.put("unique_filename", true);
        options.put("overwrite", false);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new BadRequestException("Failed to upload image to Cloudinary");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new BadRequestException("Failed to upload image: " + ex.getMessage());
        }
    }

    private void validateCloudinaryConfiguration() {
        boolean hasUrl = !isBlank(cloudinaryUrl);
        boolean hasDiscreteCredentials = !isBlank(cloudName) && !isBlank(apiKey) && !isBlank(apiSecret);

        if (!hasUrl && !hasDiscreteCredentials) {
            throw new BadRequestException("Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isCloudinaryUrl(String imageUrl) {
        return imageUrl.contains("res.cloudinary.com/");
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            URI uri = URI.create(imageUrl);
            String path = uri.getPath();
            int uploadIndex = path.indexOf("/upload/");
            if (uploadIndex < 0) {
                throw new BadRequestException("Invalid Cloudinary URL format");
            }

            String afterUpload = path.substring(uploadIndex + "/upload/".length());
            String[] segments = afterUpload.split("/");
            List<String> filtered = new ArrayList<>();
            for (String segment : segments) {
                if (!isBlank(segment)) {
                    filtered.add(segment);
                }
            }

            if (!filtered.isEmpty() && filtered.get(0).matches("v\\d+")) {
                filtered.remove(0);
            } else {
                while (!filtered.isEmpty() && filtered.get(0).contains(",")) {
                    filtered.remove(0);
                }
                if (!filtered.isEmpty() && filtered.get(0).matches("v\\d+")) {
                    filtered.remove(0);
                }
            }

            if (filtered.isEmpty()) {
                throw new BadRequestException("Could not resolve Cloudinary public ID");
            }

            int lastIndex = filtered.size() - 1;
            filtered.set(lastIndex, filtered.get(lastIndex).replaceFirst("\\.[^.]+$", ""));
            return String.join("/", filtered);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid image URL");
        }
    }
}
