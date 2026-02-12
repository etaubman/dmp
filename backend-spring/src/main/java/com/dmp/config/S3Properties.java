package com.dmp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.s3")
public class S3Properties {

    private String endpointUrl = "http://localhost:9000";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String bucketUploads = "bulk-uploads";
    private String bucketExports = "exports";
    private boolean useLocal = false;

    public String getEndpointUrl() { return endpointUrl; }
    public void setEndpointUrl(String endpointUrl) { this.endpointUrl = endpointUrl; }
    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getBucketUploads() { return bucketUploads; }
    public void setBucketUploads(String bucketUploads) { this.bucketUploads = bucketUploads; }
    public String getBucketExports() { return bucketExports; }
    public void setBucketExports(String bucketExports) { this.bucketExports = bucketExports; }
    public boolean isUseLocal() { return useLocal; }
    public void setUseLocal(boolean useLocal) { this.useLocal = useLocal; }
}
