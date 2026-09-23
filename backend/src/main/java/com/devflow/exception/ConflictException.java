package com.devflow.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends DevFlowException {
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, "RESOURCE_CONFLICT");
    }
}
