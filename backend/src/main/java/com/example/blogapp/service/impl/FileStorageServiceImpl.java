package com.example.blogapp.service.impl;

import com.example.blogapp.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file, String path) throws Exception {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Check if the file's name contains invalid characters
        if (originalFileName.contains("..")) {
            throw new Exception("Filename contains invalid path sequence " + originalFileName);
        }

        // Generate a unique file name to prevent duplicates
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Create the directory if it doesn't exist
        Path targetDir = Paths.get(uploadDir, path).toAbsolutePath().normalize();
        Files.createDirectories(targetDir);

        // Copy the file to the target location
        Path targetLocation = targetDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Create a URL for the file
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(path + "/")
                .path(fileName)
                .toUriString();

        return fileUrl;
    }

    @Override
    public void deleteFile(String filePath) throws Exception {
        try {
            Path path = Paths.get(uploadDir, filePath).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            throw new Exception("Could not delete file: " + filePath, ex);
        }
    }

    @Override
    public String getPresignedUrl(String objectPath, int expiryMinutes) throws Exception {
        // For local file storage, we don't generate presigned URLs
        // Just return the original path
        return objectPath;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}