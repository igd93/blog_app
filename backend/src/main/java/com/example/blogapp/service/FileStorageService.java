package com.example.blogapp.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Stores a file and returns its URL
     * 
     * @param file The file to store
     * @param path The path where to store the file
     * @return The URL to access the file
     * @throws Exception If an error occurs during storage
     */
    String storeFile(MultipartFile file, String path) throws Exception;

    /**
     * Deletes a file
     * 
     * @param filePath The path of the file to delete
     * @throws Exception If an error occurs during deletion
     */
    void deleteFile(String filePath) throws Exception;

    /**
     * Gets a presigned URL for direct access to a file
     * 
     * @param objectPath    The path of the object
     * @param expiryMinutes The expiry time in minutes
     * @return The presigned URL
     * @throws Exception If an error occurs
     */
    String getPresignedUrl(String objectPath, int expiryMinutes) throws Exception;
}