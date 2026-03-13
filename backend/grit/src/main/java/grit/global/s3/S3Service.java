package grit.global.s3;

import io.awspring.cloud.s3.ObjectMetadata;
import io.awspring.cloud.s3.S3Template;
import java.net.URL;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class S3Service {

    @Value("${app.s3.bucket-name}")
    private String bucketName;

    @Value("${app.s3.base-url}")
    private String baseUrl;

    private final S3Template s3Template;

    public String resolveUrl(String directory, Object objectName) {
        if (objectName == null) {
            return null;
        }
        return baseUrl + "/" + directory + "/" + objectName;
    }

    public URL createSignedPutUrl(String dir, String filename, Duration duration) {
        ObjectMetadata metadata = ObjectMetadata.builder()
                .build();

        return s3Template.createSignedPutURL(bucketName, dir + "/" + filename,
                duration, metadata, null);
    }

    public boolean isObjectExists(String dir, String filename) {
        return s3Template.objectExists(bucketName, dir + "/" + filename);
    }
}
