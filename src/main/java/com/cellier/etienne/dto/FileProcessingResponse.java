package com.cellier.etienne.dto;

public class FileProcessingResponse {
    private String status;
    private String fileName;
    private String path;
    private String wordCount;
    private String error;

    public FileProcessingResponse(String status, String fileName, String path) {
        this.status = status;
        this.fileName = fileName;
        this.path = path;
    }

    public FileProcessingResponse(String status, String error) {
        this.status = status;
        this.error = error;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getWordCount() {
        return wordCount;
    }

    public void setWordCount(String wordCount) {
        this.wordCount = wordCount;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
