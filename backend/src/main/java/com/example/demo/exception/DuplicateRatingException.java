package com.example.demo.exception;

public class DuplicateRatingException extends RuntimeException {
    public DuplicateRatingException(String message) {
        super(message);
    }
}
