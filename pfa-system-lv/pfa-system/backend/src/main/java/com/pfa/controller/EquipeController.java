package com.pfa.controller;

import com.pfa.dto.EtudiantStatusDto;
import com.pfa.dto.ProjetDto;
import com.pfa.security.CustomUserDetails;
import com.pfa.service.EquipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
@RequiredArgsConstructor
public class EquipeController {

    private final EquipeService equipeService;

    @PostMapping("/{projetId}/etudiants/{etudiantId}")
    @PreAuthorize("hasAnyRole('PROFESSEUR','ADMIN')")
    public ResponseEntity<ProjetDto> ajouter(
            @PathVariable Long projetId,
            @PathVariable Long etudiantId) {
        return ResponseEntity.ok(equipeService.ajouterEtudiant(projetId, etudiantId));
    }

    @DeleteMapping("/{projetId}/etudiants/{etudiantId}")
    @PreAuthorize("hasAnyRole('PROFESSEUR','ADMIN')")
    public ResponseEntity<ProjetDto> retirer(
            @PathVariable Long projetId,
            @PathVariable Long etudiantId) {
        return ResponseEntity.ok(equipeService.retirerEtudiant(projetId, etudiantId));
    }

    @GetMapping("/etudiants-status")
    public ResponseEntity<List<EtudiantStatusDto>> statutEtudiants() {
        return ResponseEntity.ok(equipeService.statutEtudiants());
    }

    @GetMapping("/incompletes")
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<List<ProjetDto>> incompletes(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(equipeService.equipesIncompletes(user.getUsername()));
    }
}
