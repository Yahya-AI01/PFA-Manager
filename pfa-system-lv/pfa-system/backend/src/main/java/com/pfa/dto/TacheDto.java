package com.pfa.dto;

import com.pfa.entity.StatutTache;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TacheDto {
    private Long id;

    @NotBlank
    private String titre;

    private String description;
    private StatutTache statut;
    private Long projetId;
}
