package com.cellier.etienne.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;

@Service
public class HadoopService {
    private static final Logger logger = LoggerFactory.getLogger(HadoopService.class);

    @Value("${hadoop.home:/usr/local/hadoop}")
    private String hadoopHome;

    @Value("${hadoop.input.path:/input}")
    private String hadoopInputPath;

    @Value("${hadoop.output.path:/usr/local/hadoop/output}")
    private String hadoopOutputPath;

    @Value("${hadoop.jar.path:/usr/local/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.2.1.jar}")
    private String hadoopJarPath;

    public CompletableFuture<String> processFileWithHadoop(Path localFilePath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String fileName = localFilePath.getFileName().toString();
                String hadoopInputFile = hadoopInputPath + "/" + fileName;
                String wslPath = "/mnt/" + localFilePath.toString().replace("\\", "/").toLowerCase().replace(":", "");

                String command = String.join(" && ",
                        "export PATH=$PATH:" + hadoopHome + "/bin",
                        hadoopHome + "/bin/hdfs dfs -copyFromLocal " + wslPath + " " + hadoopInputFile,
                        hadoopHome + "/bin/hdfs dfs -rm -r " + hadoopOutputPath,
                        hadoopHome + "/bin/hadoop jar " + hadoopJarPath + " wordcount " + hadoopInputFile + " " + hadoopOutputPath,
                        hadoopHome + "/bin/hdfs dfs -cat " + hadoopOutputPath + "/part-r-00000",
                        hadoopHome + "/bin/hdfs dfs -rm " + hadoopInputFile
                );

                return executeCommand(new String[] {"wsl", "sh", "-c", command});
            } catch (Exception e) {
                logger.error("Error processing file with Hadoop", e);
                throw new RuntimeException("Failed to process file with Hadoop: " + e.getMessage());
            }
        });
    }

    private String executeCommand(String[] command) throws Exception {
        logger.info("Executing command: {}", String.join(" ", command));

        Process process = Runtime.getRuntime().exec(command);
        StringBuilder output = new StringBuilder();
        StringBuilder error = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                logger.debug("Command output: {}", line);
            }
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                error.append(line).append("\n");
                logger.warn("Command error output: {}", line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            logger.error("Command failed with exit code {}", exitCode);
            logger.error("Error output: {}", error);
            throw new Exception("Command failed with exit code " + exitCode + ": " + error);
        }

        return output.toString();
    }
}
