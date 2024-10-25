package com.cellier.etienne.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    public static class FileUploadRequest {
        private String content;
        private String fileName; // Ajout du nom du fichier

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestBody FileUploadRequest request) {
        logger.info("Received upload request");

        try {
            if (request == null || request.getContent() == null) {
                throw new IllegalArgumentException("Invalid request: content is null");
            }

            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory: {}", uploadPath);
            }

            String fileName = generateFileName(request.getFileName());
            Path filePath = uploadPath.resolve(fileName);

            Files.writeString(filePath, request.getContent());
            logger.info("File saved successfully: {}", filePath);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("fileName", fileName);
            response.put("path", filePath.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("Error writing file", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to save file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        } catch (Exception e) {
            logger.error("Error processing upload", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String generateFileName(String originalFileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String baseName = originalFileName != null && !originalFileName.isEmpty()
                ? originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_")
                : "uploaded_file";

        if (!baseName.toLowerCase().endsWith(".txt")) {
            baseName += ".txt";
        }

        return timestamp + "_" + baseName;
    }
}
