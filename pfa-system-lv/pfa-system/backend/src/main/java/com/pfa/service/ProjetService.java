package com.pfa.service;

import com.pfa.dto.ProjetDto;
import com.pfa.entity.Projet;
import com.pfa.entity.Sujet;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.BadRequestException;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.ProjetRepository;
import com.pfa.repository.SujetRepository;
import com.pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjetService {

    private static final int TAILLE_MAX_EQUIPE = 4;

    private final ProjetRepository projetRepo;
    private final SujetRepository sujetRepo;
    private final UtilisateurRepository utilisateurRepo;

    /**
     * Choisir un sujet : si un projet existe d\u00e9j\u00e0 sur ce sujet et que l'\u00e9quipe n'est pas pleine,
     * l'\u00e9tudiant rejoint l'\u00e9quipe (auto-grouping). Sinon, cr\u00e9e un nouveau projet.
     */
    @Transactional
    public ProjetDto choisirSujet(Long sujetId, String etudiantEmail) {
        Sujet sujet = sujetRepo.findById(sujetId)
            .orElseThrow(() -> new NotFoundException("Sujet introuvable"));
        Utilisateur etudiant = utilisateurRepo.findByEmail(etudiantEmail)
            .orElseThrow(() -> new NotFoundException("\u00c9tudiant introuvable"));

        Projet projet = projetRepo.findBySujetId(sujetId).orElse(null);

        if (projet != null) {
            // Projet existe d\u00e9j\u00e0 \u2192 rejoindre l'\u00e9quipe
            if (projet.getEtudiants().stream().anyMatch(s -> s.getId().equals(etudiant.getId()))) {
                throw new BadRequestException("Vous faites d\u00e9j\u00e0 partie de cette \u00e9quipe");
            }
            if (projet.getEtudiants().size() >= TAILLE_MAX_EQUIPE) {
                throw new BadRequestException("\u00c9quipe compl\u00e8te (max " + TAILLE_MAX_EQUIPE + " \u00e9tudiants)");
            }
            projet.getEtudiants().add(etudiant);
            // Marquer indisponible si \u00e9quipe pleine
            if (projet.getEtudiants().size() >= TAILLE_MAX_EQUIPE) {
                sujet.setDisponible(false);
                sujetRepo.save(sujet);
            }
        } else {
            // Premier \u00e9tudiant \u2192 cr\u00e9er le projet
            if (!Boolean.TRUE.equals(sujet.getDisponible())) {
                throw new BadRequestException("Sujet non disponible");
            }
            projet = Projet.builder()
                .sujet(sujet)
                .etudiants(new HashSet<>(Set.of(etudiant)))
                .build();
        }

        return toDto(projetRepo.save(projet));
    }

    @Transactional(readOnly = true)
    public List<ProjetDto> getAll() {
        return projetRepo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ProjetDto getById(Long id) {
        return toDto(projetRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Projet introuvable")));
    }

    @Transactional(readOnly = true)
    public List<ProjetDto> getByEtudiant(String email) {
        Utilisateur u = utilisateurRepo.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return projetRepo.findByEtudiantId(u.getId()).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ProjetDto> getByProfesseur(String email) {
        Utilisateur u = utilisateurRepo.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return projetRepo.findByProfesseurId(u.getId()).stream().map(this::toDto).toList();
    }

    public ProjetDto toDto(Projet p) {
        ProjetDto dto = new ProjetDto();
        dto.setId(p.getId());
        dto.setSujetId(p.getSujet().getId());
        dto.setSujetTitre(p.getSujet().getTitre());
        Utilisateur prof = p.getSujet().getProfesseur();
        if (prof != null) dto.setProfesseurNom(prof.getPrenom() + " " + prof.getNom());
        dto.setStatut(p.getStatut());
        dto.setRapportUrl(p.getRapportUrl());
        dto.setEtudiants(p.getEtudiants().stream().map(e -> {
            ProjetDto.EtudiantInfo info = new ProjetDto.EtudiantInfo();
            info.setId(e.getId());
            info.setNom(e.getNom());
            info.setPrenom(e.getPrenom());
            info.setEmail(e.getEmail());
            return info;
        }).toList());
        return dto;
    }
}
