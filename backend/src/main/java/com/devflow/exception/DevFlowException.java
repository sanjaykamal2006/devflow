package com.devflow.exception;

import org.springframework.http.HttpStatus;

public class DevFlowException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public DevFlowException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public DevFlowException(String message, Throwable cause, HttpStatus status, String errorCode) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
