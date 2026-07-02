package com.pfa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EtudiantStatusDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private boolean aChoisiSujet;
    private String sujetTitre;
    private Long projetId;
}
