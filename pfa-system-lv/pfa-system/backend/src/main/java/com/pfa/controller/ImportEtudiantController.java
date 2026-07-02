package com.pfa.controller;

import com.pfa.dto.EtudiantImportDto;
import com.pfa.dto.EtudiantImporteResultDto;
import com.pfa.service.ImportEtudiantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/import/etudiants")
@PreAuthorize("hasRole('PROFESSEUR') or hasRole('ADMIN')")
@RequiredArgsConstructor
public class ImportEtudiantController {

    private final ImportEtudiantService importService;

    @PostMapping("/preview")
    public ResponseEntity<List<EtudiantImportDto>> preview(@RequestParam("file") MultipartFile file) {
        try {
            List<EtudiantImportDto> parsed = importService.parseExcel(file);
            return ResponseEntity.ok(parsed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<List<EtudiantImporteResultDto>> importer(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "envoyerEmail", defaultValue = "false") boolean envoyerEmail) {
        try {
            log.info("Import demandé, envoyerEmail={}", envoyerEmail);
            List<EtudiantImportDto> parsed = importService.parseExcel(file);
            List<EtudiantImporteResultDto> results = importService.importer(parsed);

            if (envoyerEmail) {
                results.stream()
                        .filter(r -> "CREE".equals(r.getStatut()))
                        .forEach(importService::envoyerEmail);
            }

            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] content = importService.genererTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=modele-etudiants.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(content);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
