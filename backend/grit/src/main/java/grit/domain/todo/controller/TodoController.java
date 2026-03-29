package grit.domain.todo.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.TodoResponseDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.service.TodoService;
import grit.global.security.MemberSelfAssert;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Todo", description = "투두 관련 API")
@RestController
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;

    @Operation(summary = "내 투두 목록", description = "로그인한 사용자 본인의 투두만 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "다른 사용자 ID로 조회 시도", content = @Content)
    })
    @GetMapping("/api/users/{userId}/todos")
    public ResponseEntity<List<TodoResponseDTO>> findByUserId(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK), 반드시 로그인 사용자와 동일", example = "1") @PathVariable Long userId) {
        MemberSelfAssert.assertSameMember(principal, userId);
        List<Todo> todos = todoService.findByUserId(userId);
        List<TodoResponseDTO> responses = todos.stream()
                .map(TodoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "그룹 투두 목록 (조회 전용)", description = "해당 그룹 멤버가 작성한 투두 전체를 반환하며, query userId(그룹 멤버 PK)에 해당하는 작성자의 투두가 목록 최상단에 오도록 정렬합니다. userId는 필수. 요청자는 그룹 멤버여야 합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "userId가 그룹 멤버가 아님", content = @Content),
            @ApiResponse(responseCode = "403", description = "그룹 멤버가 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "그룹 코드 오류", content = @Content)
    })
    @GetMapping("/api/groups/{groupCode}/todos")
    public ResponseEntity<List<TodoResponseDTO>> findForGroup(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "그룹 코드", example = "ABCD12") @PathVariable String groupCode,
            @Parameter(description = "맨 위에 둘 작성자 회원 PK (반드시 그 그룹 멤버)", example = "1", required = true) @RequestParam Long userId) {
        List<Todo> todos = todoService.findForGroup(groupCode, principal.id(), userId);
        List<TodoResponseDTO> responses = todos.stream()
                .map(TodoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "투두 생성", description = "본인 계정으로만 생성 가능합니다. 내용·마감일 필수, 카테고리 선택. 그룹 투두 목록은 멤버십 기준으로 조회되며 투두에 그룹 필드를 두지 않습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "투두 생성 성공"),
            @ApiResponse(responseCode = "400", description = "입력 검증 실패", content = @Content),
            @ApiResponse(responseCode = "403", description = "본인이 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "사용자·카테고리 없음", content = @Content)
    })
    @PostMapping("/api/users/{userId}/todos")
    public ResponseEntity<TodoResponseDTO> create(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId,
            @Valid @RequestBody CreateTodoRequestDTO request) {
        MemberSelfAssert.assertSameMember(principal, userId);
        Todo todo = todoService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 수정", description = "로그인한 사용자 본인의 투두만 수정 가능합니다. 사용자 ID는 JWT에서만 사용합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "투두 수정 성공"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 수정할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @PutMapping("/api/todos/{todoId}")
    public ResponseEntity<TodoResponseDTO> update(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId,
            @RequestBody UpdateTodoRequestDTO request) {
        Todo todo = todoService.update(todoId, principal.id(), request);
        return ResponseEntity.ok(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 삭제", description = "로그인한 사용자 본인의 투두만 삭제 가능합니다. 사용자 ID는 JWT에서만 사용합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "투두 삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 삭제할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/api/todos/{todoId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId) {
        todoService.delete(todoId, principal.id());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "지난 7일간 일별 달성도 (본인만)", description = "오늘을 제외한 지난 7일간의 일별 투두 달성도입니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "다른 사용자 ID", content = @Content)
    })
    @GetMapping("/api/users/{userId}/todos/achievement/last-7-days")
    public ResponseEntity<List<DailyAchievementDTO>> getLast7DaysAchievement(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId) {
        MemberSelfAssert.assertSameMember(principal, userId);
        List<DailyAchievementDTO> achievements = todoService.getLast7DaysAchievement(userId);
        return ResponseEntity.ok(achievements);
    }
}
