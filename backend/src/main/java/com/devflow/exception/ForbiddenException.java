package com.devflow.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends DevFlowException {
    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }
}
