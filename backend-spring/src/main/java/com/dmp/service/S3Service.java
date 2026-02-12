package com.dmp.service;

import com.dmp.config.S3Properties;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * S3-compatible storage for bulk uploads. When {@link S3Properties#isUseLocal()} is true, no client is
 * created and uploads are no-ops (returns null). Otherwise uses configured endpoint and path-style access.
 */
@Service
public class S3Service {

    private final S3Properties props;
    private S3Client client;

    public S3Service(S3Properties props) {
        this.props = props;
    }

    @PostConstruct
    public void init() {
        if (!props.isUseLocal()) {
            client = S3Client.builder()
                    .endpointOverride(java.net.URI.create(props.getEndpointUrl()))
                    .region(Region.US_EAST_1)
                    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey())))
                    .forcePathStyle(true)
                    .build();
        }
    }

    public String upload(String entityType, String filename, byte[] content, String contentType) {
        if (props.isUseLocal() || client == null) {
            return null;
        }
        String key = generateUploadKey(entityType, filename);
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(props.getBucketUploads())
                .key(key)
                .contentType(contentType != null ? contentType : "text/csv")
                .build();
        client.putObject(req, RequestBody.fromInputStream(new ByteArrayInputStream(content), content.length));
        return key;
    }

    private String generateUploadKey(String entityType, String filename) {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String safeName = filename != null ? filename.replace(" ", "_") : "upload.csv";
        return entityType + "/" + datePrefix + "/" + safeName;
    }
}
