package com.pfa.service;

import com.pfa.dto.EtudiantStatusDto;
import com.pfa.dto.ProjetDto;
import com.pfa.entity.Projet;
import com.pfa.entity.Role;
import com.pfa.entity.Utilisateur;
import com.pfa.exception.BadRequestException;
import com.pfa.exception.NotFoundException;
import com.pfa.repository.ProjetRepository;
import com.pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipeService {

    private static final int TAILLE_MAX_EQUIPE = 4;

    private final ProjetRepository projetRepo;
    private final UtilisateurRepository userRepo;
    private final ProjetService projetService;

    @Transactional
    public ProjetDto ajouterEtudiant(Long projetId, Long etudiantId) {
        Projet projet = projetRepo.findById(projetId)
            .orElseThrow(() -> new NotFoundException("Projet introuvable"));
        Utilisateur etudiant = userRepo.findById(etudiantId)
            .orElseThrow(() -> new NotFoundException("\u00c9tudiant introuvable"));

        if (etudiant.getRole() != Role.ETUDIANT) {
            throw new BadRequestException("Seuls les \u00e9tudiants peuvent rejoindre une \u00e9quipe");
        }
        if (projet.getEtudiants().size() >= TAILLE_MAX_EQUIPE) {
            throw new BadRequestException("\u00c9quipe compl\u00e8te (max " + TAILLE_MAX_EQUIPE + ")");
        }
        projet.getEtudiants().add(etudiant);
        return projetService.toDto(projetRepo.save(projet));
    }

    @Transactional
    public ProjetDto retirerEtudiant(Long projetId, Long etudiantId) {
        Projet projet = projetRepo.findById(projetId)
            .orElseThrow(() -> new NotFoundException("Projet introuvable"));
        projet.getEtudiants().removeIf(e -> e.getId().equals(etudiantId));
        return projetService.toDto(projetRepo.save(projet));
    }

    @Transactional(readOnly = true)
    public List<EtudiantStatusDto> statutEtudiants() {
        List<Utilisateur> etudiants = userRepo.findByRole(Role.ETUDIANT);
        List<Projet> projets = projetRepo.findAll();

        return etudiants.stream().map(e -> {
            Projet projetEtudiant = projets.stream()
                .filter(p -> p.getEtudiants().stream().anyMatch(s -> s.getId().equals(e.getId())))
                .findFirst().orElse(null);

            return new EtudiantStatusDto(
                e.getId(),
                e.getNom(),
                e.getPrenom(),
                e.getEmail(),
                projetEtudiant != null,
                projetEtudiant != null ? projetEtudiant.getSujet().getTitre() : null,
                projetEtudiant != null ? projetEtudiant.getId() : null
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<ProjetDto> equipesIncompletes(String professeurEmail) {
        Utilisateur prof = userRepo.findByEmail(professeurEmail)
            .orElseThrow(() -> new NotFoundException("Professeur introuvable"));
        return projetRepo.findByProfesseurId(prof.getId()).stream()
            .filter(p -> p.getEtudiants().size() < TAILLE_MAX_EQUIPE)
            .map(projetService::toDto)
            .toList();
    }
}
