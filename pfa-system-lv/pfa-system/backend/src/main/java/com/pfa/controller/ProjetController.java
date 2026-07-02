package com.pfa.controller;

import com.pfa.dto.ProjetDto;
import com.pfa.security.CustomUserDetails;
import com.pfa.service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
public class ProjetController {

    private final ProjetService projetService;

    @GetMapping
    public ResponseEntity<List<ProjetDto>> getAll() {
        return ResponseEntity.ok(projetService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projetService.getById(id));
    }

    @GetMapping("/mes-projets")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<ProjetDto>> mesProjets(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(projetService.getByEtudiant(user.getUsername()));
    }

    @GetMapping("/encadres")
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<List<ProjetDto>> projetsEncadres(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(projetService.getByProfesseur(user.getUsername()));
    }

    @PostMapping("/choisir-sujet/{sujetId}")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<ProjetDto> choisirSujet(@PathVariable Long sujetId,
                                                   @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(projetService.choisirSujet(sujetId, user.getUsername()));
    }
}
