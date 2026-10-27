package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ClientRegistrationRequest;
import com.example.bookmystars.dto.ClientResponseDto;
import com.example.bookmystars.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Client Management", description = "Registration, verification, and admin desk for commercial brand clients")
public class ClientController {

    private final ClientService clientService;

    @PostMapping({"/clients/register", "/auth/clients/register", "/auth/client/register"})
    @Operation(summary = "Register a new commercial brand client (Jewelry, Hardware, Fashion, etc.)")
    public ResponseEntity<ClientResponseDto> registerClient(
            @Valid @RequestBody ClientRegistrationRequest request) {
        ClientResponseDto response = clientService.registerClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/admin/clients")
    @Operation(summary = "Super Admin: Get all registered client brands with optional status filter")
    public ResponseEntity<List<ClientResponseDto>> getAdminClients(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        List<ClientResponseDto> clients = clientService.getClients(status);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/admin/clients/pending-count")
    @Operation(summary = "Super Admin: Get count of client brands awaiting verification")
    public ResponseEntity<Map<String, Long>> getPendingClientsCount() {
        long count = clientService.getPendingClientsCount();
        return ResponseEntity.ok(Map.of("pendingCount", count));
    }

    @PostMapping("/admin/clients/{id}/verify")
    @Operation(summary = "Super Admin: Approve client brand profile")
    public ResponseEntity<ClientResponseDto> verifyClient(@PathVariable Long id) {
        ClientResponseDto response = clientService.verifyClient(id, true, null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/clients/{id}/reject")
    @Operation(summary = "Super Admin: Reject client brand profile with reason")
    public ResponseEntity<ClientResponseDto> rejectClient(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        ClientResponseDto response = clientService.verifyClient(id, false, reason);
        return ResponseEntity.ok(response);
    }
}
