package com.pfa.config;

import com.pfa.entity.*;
import com.pfa.entity.Module;
import com.pfa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepo;
    private final ModuleRepository moduleRepo;
    private final SujetRepository sujetRepo;
    private final ProjetRepository projetRepo;
    private final TacheRepository tacheRepo;
    private final MessageRepository messageRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (utilisateurRepo.count() > 0) return;

        // ========== Utilisateurs ==========
        Utilisateur admin = save(Utilisateur.builder()
            .nom("Admin").prenom("Super")
            .email("admin@pfa.ma")
            .motDePasse(passwordEncoder.encode("admin123"))
            .role(Role.ADMIN).build());

        Utilisateur prof1 = save(Utilisateur.builder()
            .nom("MISKY").prenom("YAHYA")
            .email("prof1@pfa.ma")
            .motDePasse(passwordEncoder.encode("prof123"))
            .role(Role.PROFESSEUR).build());

        Utilisateur prof2 = save(Utilisateur.builder()
            .nom("HAYTAM").prenom("SABONA")
            .email("prof2@pfa.ma")
            .motDePasse(passwordEncoder.encode("prof123"))
            .role(Role.PROFESSEUR).build());

        Utilisateur etu1 = save(Utilisateur.builder()
            .nom("NOBEL").prenom("JANGO")
            .email("etudiant1@pfa.ma")
            .motDePasse(passwordEncoder.encode("etu123"))
            .role(Role.ETUDIANT).build());

        Utilisateur etu2 = save(Utilisateur.builder()
            .nom("JDIDA").prenom("HMIDA")
            .email("etudiant2@pfa.ma")
            .motDePasse(passwordEncoder.encode("etu123"))
            .role(Role.ETUDIANT).build());

        Utilisateur etu3 = save(Utilisateur.builder()
            .nom("DEMBELE").prenom("DOUEE")
            .email("etudiant3@pfa.ma")
            .motDePasse(passwordEncoder.encode("etu123"))
            .role(Role.ETUDIANT).build());

        save(Utilisateur.builder()
            .nom("OKAFIH").prenom("Omar")
            .email("etudiant4@pfa.ma")
            .motDePasse(passwordEncoder.encode("etu123"))
            .role(Role.ETUDIANT).build());

        save(Utilisateur.builder()
            .nom("Berrada").prenom("NAJITA")
            .email("etudiant5@pfa.ma")
            .motDePasse(passwordEncoder.encode("etu123"))
            .role(Role.ETUDIANT).build());

        // ========== Modules ==========
        Module dev = moduleRepo.save(Module.builder().nom("D\u00e9veloppement Web").description("Web full-stack").build());
        Module ia = moduleRepo.save(Module.builder().nom("Intelligence Artificielle").description("ML, IA, NLP").build());
        Module mobile = moduleRepo.save(Module.builder().nom("D\u00e9veloppement Mobile").description("iOS / Android").build());
        Module bdd = moduleRepo.save(Module.builder().nom("Bases de donn\u00e9es").description("SQL, NoSQL").build());

        // ========== Sujets ==========
        Sujet s1 = sujetRepo.save(Sujet.builder().titre("Plateforme de gestion de PFA")
            .description("Application web pour la gestion des projets de fin d'ann\u00e9e avec Spring Boot et React.")
            .annee(2026).disponible(true).module(dev).professeur(prof1).build());

        Sujet s2 = sujetRepo.save(Sujet.builder().titre("Syst\u00e8me de recommandation de films")
            .description("Recommandation par filtrage collaboratif et TF-IDF en Python.")
            .annee(2026).disponible(true).module(ia).professeur(prof1).build());

        sujetRepo.save(Sujet.builder().titre("Application mobile de tourisme au Maroc")
            .description("App React Native avec g\u00e9olocalisation et recommandations personnalis\u00e9es.")
            .annee(2026).disponible(true).module(mobile).professeur(prof2).build());

        sujetRepo.save(Sujet.builder().titre("D\u00e9tection d'anomalies dans des journaux serveur")
            .description("Mod\u00e8le ML pour d\u00e9tecter des intrusions et anomalies dans des logs.")
            .annee(2026).disponible(true).module(ia).professeur(prof2).build());

        sujetRepo.save(Sujet.builder().titre("Tableau de bord BI")
            .description("Dashboard analytics avec ETL, SQL Server et visualisations interactives.")
            .annee(2025).disponible(false).module(bdd).professeur(prof1).build());

        sujetRepo.save(Sujet.builder().titre("Chatbot intelligent pour FAQ universitaire")
            .description("Bot conversationnel avec NLP pour r\u00e9pondre aux questions des \u00e9tudiants.")
            .annee(2026).disponible(true).module(ia).professeur(prof2).build());

        // ========== Projets de démo (équipes formées) ==========
        // Projet 1 : Yasmine + Mehdi sur "Plateforme de gestion de PFA"
        Projet p1 = projetRepo.save(Projet.builder()
            .sujet(s1)
            .etudiants(new HashSet<>(Set.of(etu1, etu2)))
            .statut(StatutProjet.EN_COURS)
            .build());

        // Projet 2 : Imane sur "Système de recommandation de films" (équipe en cours de formation)
        Projet p2 = projetRepo.save(Projet.builder()
            .sujet(s2)
            .etudiants(new HashSet<>(Set.of(etu3)))
            .statut(StatutProjet.EN_COURS)
            .build());

        // ========== Tâches Kanban pour le projet 1 ==========
        tacheRepo.saveAll(List.of(
            Tache.builder().titre("Analyser le cahier des charges").statut(StatutTache.DONE).projet(p1).build(),
            Tache.builder().titre("Cr\u00e9er les maquettes").statut(StatutTache.DONE).projet(p1).build(),
            Tache.builder().titre("Mod\u00e9liser la BDD").statut(StatutTache.DOING).projet(p1).build(),
            Tache.builder().titre("Impl\u00e9menter l'authentification JWT").statut(StatutTache.DOING).projet(p1).build(),
            Tache.builder().titre("D\u00e9velopper le module Kanban").statut(StatutTache.TODO).projet(p1).build(),
            Tache.builder().titre("Int\u00e9grer le service IA").statut(StatutTache.TODO).projet(p1).build(),
            Tache.builder().titre("Tests unitaires").statut(StatutTache.TODO).projet(p1).build()
        ));

        // ========== Messages de démo ==========
        messageRepo.saveAll(List.of(
            Message.builder().contenu("Bonjour Madame, on a commenc\u00e9 l'analyse !")
                .expediteur(etu1).projet(p1).lu(true).build(),
            Message.builder().contenu("Parfait, n'oubliez pas de finir les maquettes avant vendredi.")
                .expediteur(prof1).projet(p1).lu(true).build(),
            Message.builder().contenu("On a une question sur la mod\u00e9lisation des entit\u00e9s.")
                .expediteur(etu2).projet(p1).lu(false).build()
        ));

        System.out.println("\u2705 Donn\u00e9es de d\u00e9mo charg\u00e9es. Comptes:");
        System.out.println("   admin@pfa.ma     / admin123");
        System.out.println("   prof1@pfa.ma     / prof123");
        System.out.println("   etudiant1@pfa.ma / etu123  (a un projet en cours avec \u00e9quipe)");
        System.out.println("   etudiant2@pfa.ma / etu123");
        System.out.println("   etudiant3@pfa.ma / etu123");
        System.out.println("   etudiant4@pfa.ma / etu123  (sans projet - rouge)");
        System.out.println("   etudiant5@pfa.ma / etu123  (sans projet - rouge)");
    }

    private Utilisateur save(Utilisateur u) { return utilisateurRepo.save(u); }
}
