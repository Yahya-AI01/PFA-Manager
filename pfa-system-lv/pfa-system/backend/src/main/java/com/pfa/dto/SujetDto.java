package com.pfa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SujetDto {
    private Long id;

    @NotBlank
    private String titre;

    private String description;

    @NotNull
    private Integer annee;

    private Boolean disponible;

    private Long moduleId;
    private String moduleNom;

    private Long professeurId;
    private String professeurNom;
}
