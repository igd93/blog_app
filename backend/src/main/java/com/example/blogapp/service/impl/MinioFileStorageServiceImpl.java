package com.example.blogapp.service.impl;

import com.example.blogapp.service.FileStorageService;
import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Primary
public class MinioFileStorageServiceImpl implements FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    public MinioFileStorageServiceImpl(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

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

        // Create the full object path
        String objectName = path + "/" + fileName;

        try {
            // Upload the file to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            // Generate a presigned URL for the object (optional, for direct access)
            // String url = minioClient.getPresignedObjectUrl(
            // GetPresignedObjectUrlArgs.builder()
            // .bucket(bucket)
            // .object(objectName)
            // .method(Method.GET)
            // .expiry(7, TimeUnit.DAYS)
            // .build()
            // );

            // Return the object path that can be used with our API
            return "/api/files/" + objectName;

        } catch (Exception e) {
            throw new Exception("Could not store file " + fileName, e);
        }
    }

    @Override
    public void deleteFile(String filePath) throws Exception {
        try {
            // Extract the object name from the file path
            String objectName = filePath.replace("/api/files/", "");

            // Remove the object from MinIO
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new Exception("Could not delete file: " + filePath, e);
        }
    }

    @Override
    public String getPresignedUrl(String objectPath, int expiryMinutes) throws Exception {
        try {
            // Remove the API prefix if present
            if (objectPath.startsWith("/api/files/")) {
                objectPath = objectPath.substring("/api/files/".length());
            }

            // Generate a presigned URL for the object
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucket)
                            .object(objectPath)
                            .method(Method.GET)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build());
        } catch (Exception e) {
            throw new Exception("Could not generate presigned URL for " + objectPath, e);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}