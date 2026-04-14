package com.example.demo.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.example.demo.service.CloudinaryService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setup() throws Exception {
        MockitoAnnotations.openMocks(this);
        when(cloudinary.uploader()).thenReturn(uploader);
    }


    @Test
    void uploadImage_emptyFile_throwsException() {
        when(file.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> cloudinaryService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File is empty");
    }

    @Test
    void uploadImage_nullContentType_throwsException() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(null);

        assertThatThrownBy(() -> cloudinaryService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File must be an image");
    }

    @Test
    void uploadImage_invalidContentType_throwsException() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");

        assertThatThrownBy(() -> cloudinaryService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File must be an image");
    }

    @Test
    void uploadImage_fileTooLarge_throwsException() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getSize()).thenReturn(11L * 1024 * 1024); // 11MB

        assertThatThrownBy(() -> cloudinaryService.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File size must not exceed 10MB");
    }

    @Test
    void uploadImage_success_returnsSecureUrl() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getSize()).thenReturn(1024L);
        when(file.getBytes()).thenReturn("data".getBytes());

        when(uploader.upload(any(), any()))
                .thenReturn(Map.of("secure_url", "https://cloudinary.com/image.jpg"));

        String url = cloudinaryService.uploadImage(file);

        assertThat(url).isEqualTo("https://cloudinary.com/image.jpg");
    }

    @Test
    void uploadImage_cloudinaryThrowsIOException_propagates() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getSize()).thenReturn(1024L);
        when(file.getBytes()).thenReturn("data".getBytes());

        when(uploader.upload(any(), any())).thenThrow(new IOException("Cloudinary error"));

        assertThatThrownBy(() -> cloudinaryService.uploadImage(file))
                .isInstanceOf(IOException.class)
                .hasMessage("Cloudinary error");
    }


    @Test
    void deleteImage_nullUrl_doesNothing() throws Exception {
        cloudinaryService.deleteImage(null);
        verify(uploader, never()).destroy(anyString(), any());
    }

    @Test
    void deleteImage_emptyUrl_doesNothing() throws Exception {
        cloudinaryService.deleteImage("");
        verify(uploader, never()).destroy(anyString(), any());
    }

    @Test
    void deleteImage_urlWithoutUpload_doesNothing() throws Exception {
        cloudinaryService.deleteImage("https://cloudinary.com/no-upload-here");
        verify(uploader, never()).destroy(anyString(), any());
    }

    @Test
    void deleteImage_validUrl_callsDestroy() throws Exception {
        String url = "https://res.cloudinary.com/demo/image/upload/v1234567890/keakit/articles/abc123.jpg";

        cloudinaryService.deleteImage(url);

        verify(uploader).destroy(eq("keakit/articles/abc123"), any());
    }

    @Test
    void deleteImage_validUrlWithoutVersion_callsDestroy() throws Exception {
        String url = "https://res.cloudinary.com/demo/image/upload/keakit/articles/abc123.jpg";

        cloudinaryService.deleteImage(url);

        verify(uploader).destroy(eq("keakit/articles/abc123"), any());
    }

    @Test
    void deleteImage_validUrlWithPng_callsDestroy() throws Exception {
        String url = "https://res.cloudinary.com/demo/image/upload/v9999/keakit/articles/photo_77.png";

        cloudinaryService.deleteImage(url);

        verify(uploader).destroy(eq("keakit/articles/photo_77"), any());
    }

    @Test
    void deleteImage_malformedUrl_doesNothing() throws Exception {
        cloudinaryService.deleteImage("not-a-valid-url");
        verify(uploader, never()).destroy(anyString(), any());
    }
}

