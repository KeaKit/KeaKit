package com.example.demo.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Uploads an image to Cloudinary with automatic optimizations
     * 
     * @param file MultipartFile from the request
     * @return The public URL of the uploaded image
     * @throws IOException if upload fails
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Validate file is not empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file is an image
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size must not exceed 10MB");
        }

        // Upload with transformations
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
            "folder", "keakit/articles",
            "resource_type", "image",
            "transformation", new com.cloudinary.Transformation<>()
                .width(1920)
                .height(1080)
                .crop("limit")
                .quality("auto:good")
                .fetchFormat("auto")
        ));

        return (String) uploadResult.get("secure_url");
    }

    /**
     * Deletes an image from Cloudinary
     * 
     * @param imageUrl The URL of the image to delete
     * @throws IOException if deletion fails
     */
    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        // Extract public_id from URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/keakit/articles/abc123.jpg
        // Public ID: keakit/articles/abc123
        String publicId = extractPublicIdFromUrl(imageUrl);
        
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    private String extractPublicIdFromUrl(String url) {
        try {
            // Split by /upload/ and take the part after it
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }
            
            // Remove version (v1234567890) and file extension
            String pathWithVersion = parts[1];
            String path = pathWithVersion.replaceFirst("v\\d+/", "");
            
            // Remove file extension
            int lastDot = path.lastIndexOf('.');
            if (lastDot > 0) {
                path = path.substring(0, lastDot);
            }
            
            return path;
        } catch (Exception e) {
            return null;
        }
    }
}
