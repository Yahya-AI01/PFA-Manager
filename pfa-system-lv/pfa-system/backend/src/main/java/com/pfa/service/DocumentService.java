package com.pfa.service;

import com.pfa.dto.DocumentDto;
import com.pfa.entity.Document;
import com.pfa.entity.Projet;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.BadRequestException;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.DocumentRepository;
import com.pfa.repository.ProjetRepository;
import com.pfa.repository.UtilisateurRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final Set<String> TYPES_AUTORISES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png", "image/jpeg"
    );
    private static final long TAILLE_MAX = 10 * 1024 * 1024L; // 10 Mo

    private final DocumentRepository docRepo;
    private final ProjetRepository projetRepo;
    private final UtilisateurRepository userRepo;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootPath;

    @PostConstruct
    void init() {
        try {
            this.rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootPath);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de cr\u00e9er le r\u00e9pertoire uploads", e);
        }
    }

    @Transactional
    public DocumentDto uploader(Long projetId, MultipartFile file, String userEmail) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fichier vide");
        }
        if (file.getSize() > TAILLE_MAX) {
            throw new BadRequestException("Fichier trop volumineux (max 10 Mo)");
        }
        if (!TYPES_AUTORISES.contains(file.getContentType())) {
            throw new BadRequestException("Type de fichier non autoris\u00e9 : " + file.getContentType());
        }

        Projet projet = projetRepo.findById(projetId)
            .orElseThrow(() -> new NotFoundException("Projet introuvable"));
        Utilisateur user = userRepo.findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        String safeName = UUID.randomUUID() + "_" + sanitize(file.getOriginalFilename());
        Path destination = rootPath.resolve(safeName);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur \u00e9criture fichier", e);
        }

        Document doc = Document.builder()
            .nomOriginal(file.getOriginalFilename())
            .cheminStockage(safeName)
            .typeMime(file.getContentType())
            .tailleOctets(file.getSize())
            .projet(projet)
            .uploadePar(user)
            .build();

        return toDto(docRepo.save(doc));
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> listerParProjet(Long projetId) {
        return docRepo.findByProjetIdOrderByDateUploadDesc(projetId)
            .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Document getById(Long id) {
        return docRepo.findById(id).orElseThrow(() -> new NotFoundException("Document introuvable"));
    }

    public Resource chargerCommeRessource(Document doc) {
        try {
            Path filePath = rootPath.resolve(doc.getCheminStockage()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) return resource;
            throw new NotFoundException("Fichier physique introuvable");
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void supprimer(Long id, String userEmail) {
        Document doc = getById(id);
        if (!doc.getUploadePar().getEmail().equals(userEmail)) {
            throw new BadRequestException("Vous ne pouvez supprimer que vos propres fichiers");
        }
        try {
            Files.deleteIfExists(rootPath.resolve(doc.getCheminStockage()));
        } catch (IOException ignored) {}
        docRepo.delete(doc);
    }

    private String sanitize(String name) {
        if (name == null) return "fichier";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public DocumentDto toDto(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.setId(d.getId());
        dto.setNomOriginal(d.getNomOriginal());
        dto.setTypeMime(d.getTypeMime());
        dto.setTailleOctets(d.getTailleOctets());
        dto.setProjetId(d.getProjet().getId());
        dto.setUploadeParId(d.getUploadePar().getId());
        dto.setUploadeParNom(d.getUploadePar().getPrenom() + " " + d.getUploadePar().getNom());
        dto.setDateUpload(d.getDateUpload());
        dto.setDownloadUrl("/api/documents/" + d.getId() + "/download");
        return dto;
    }
}
