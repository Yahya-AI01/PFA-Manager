package com.pfa.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentDto {
    private Long id;
    private String nomOriginal;
    private String typeMime;
    private Long tailleOctets;
    private Long projetId;
    private String uploadeParNom;
    private Long uploadeParId;
    private LocalDateTime dateUpload;
    private String downloadUrl;
}
