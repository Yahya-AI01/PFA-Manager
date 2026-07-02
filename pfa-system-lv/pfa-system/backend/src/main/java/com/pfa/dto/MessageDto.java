package com.pfa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long id;

    @NotBlank
    private String contenu;

    private Long projetId;
    private Long expediteurId;
    private String expediteurNom;
    private String expediteurPrenom;
    private String expediteurRole;
    private Boolean lu;
    private LocalDateTime dateEnvoi;
}
