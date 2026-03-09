package grit.domain.todo;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.TodoResponseDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Tag(name = "Todo", description = "투두 관련 API")
@RestController
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;

    @Operation(summary = "사용자별 투두 목록 조회", description = "특정 사용자의 모든 투두 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content)
    })
    @GetMapping("/api/users/{userId}/todos")
    public ResponseEntity<List<TodoResponseDTO>> findByUserId(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId) {
        validateUserId(memberPrincipal, userId);
        List<Todo> todos = todoService.findByUserId(userId);
        List<TodoResponseDTO> responses = todos.stream()
                .map(TodoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "그룹별 투두 목록 조회", description = "특정 그룹의 투두 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "해당 그룹의 멤버가 아님", content = @Content)
    })
    @GetMapping("/api/groups/{groupId}/todos")
    public ResponseEntity<List<TodoResponseDTO>> findAll(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "그룹 ID (PK)", example = "1") @PathVariable Long groupId,
            @Parameter(description = "작성자 ID (PK, 선택사항)", example = "1") @RequestParam(required = false) Long ownerId) {
        List<Todo> todos = todoService.findAll(groupId, memberPrincipal.id(), ownerId);
        List<TodoResponseDTO> responses = todos.stream()
                .map(TodoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "투두 생성", description = "새로운 투두를 생성합니다. 그룹 ID는 선택사항입니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "투두 생성 성공"),
            @ApiResponse(responseCode = "403", description = "해당 그룹의 멤버가 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "사용자 또는 그룹을 찾을 수 없음", content = @Content)
    })
    @PostMapping("/api/users/{userId}/todos")
    public ResponseEntity<TodoResponseDTO> create(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId,
            @RequestBody CreateTodoRequestDTO request) {
        validateUserId(memberPrincipal, userId);
        Todo todo = todoService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 수정", description = "투두 정보를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "투두 수정 성공"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 수정할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @PutMapping("/api/todos/{todoId}")
    public ResponseEntity<TodoResponseDTO> update(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId,
            @RequestBody UpdateTodoRequestDTO request) {
        Todo todo = todoService.update(todoId, memberPrincipal.id(), request);
        return ResponseEntity.ok(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 삭제", description = "투두를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "투두 삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 삭제할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/api/todos/{todoId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId) {
        todoService.delete(todoId, memberPrincipal.id());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "지난 7일간 일별 달성도 조회", description = "오늘을 제외한 지난 7일간의 일별 투두 달성도를 조회합니다. 로그인한 사용자 본인의 데이터만 조회 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/api/me/todos/achievement/last-7-days")
    public ResponseEntity<List<DailyAchievementDTO>> getLast7DaysAchievement(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
        List<DailyAchievementDTO> achievements = todoService.getLast7DaysAchievement(memberPrincipal.id());
        return ResponseEntity.ok(achievements);
    }

    private void validateUserId(MemberPrincipal memberPrincipal, Long userId) {
        if (!memberPrincipal.id().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 리소스에 대한 접근 권한이 없습니다.");
        }
    }
}

