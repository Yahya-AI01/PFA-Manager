package com.pfa.controller;

import com.pfa.dto.SimilariteDto;
import com.pfa.dto.SujetDto;
import com.pfa.security.CustomUserDetails;
import com.pfa.service.SimilarityService;
import com.pfa.service.SujetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sujets")
@RequiredArgsConstructor
public class SujetController {

    private final SujetService sujetService;
    private final SimilarityService similarityService;

    @GetMapping
    public ResponseEntity<List<SujetDto>> rechercher(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long professeurId,
            @RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(sujetService.rechercher(keyword, professeurId, annee));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SujetDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sujetService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<SujetDto> creer(@Valid @RequestBody SujetDto dto,
                                          @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(sujetService.creer(dto, user.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<SujetDto> modifier(@PathVariable Long id,
                                             @Valid @RequestBody SujetDto dto,
                                             @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(sujetService.modifier(id, dto, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id,
                                          @AuthenticationPrincipal CustomUserDetails user) {
        sujetService.supprimer(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/similaires")
    public ResponseEntity<List<SimilariteDto>> similaires(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int topK) {
        return ResponseEntity.ok(similarityService.trouverSimilaires(id, topK));
    }

    @GetMapping("/{id}/suggestions")
    public ResponseEntity<Map<String, Object>> suggestions(@PathVariable Long id) {
        return ResponseEntity.ok(similarityService.getSuggestions(id));
    }
}
