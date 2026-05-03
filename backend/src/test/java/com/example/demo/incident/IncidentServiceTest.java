package com.example.demo.incident;

import com.example.demo.dto.IncidentCreateRequest;
import com.example.demo.model.Article;
import com.example.demo.model.Incident;
import com.example.demo.model.IncidentStatus;
import com.example.demo.model.IncidentType;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.model.Kit;
import com.example.demo.repository.IncidentCommentRepository;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentCommentRepository incidentCommentRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private IncidentService incidentService;

    private User testUser;
    private Article testItem;
    private Kit testKit;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.ADMIN);

        testItem = new Article();
        testItem.setId(1L);
        testItem.setTitle("Test Item");
        testItem.setOwner(testUser);

        testKit = new Kit();
        testKit.setId(1L);

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(authentication.getPrincipal()).thenReturn("test@example.com");
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    }

    private Incident makeIncident(Long id, IncidentType type, IncidentStatus status) {
        Incident i = new Incident();
        i.setId(id);
        i.setTitle("Incident Title");
        i.setDescription("Incident Description");
        i.setType(type);
        i.setStatus(status);
        i.setUser(testUser);
        if (type == IncidentType.DAMAGED_ITEM) {
            i.setRelatedItem(testItem);
            i.setRelatedKit(testKit);
        }
        return i;
    }

    private IncidentCreateRequest makeRequest(IncidentType type, Long userId, Long itemId, Long kitId) {
        IncidentCreateRequest request = new IncidentCreateRequest();
        request.setTitle("Incident Title");
        request.setDescription("Incident Description");
        request.setType(type);
        request.setUserId(userId);
        request.setRelatedItemId(itemId);
        request.setRelatedKitId(kitId);
        return request;
    }

    @Test
    void getAllIncidents_returnsAllIncidents() {
        List<Incident> incidents = List.of(
            makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN),
            makeIncident(2L, IncidentType.DAMAGED_ITEM, IncidentStatus.IN_PROGRESS)
        );
        when(incidentRepository.findAll()).thenReturn(incidents);

        List<Incident> result = incidentService.getAllIncidents();

        assertThat(result).hasSize(2);
        verify(incidentRepository).findAll();
    }

    @Test
    void getIncidentById_found() {
        Incident incident = makeIncident(1L, IncidentType.GENERAL, IncidentStatus.OPEN);
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        Incident result = incidentService.getIncidentById(1L);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getIncidentById_notFound_throws() {
        when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> incidentService.getIncidentById(99L));
        assertThat(ex.getMessage()).contains("Incidencia no encontrada");
    }

    @Test
    void createIncident_successful() {
        IncidentCreateRequest request = makeRequest(IncidentType.DAMAGED_ITEM, 1L, 1L, 1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(testKit));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> {
            Incident saved = i.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Incident result = incidentService.createIncident(request);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Incident Title");
        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    void updateIncident_successful() {
        Incident existing = makeIncident(2L, IncidentType.GENERAL, IncidentStatus.OPEN);
        when(incidentRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident updateData = new Incident();
        updateData.setTitle("Updated Title");
        updateData.setDescription("Updated Description");
        updateData.setStatus(IncidentStatus.RESOLVED);

        Incident result = incidentService.updateIncident(2L, updateData);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
        verify(incidentRepository).save(existing);
    }

    @Test
    void deleteIncident_successful() {
        Incident incident = makeIncident(3L, IncidentType.GENERAL, IncidentStatus.OPEN);
        when(incidentRepository.findById(3L)).thenReturn(Optional.of(incident));

        doNothing().when(incidentCommentRepository).deleteByIncidentId(3L);
        doNothing().when(incidentRepository).delete(incident);

        incidentService.deleteIncident(3L);

        verify(incidentCommentRepository).deleteByIncidentId(3L);
        verify(incidentRepository).delete(incident);
    }
}