package com.pfa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantImporteResultDto {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasseGenere;
    private String statut; // CREE, DOUBLON, ERREUR
    private String message;
}
