package com.cellier.etienne.controller;

import com.cellier.etienne.dto.FileProcessingResponse;
import com.cellier.etienne.dto.FileUploadRequest;
import com.cellier.etienne.services.HadoopService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    private final HadoopService hadoopService;

    @Autowired
    public FileController(HadoopService hadoopService) {
        this.hadoopService = hadoopService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestBody FileUploadRequest request) {
        logger.info("Received upload request for file: {}", request.getFileName());

        try {
            if (request.getContent() == null || request.getFileName() == null) {
                throw new IllegalArgumentException("Invalid request: content or fileName is null");
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

            CompletableFuture<String> hadoopFuture = hadoopService.processFileWithHadoop(filePath);

            Map<String, String> response = new HashMap<>();
            response.put("status", "processing");
            response.put("message", "File uploaded and processing started");
            response.put("fileName", fileName);
            response.put("path", filePath.toString());

            hadoopFuture.thenAccept(result -> logger.info("Hadoop processing completed for file: {}", fileName)).exceptionally(throwable -> {
                logger.error("Error in Hadoop processing", throwable);
                return null;
            });

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("Error writing file", e);
            return ResponseEntity.internalServerError().body(
                    new FileProcessingResponse("error", "Failed to save file: " + e.getMessage())
            );
        } catch (Exception e) {
            logger.error("Error processing upload", e);
            return ResponseEntity.badRequest().body(
                    new FileProcessingResponse("error", e.getMessage())
            );
        }
    }

    @GetMapping("/wordcount/{fileName}")
    public ResponseEntity<?> getWordCountResult(@PathVariable String fileName) {
        try {
            return ResponseEntity.ok(Map.of(
                    "status", "processing",
                    "fileName", fileName
            ));
        } catch (Exception e) {
            logger.error("Error retrieving word count result", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to retrieve results: " + e.getMessage()
            ));
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
