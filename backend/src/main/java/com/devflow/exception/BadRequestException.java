package com.devflow.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends DevFlowException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }
}
