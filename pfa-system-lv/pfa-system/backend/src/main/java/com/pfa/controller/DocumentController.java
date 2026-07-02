package com.pfa.controller;

import com.pfa.dto.DocumentDto;
import com.pfa.entity.Document;
import com.pfa.security.CustomUserDetails;
import com.pfa.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService docService;

    @PostMapping("/projets/{projetId}/documents")
    public ResponseEntity<DocumentDto> upload(
            @PathVariable Long projetId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(docService.uploader(projetId, file, user.getUsername()));
    }

    @GetMapping("/projets/{projetId}/documents")
    public ResponseEntity<List<DocumentDto>> lister(@PathVariable Long projetId) {
        return ResponseEntity.ok(docService.listerParProjet(projetId));
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> telecharger(@PathVariable Long id) {
        Document doc = docService.getById(id);
        Resource resource = docService.chargerCommeRessource(doc);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(doc.getTypeMime()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + doc.getNomOriginal() + "\"")
            .body(resource);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> supprimer(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        docService.supprimer(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
