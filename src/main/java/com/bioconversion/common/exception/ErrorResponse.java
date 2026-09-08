package com.bioconversion.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Format standardisé des erreurs renvoyées par le {@link GlobalExceptionHandler}.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final int status;
    private final String error;
    private final String message;
    private final Map<String, String> fieldErrors;
    private final OffsetDateTime timestamp;
}
