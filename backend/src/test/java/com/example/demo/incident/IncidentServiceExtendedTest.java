package com.example.demo.incident;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Extended tests for IncidentService covering CU-GENERAL-04 business rules:
 * RN-INC-01..RN-INC-14 (HU-GENERAL-01 & HU-ARRENDATARIO-33)
 */
@ExtendWith(MockitoExtension.class)
class IncidentServiceExtendedTest {

    @Mock private IncidentRepository incidentRepository;
    @Mock private IncidentCommentRepository incidentCommentRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private UserRepository userRepository;
    @Mock private KitRepository kitRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private IncidentService incidentService;

    private User adminUser;
    private User regularUser;
    private User ownerUser;
    private Article testItem;
    private Kit testKit;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setName("Admin");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole(UserRole.ADMIN);

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setName("Regular");
        regularUser.setEmail("regular@example.com");
        regularUser.setRole(UserRole.USER);

        ownerUser = new User();
        ownerUser.setId(3L);
        ownerUser.setName("Owner");
        ownerUser.setEmail("owner@example.com");
        ownerUser.setRole(UserRole.USER);

        testItem = new Article();
        testItem.setId(10L);
        testItem.setTitle("Test Item");
        testItem.setOwner(ownerUser);

        testKit = new Kit();
        testKit.setId(5L);

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void authenticateAs(User user) {
        lenient().when(authentication.getPrincipal()).thenReturn(user.getEmail());
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    private Incident makeIncident(Long id, IncidentType type, IncidentStatus status, User author) {
        Incident i = new Incident();
        i.setId(id);
        i.setTitle("Incident Title");
        i.setDescription("Incident Description");
        i.setType(type);
        i.setStatus(status);
        i.setUser(author);
        if (type == IncidentType.DAMAGED_ITEM) {
            i.setRelatedItem(testItem);
            i.setRelatedKit(testKit);
        }
        return i;
    }

    // ═══════════════ RN-INC-01: Title is required ═══════════════

    @Test
    void createIncident_blankTitle_throwsIllegalArgument() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle("");
        incident.setDescription("Valid description");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(regularUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(IllegalArgumentException.class, () -> incidentService.createIncident(incident));
    }

    @Test
    void createIncident_nullTitle_throwsIllegalArgument() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle(null);
        incident.setDescription("Valid description");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(regularUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(IllegalArgumentException.class, () -> incidentService.createIncident(incident));
    }

    // ═══════════════ RN-INC-02: Description is required, max 1000 chars ═══════════════

    @Test
    void createIncident_blankDescription_throwsIllegalArgument() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle("Valid Title");
        incident.setDescription("");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(regularUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(IllegalArgumentException.class, () -> incidentService.createIncident(incident));
    }

    @Test
    void createIncident_nullDescription_throwsIllegalArgument() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle("Valid Title");
        incident.setDescription(null);
        incident.setType(IncidentType.GENERAL);
        incident.setUser(regularUser);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(IllegalArgumentException.class, () -> incidentService.createIncident(incident));
    }

    // ═══════════════ RN-INC-03: DAMAGED_ITEM requires relatedItem and relatedKit ═══════════════

    @Test
    void createIncident_damagedItemWithoutRelatedItem_throwsIllegalArgument() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle("Damaged");
        incident.setDescription("Item is broken");
        incident.setType(IncidentType.DAMAGED_ITEM);
        incident.setUser(regularUser);
        incident.setRelatedItem(null);
        incident.setRelatedKit(testKit);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(kitRepository.findById(5L)).thenReturn(Optional.of(testKit));

        assertThrows(IllegalArgumentException.class, () -> incidentService.createIncident(incident));
    }

    // ═══════════════ RN-INC-05: New incident defaults to OPEN ═══════════════

    @Test
    void createIncident_defaultsToOpenStatus() {
        authenticateAs(adminUser);
        Incident incident = new Incident();
        incident.setTitle("Test");
        incident.setDescription("Description");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(adminUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> {
            Incident saved = i.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Incident result = incidentService.createIncident(incident);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.OPEN);
    }

    // ═══════════════ GENERAL type clears relatedItem and relatedKit ═══════════════

    @Test
    void createIncident_generalType_clearsRelatedItemAndKit() {
        authenticateAs(adminUser);
        Incident incident = new Incident();
        incident.setTitle("General issue");
        incident.setDescription("Some issue");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(adminUser);
        incident.setRelatedItem(testItem);
        incident.setRelatedKit(testKit);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(testItem));
        when(kitRepository.findById(5L)).thenReturn(Optional.of(testKit));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = incidentService.createIncident(incident);
        assertThat(result.getRelatedItem()).isNull();
        assertThat(result.getRelatedKit()).isNull();
    }

    // ═══════════════ HU-ARRENDATARIO-33: Create DAMAGED_ITEM incident ═══════════════

    @Test
    void createIncident_damagedItem_successful() {
        authenticateAs(regularUser);
        Incident incident = new Incident();
        incident.setTitle("Screen scratched");
        incident.setDescription("The laptop screen has scratches");
        incident.setType(IncidentType.DAMAGED_ITEM);
        incident.setUser(regularUser);
        incident.setRelatedItem(testItem);
        incident.setRelatedKit(testKit);

        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(testItem));
        when(kitRepository.findById(5L)).thenReturn(Optional.of(testKit));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> {
            Incident saved = i.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Incident result = incidentService.createIncident(incident);

        assertThat(result.getType()).isEqualTo(IncidentType.DAMAGED_ITEM);
        assertThat(result.getRelatedItem()).isNotNull();
        assertThat(result.getRelatedItem().getId()).isEqualTo(10L);
        assertThat(result.getRelatedKit()).isNotNull();
        assertThat(result.getRelatedKit().getId()).isEqualTo(5L);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.OPEN);
    }

    // ═══════════════ RN-INC-08: Cannot delete RESOLVED incident ═══════════════

    @Test
    void deleteIncident_resolvedIncident_throws() {
        authenticateAs(adminUser);
        Incident resolved = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.RESOLVED, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(resolved));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> incidentService.deleteIncident(1L));
        assertThat(ex.getMessage()).contains("No se puede eliminar una incidencia resuelta");
    }

    // ═══════════════ RN-INC-09: Cannot add comments to RESOLVED incident ═══════════════

    @Test
    void addComment_resolvedIncident_throws() {
        authenticateAs(adminUser);
        Incident resolved = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.RESOLVED, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(resolved));

        IncidentComment comment = new IncidentComment("Test comment", adminUser, resolved);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> incidentService.addComment(1L, comment));
        assertThat(ex.getMessage()).contains("No se pueden añadir comentarios a una incidencia resuelta");
    }

    // ═══════════════ addComment on OPEN incident succeeds ═══════════════

    @Test
    void addComment_openIncident_successful() {
        authenticateAs(adminUser);
        Incident open = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(open));

        IncidentComment comment = new IncidentComment();
        comment.setText("Comment text");
        comment.setAuthor(adminUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(incidentCommentRepository.save(any(IncidentComment.class))).thenAnswer(i -> {
            IncidentComment saved = i.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        IncidentComment result = incidentService.addComment(1L, comment);
        assertThat(result.getText()).isEqualTo("Comment text");
        assertThat(result.getIncident()).isEqualTo(open);
    }

    @Test
    void addComment_inProgressIncident_successful() {
        authenticateAs(adminUser);
        Incident inProgress = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.IN_PROGRESS, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(inProgress));

        IncidentComment comment = new IncidentComment();
        comment.setText("Progress update");
        comment.setAuthor(adminUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(incidentCommentRepository.save(any(IncidentComment.class))).thenAnswer(i -> {
            IncidentComment saved = i.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        IncidentComment result = incidentService.addComment(1L, comment);
        assertThat(result.getId()).isEqualTo(2L);
    }

    // ═══════════════ getCommentsByIncidentId ═══════════════

    @Test
    void getCommentsByIncidentId_returnsOrderedComments() {
        authenticateAs(adminUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        IncidentComment c1 = new IncidentComment("First", adminUser, incident);
        c1.setCreatedAt(LocalDateTime.of(2026, 3, 1, 10, 0));
        IncidentComment c2 = new IncidentComment("Second", regularUser, incident);
        c2.setCreatedAt(LocalDateTime.of(2026, 3, 2, 10, 0));

        when(incidentCommentRepository.findByIncidentIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(c1, c2));

        List<IncidentComment> result = incidentService.getCommentsByIncidentId(1L);
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getText()).isEqualTo("First");
        assertThat(result.get(1).getText()).isEqualTo("Second");
    }

    // ═══════════════ resolveIncident ═══════════════

    @Test
    void resolveIncident_changesStatusToResolved() {
        authenticateAs(adminUser);
        Incident open = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(open));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = incidentService.resolveIncident(1L);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
    }

    @Test
    void resolveIncident_inProgress_changesStatusToResolved() {
        authenticateAs(adminUser);
        Incident inProgress = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.IN_PROGRESS, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(inProgress));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = incidentService.resolveIncident(1L);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
    }

    // ═══════════════ getIncidentsByUserId ═══════════════

    @Test
    void getIncidentsByUserId_asAdmin_returnsIncidents() {
        authenticateAs(adminUser);
        List<Incident> incidents = List.of(
                makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser)
        );
        when(incidentRepository.findByUserId(2L)).thenReturn(incidents);

        List<Incident> result = incidentService.getIncidentsByUserId(2L);
        assertThat(result).hasSize(1);
    }

    @Test
    void getIncidentsByUserId_asAuthor_returnsIncidents() {
        authenticateAs(regularUser);
        List<Incident> incidents = List.of(
                makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser)
        );
        when(incidentRepository.findByUserId(2L)).thenReturn(incidents);

        List<Incident> result = incidentService.getIncidentsByUserId(2L);
        assertThat(result).hasSize(1);
    }

    @Test
    void getIncidentsByUserId_emptyList_returnsEmpty() {
        authenticateAs(regularUser);
        when(incidentRepository.findByUserId(2L)).thenReturn(List.of());

        List<Incident> result = incidentService.getIncidentsByUserId(2L);
        assertThat(result).isEmpty();
    }

    // ═══════════════ getReceivedIncidentsByOwnerId ═══════════════

    @Test
    void getReceivedIncidentsByOwnerId_asAdmin_returnsIncidents() {
        authenticateAs(adminUser);
        Incident damaged = makeIncident(1L, IncidentType.DAMAGED_ITEM, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findReceivedByOwnerId(3L)).thenReturn(List.of(damaged));

        List<Incident> result = incidentService.getReceivedIncidentsByOwnerId(3L);
        assertThat(result).hasSize(1);
    }

    @Test
    void getReceivedIncidentsByOwnerId_asOwner_returnsIncidents() {
        authenticateAs(ownerUser);
        Incident damaged = makeIncident(1L, IncidentType.DAMAGED_ITEM, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findReceivedByOwnerId(3L)).thenReturn(List.of(damaged));

        List<Incident> result = incidentService.getReceivedIncidentsByOwnerId(3L);
        assertThat(result).hasSize(1);
    }

    @Test
    void getReceivedIncidentsByOwnerId_emptyList_returnsEmpty() {
        authenticateAs(ownerUser);
        when(incidentRepository.findReceivedByOwnerId(3L)).thenReturn(List.of());

        List<Incident> result = incidentService.getReceivedIncidentsByOwnerId(3L);
        assertThat(result).isEmpty();
    }

    // ═══════════════ Access Control Tests ═══════════════

    @Test
    void getAllIncidents_nonAdmin_throwsAccessDenied() {
        authenticateAs(regularUser);
        assertThrows(AccessDeniedException.class, () -> incidentService.getAllIncidents());
    }

    @Test
    void getIncidentById_nonAuthorNonOwnerNonAdmin_throwsAccessDenied() {
        authenticateAs(regularUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        assertThrows(AccessDeniedException.class, () -> incidentService.getIncidentById(1L));
    }

    @Test
    void getIncidentById_asAuthor_returnsIncident() {
        authenticateAs(regularUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        Incident result = incidentService.getIncidentById(1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getIncidentById_asOwnerOfRelatedItem_returnsIncident() {
        authenticateAs(ownerUser);
        Incident incident = makeIncident(1L, IncidentType.DAMAGED_ITEM, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        Incident result = incidentService.getIncidentById(1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void updateIncident_nonAuthorNonAdmin_throwsAccessDenied() {
        authenticateAs(ownerUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        Incident updateData = new Incident();
        updateData.setTitle("Updated");

        assertThrows(AccessDeniedException.class,
                () -> incidentService.updateIncident(1L, updateData));
    }

    @Test
    void deleteIncident_nonAuthorNonAdmin_throwsAccessDenied() {
        authenticateAs(ownerUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        assertThrows(AccessDeniedException.class,
                () -> incidentService.deleteIncident(1L));
    }

    @Test
    void resolveIncident_nonAuthorNonAdmin_throwsAccessDenied() {
        authenticateAs(ownerUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        assertThrows(AccessDeniedException.class,
                () -> incidentService.resolveIncident(1L));
    }

    @Test
    void addComment_nonParticipant_throwsAccessDenied() {
        User stranger = new User();
        stranger.setId(99L);
        stranger.setName("Stranger");
        stranger.setEmail("stranger@example.com");
        stranger.setRole(UserRole.USER);

        authenticateAs(stranger);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, regularUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        IncidentComment comment = new IncidentComment("Test", stranger, incident);

        assertThrows(AccessDeniedException.class,
                () -> incidentService.addComment(1L, comment));
    }

    // ═══════════════ createIncident resolution of references ═══════════════

    @Test
    void createIncident_userNotFound_throws() {
        authenticateAs(adminUser);
        User unknownUser = new User();
        unknownUser.setId(999L);

        Incident incident = new Incident();
        incident.setTitle("Test");
        incident.setDescription("Description");
        incident.setType(IncidentType.GENERAL);
        incident.setUser(unknownUser);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.createIncident(incident));
    }

    @Test
    void createIncident_relatedItemNotFound_throws() {
        authenticateAs(adminUser);
        Article unknownItem = new Article();
        unknownItem.setId(999L);

        Incident incident = new Incident();
        incident.setTitle("Damaged");
        incident.setDescription("Item broken");
        incident.setType(IncidentType.DAMAGED_ITEM);
        incident.setUser(adminUser);
        incident.setRelatedItem(unknownItem);
        incident.setRelatedKit(testKit);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.createIncident(incident));
    }

    @Test
    void createIncident_relatedKitNotFound_throws() {
        authenticateAs(adminUser);
        Kit unknownKit = new Kit();
        unknownKit.setId(999L);

        Incident incident = new Incident();
        incident.setTitle("Damaged");
        incident.setDescription("Item broken");
        incident.setType(IncidentType.DAMAGED_ITEM);
        incident.setUser(adminUser);
        incident.setRelatedItem(testItem);
        incident.setRelatedKit(unknownKit);

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(testItem));
        when(kitRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.createIncident(incident));
    }

    // ═══════════════ updateIncident partial updates ═══════════════

    @Test
    void updateIncident_onlyTitle_keepsOtherFields() {
        authenticateAs(adminUser);
        Incident existing = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident updateData = new Incident();
        updateData.setTitle("New Title");

        Incident result = incidentService.updateIncident(1L, updateData);
        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getDescription()).isEqualTo("Incident Description");
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.OPEN);
    }

    @Test
    void updateIncident_onlyStatus_keepsOtherFields() {
        authenticateAs(adminUser);
        Incident existing = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident updateData = new Incident();
        updateData.setStatus(IncidentStatus.IN_PROGRESS);

        Incident result = incidentService.updateIncident(1L, updateData);
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.IN_PROGRESS);
        assertThat(result.getTitle()).isEqualTo("Incident Title");
    }

    // ═══════════════ deleteIncident with comments cascade ═══════════════

    @Test
    void deleteIncident_openIncident_deletesCommentsFirst() {
        authenticateAs(adminUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        doNothing().when(incidentCommentRepository).deleteByIncidentId(1L);
        doNothing().when(incidentRepository).delete(incident);

        incidentService.deleteIncident(1L);

        verify(incidentCommentRepository).deleteByIncidentId(1L);
        verify(incidentRepository).delete(incident);
    }

    @Test
    void deleteIncident_inProgressIncident_succeeds() {
        authenticateAs(adminUser);
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.IN_PROGRESS, adminUser);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        doNothing().when(incidentCommentRepository).deleteByIncidentId(1L);
        doNothing().when(incidentRepository).delete(incident);

        incidentService.deleteIncident(1L);
        verify(incidentRepository).delete(incident);
    }
}
