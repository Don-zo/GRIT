package grit.domain.todo.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.todo.dto.CreateTodoCategoryRequestDto;
import grit.domain.todo.dto.ReorderTodoCategoriesRequestDto;
import grit.domain.todo.dto.TodoCategoryResponseDto;
import grit.domain.todo.service.TodoCategoryService;
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

@Tag(name = "TodoCategory", description = "투두 카테고리 (등록·삭제)")
@RestController
@RequiredArgsConstructor
public class TodoCategoryController {
    private final TodoCategoryService todoCategoryService;

    @Operation(summary = "내 투두 카테고리 목록", description = "사용자가 등록한 투두 카테고리를 표시 순서(sortOrder)대로 조회합니다.")
    @GetMapping("/api/users/{userId}/todo-categories")
    public ResponseEntity<List<TodoCategoryResponseDto>> list(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId) {
        MemberSelfAssert.assertSameMember(principal, userId);
        return ResponseEntity.ok(todoCategoryService.findByUserId(userId));
    }

    @Operation(summary = "투두 카테고리 등록", description = "이름은 같은 사용자 내에서 중복될 수 없습니다. 수정 API는 없습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "등록 성공"),
            @ApiResponse(responseCode = "404", description = "사용자 없음", content = @Content),
            @ApiResponse(responseCode = "409", description = "이름 중복", content = @Content)
    })
    @PostMapping("/api/users/{userId}/todo-categories")
    public ResponseEntity<TodoCategoryResponseDto> create(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId,
            @Valid @RequestBody CreateTodoCategoryRequestDto request) {
        MemberSelfAssert.assertSameMember(principal, userId);
        TodoCategoryResponseDto created = todoCategoryService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "투두 카테고리 순서 변경", description = "본인 카테고리 ID를 원하는 표시 순서대로 모두 나열합니다. 누락·추가 ID가 있으면 400입니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "순서 저장 성공"),
            @ApiResponse(responseCode = "400", description = "ID 목록 불일치·중복", content = @Content),
            @ApiResponse(responseCode = "403", description = "본인이 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "사용자 없음", content = @Content)
    })
    @PatchMapping("/api/users/{userId}/todo-categories/reorder")
    public ResponseEntity<List<TodoCategoryResponseDto>> reorder(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId,
            @Valid @RequestBody ReorderTodoCategoriesRequestDto request) {
        MemberSelfAssert.assertSameMember(principal, userId);
        List<TodoCategoryResponseDto> updated = todoCategoryService.reorder(userId, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "투두 카테고리 삭제", description = "해당 카테고리를 쓰는 투두는 카테고리만 해제됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "카테고리 없음", content = @Content)
    })
    @DeleteMapping("/api/users/{userId}/todo-categories/{categoryId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Parameter(description = "사용자 ID (PK)", example = "1") @PathVariable Long userId,
            @Parameter(description = "카테고리 ID", example = "1") @PathVariable Long categoryId) {
        MemberSelfAssert.assertSameMember(principal, userId);
        todoCategoryService.delete(userId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
