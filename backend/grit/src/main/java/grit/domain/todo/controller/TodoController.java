package grit.domain.todo.controller;
import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.AchievementOverviewResponseDTO;
import grit.domain.todo.dto.MoveTodoDueDateRequestDTO;
import grit.domain.todo.dto.SetTodoDoneRequestDTO;
import grit.domain.todo.dto.TodoResponseDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import grit.domain.todo.dto.TodoRangeResponseDTO;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Tag(name = "Todo", description = "투두 관련 API")
@RestController
@RequiredArgsConstructor
@Validated
public class TodoController {
    private final TodoService todoService;
    private final Clock clock;

    @Operation(
            summary = "내 투두 목록 (기간 조회)",
            description = """
                    로그인한 사용자 본인의 투두를 dueDate 기준으로 조회합니다. 조회 구간 내 투두를 한 번에 모두 반환합니다.
                    조회 구간: [startDate, startDate + (dayCount - 1)일] (양끝 포함).
                    startDate·dayCount 미입력 시 이번 주 월요일부터 7일간 조회합니다.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "dayCount 범위 오류 등", content = @Content),
    })
    @GetMapping("/api/members/me/todos")
    public ResponseEntity<TodoRangeResponseDTO> findByUserId(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "조회 구간 첫 날(포함)", example = "2026-05-15")
            @RequestParam(required = false) LocalDate startDate,
            @Parameter(description = "조회 일수(1~7). startDate와 함께 사용", example = "5")
            @RequestParam(required = false)
            @Min(value = 1, message = "dayCount는 1 이상이어야 합니다.")
            @Max(value = 7, message = "dayCount는 7 이하여야 합니다.")
            Integer dayCount) {
        LocalDate resolvedStartDate = startDate != null
                ? startDate
                : LocalDate.now(clock).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        int resolvedDayCount = dayCount != null ? dayCount : 7;

        TodoRangeResponseDTO response = todoService.findByUserIdInRange(
                principal.id(), resolvedStartDate, resolvedDayCount);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "그룹 투두 목록 (조회 전용)", description = "해당 그룹 멤버가 작성한 투두 전체를 반환합니다. query userId(그룹 멤버 PK) 작성자의 투두가 먼저 오고, 이후 미완료→카테고리 순서→내용(가나다)→id 순으로 정렬됩니다. 완료된 항목은 같은 그룹 내에서 아래쪽에 둡니다. userId는 필수. 요청자는 그룹 멤버여야 합니다.")
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
            @ApiResponse(responseCode = "404", description = "사용자·카테고리 없음", content = @Content)
    })
    @PostMapping("/api/members/me/todos")
    public ResponseEntity<TodoResponseDTO> create(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody CreateTodoRequestDTO request) {
        Todo todo = todoService.create(principal.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 수정", description = "로그인한 사용자 본인의 투두만 수정 가능합니다. 사용자 ID는 JWT에서만 사용합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "투두 수정 성공"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 수정할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @PutMapping("/api/members/me/todos/{todoId}")
    public ResponseEntity<TodoResponseDTO> update(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId,
            @RequestBody UpdateTodoRequestDTO request) {
        Todo todo = todoService.update(todoId, principal.id(), request);
        return ResponseEntity.ok(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 마감일만 변경", description = "드래그앤드롭 등으로 날짜만 옮길 때 사용합니다. 내용·완료·카테고리는 변경하지 않습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "400", description = "입력 검증 실패", content = @Content),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 수정할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/api/members/me/todos/{todoId}/due-date")
    public ResponseEntity<TodoResponseDTO> moveDueDate(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId,
            @Valid @RequestBody MoveTodoDueDateRequestDTO request) {
        Todo todo = todoService.moveDueDate(todoId, principal.id(), request);
        return ResponseEntity.ok(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 완료 체크/해제", description = "완료 여부만 변경합니다. 다른 필드는 건드리지 않습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "400", description = "입력 검증 실패", content = @Content),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 수정할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/api/members/me/todos/{todoId}/done")
    public ResponseEntity<TodoResponseDTO> setDone(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId,
            @Valid @RequestBody SetTodoDoneRequestDTO request) {
        Todo todo = todoService.setDone(todoId, principal.id(), request);
        return ResponseEntity.ok(TodoResponseDTO.from(todo));
    }

    @Operation(summary = "투두 삭제", description = "로그인한 사용자 본인의 투두만 삭제 가능합니다. 사용자 ID는 JWT에서만 사용합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "투두 삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "403", description = "본인의 투두만 삭제할 수 있음", content = @Content),
            @ApiResponse(responseCode = "404", description = "투두를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/api/members/me/todos/{todoId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "투두 ID (PK)", example = "1") @PathVariable Long todoId) {
        todoService.delete(todoId, principal.id());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "최근 달성도 조회 (본인만)", description = "오늘을 제외한 지난 7일간 일별 달성도와 오늘 달성도를 함께 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
    })
    @GetMapping("/api/members/me/todos/achievement")
    public ResponseEntity<AchievementOverviewResponseDTO> getLast7DaysAchievement(
            @AuthenticationPrincipal MemberPrincipal principal) {
        AchievementOverviewResponseDTO achievements = todoService.getLast7DaysAchievement(principal.id());
        return ResponseEntity.ok(achievements);
    }
}