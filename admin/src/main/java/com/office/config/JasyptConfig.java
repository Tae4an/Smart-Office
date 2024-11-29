package com.office.config;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;
import jakarta.annotation.PostConstruct;
import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
@EnableEncryptableProperties
public class JasyptConfig {
    @Value("${JASYPT_SECRET_KEY}")
    private String KEY;

    private String ALGORITHM = "PBEWithMD5AndDES";

    @PostConstruct
    public void init() throws IOException {
        if (KEY == null || KEY.isEmpty()) {
            KEY = new String(Files.readAllBytes(Paths.get("/run/secrets/jasypt_key")));
        }
    }
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(KEY);
        config.setAlgorithm(ALGORITHM);
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }
}