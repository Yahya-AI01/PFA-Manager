package com.pfa.service;

import com.pfa.dto.EtudiantImportDto;
import com.pfa.dto.EtudiantImporteResultDto;
import com.pfa.entity.Role;
import com.pfa.entity.Utilisateur;
import com.pfa.repository.UtilisateurRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportEtudiantService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final Optional<JavaMailSender> mailSender;

    @Value("${app.mail.from:noreply@pfa.ma}")
    private String mailFrom;

    @Value("${app.mail.from-name:PFA Manager}")
    private String mailFromName;

    private static final String CHARS_SAFE = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final Random RANDOM = new Random();

    public List<EtudiantImportDto> parseExcel(MultipartFile file) throws Exception {
        List<EtudiantImportDto> result = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() < 1) return result;

            // Detect column indices from header row
            Row headerRow = sheet.getRow(0);
            int colNom = -1, colPrenom = -1, colEmail = -1;

            for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                Cell cell = headerRow.getCell(c);
                if (cell == null) continue;
                String header = getCellStringValue(cell).trim().toLowerCase();
                if (header.equals("nom")) colNom = c;
                else if (header.equals("prenom") || header.equals("prénom")) colPrenom = c;
                else if (header.equals("email") || header.equals("e-mail") || header.equals("mail")) colEmail = c;
            }

            if (colNom == -1 || colPrenom == -1) {
                throw new IllegalArgumentException("Colonnes 'nom' et 'prenom' requises dans l'en-tête");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String nom = getCellStringValue(row.getCell(colNom)).trim();
                String prenom = getCellStringValue(row.getCell(colPrenom)).trim();
                String email = colEmail >= 0 ? getCellStringValue(row.getCell(colEmail)).trim() : "";

                // Skip empty rows
                if (nom.isEmpty() && prenom.isEmpty()) continue;

                // Auto-generate email if missing
                if (email.isEmpty() && !nom.isEmpty() && !prenom.isEmpty()) {
                    email = generateEmail(prenom, nom);
                }

                result.add(new EtudiantImportDto(nom, prenom, email));
            }
        }

        return result;
    }

    public List<EtudiantImporteResultDto> importer(List<EtudiantImportDto> etudiants) {
        List<EtudiantImporteResultDto> results = new ArrayList<>();

        for (EtudiantImportDto dto : etudiants) {
            try {
                if (utilisateurRepository.existsByEmail(dto.getEmail())) {
                    results.add(new EtudiantImporteResultDto(
                            dto.getNom(), dto.getPrenom(), dto.getEmail(),
                            null, "DOUBLON", "Un compte existe déjà avec cet email"));
                    continue;
                }

                String motDePasse = genererMotDePasse();

                Utilisateur u = new Utilisateur();
                u.setNom(dto.getNom());
                u.setPrenom(dto.getPrenom());
                u.setEmail(dto.getEmail());
                u.setMotDePasse(passwordEncoder.encode(motDePasse));
                u.setRole(Role.ETUDIANT);
                utilisateurRepository.save(u);

                results.add(new EtudiantImporteResultDto(
                        dto.getNom(), dto.getPrenom(), dto.getEmail(),
                        motDePasse, "CREE", "Compte créé avec succès"));

            } catch (Exception e) {
                log.error("Erreur import étudiant {}: {}", dto.getEmail(), e.getMessage());
                results.add(new EtudiantImporteResultDto(
                        dto.getNom(), dto.getPrenom(), dto.getEmail(),
                        null, "ERREUR", e.getMessage()));
            }
        }

        return results;
    }

    public void envoyerEmail(EtudiantImporteResultDto result) {
        log.info("Tentative envoi mail à {} avec from={}", result.getEmail(), mailFrom);

        if (mailSender.isEmpty()) {
            log.warn("Mail non configuré — identifiants pour {} non envoyés", result.getEmail());
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.get().createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(result.getEmail());
            helper.setFrom(mailFrom, mailFromName);
            helper.setSubject("Bienvenue sur PFA Manager \u2014 Vos identifiants");

            String html = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:30px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#fc4a17,#ff7849);padding:30px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:1px;">PFA Manager</h1>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:30px 40px;">
                            <p style="font-size:16px;color:#333;">Bonjour <strong>%s %s</strong>,</p>
                            <p style="font-size:15px;color:#555;line-height:1.6;">
                              Votre compte sur <strong>PFA Manager</strong> a bien été créé.
                              Voici vos identifiants de connexion :
                            </p>
                            <!-- Credentials box -->
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   style="background:#fff8f4;border:1px solid #fc4a17;border-radius:6px;margin:20px 0;">
                              <tr>
                                <td style="padding:20px 25px;">
                                  <p style="margin:0 0 8px;font-size:14px;color:#666;">Email</p>
                                  <p style="margin:0 0 16px;font-size:16px;font-family:'Courier New',monospace;color:#333;font-weight:bold;">%s</p>
                                  <p style="margin:0 0 8px;font-size:14px;color:#666;">Mot de passe</p>
                                  <p style="margin:0;font-size:16px;font-family:'Courier New',monospace;color:#333;font-weight:bold;">%s</p>
                                </td>
                              </tr>
                            </table>
                            <!-- Button -->
                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                              <tr><td align="center">
                                <a href="http://localhost:5173"
                                   style="display:inline-block;background:#fc4a17;color:#ffffff;text-decoration:none;
                                          padding:14px 40px;border-radius:6px;font-size:16px;font-weight:bold;">
                                  Se connecter
                                </a>
                              </td></tr>
                            </table>
                            <p style="font-size:13px;color:#888;font-style:italic;margin-top:20px;">
                              Vous devrez changer votre mot de passe à votre première connexion.
                            </p>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#fafafa;padding:20px;text-align:center;border-top:1px solid #eee;">
                            <p style="margin:0;font-size:12px;color:#aaa;">&copy; 2026 PFA Manager — Tous droits réservés</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(result.getPrenom(), result.getNom(), result.getEmail(), result.getMotDePasseGenere());

            helper.setText(html, true);
            mailSender.get().send(mimeMessage);
            log.info("Email envoyé à {}", result.getEmail());
        } catch (Exception e) {
            log.error("Échec envoi email à {} : {}", result.getEmail(), e.getMessage(), e);
        }
    }

    public byte[] genererTemplate() throws Exception {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Étudiants");

            // Header style
            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            String[] headers = {"nom", "prenom", "email"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Example rows
            Object[][] examples = {
                    {"Tazi", "Mehdi", "mehdi.tazi@etudiant.pfa.ma"},
                    {"Alaoui", "Yasmine", "yasmine.alaoui@etudiant.pfa.ma"},
            };
            for (int r = 0; r < examples.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < examples[r].length; c++) {
                    row.createCell(c).setCellValue((String) examples[r][c]);
                }
            }

            // Auto-size
            for (int i = 0; i < 3; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    public String genererMotDePasse() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(CHARS_SAFE.charAt(RANDOM.nextInt(CHARS_SAFE.length())));
        }
        return sb.toString();
    }

    private String generateEmail(String prenom, String nom) {
        String slug = stripAccents(prenom).toLowerCase() + "." + stripAccents(nom).toLowerCase();
        slug = slug.replaceAll("[^a-z0-9.]", "");
        return slug + "@etudiant.pfa.ma";
    }

    private String stripAccents(String s) {
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        return normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
