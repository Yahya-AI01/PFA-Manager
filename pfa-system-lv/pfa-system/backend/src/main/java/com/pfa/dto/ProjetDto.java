package com.pfa.dto;

import com.pfa.entity.StatutProjet;
import lombok.Data;

import java.util.List;

@Data
public class ProjetDto {
    private Long id;
    private Long sujetId;
    private String sujetTitre;
    private String professeurNom;
    private List<EtudiantInfo> etudiants;
    private StatutProjet statut;
    private String rapportUrl;

    @Data
    public static class EtudiantInfo {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
    }
}
