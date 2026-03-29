package grit.domain.todo.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.todo.dto.TodoCategoryRequestDTO;
import grit.domain.todo.dto.TodoCategoryResponseDTO;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.service.TodoCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "TodoCategory", description = "투두 카테고리 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/me/todo-categories")
public class TodoCategoryController {

    private final TodoCategoryService todoCategoryService;

    @Operation(summary = "내 카테고리 목록 조회", description = "로그인한 사용자의 카테고리 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<TodoCategoryResponseDTO>> findAll(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
        List<TodoCategory> categories = todoCategoryService.findAllByOwnerId(memberPrincipal.id());
        List<TodoCategoryResponseDTO> responses = categories.stream()
                .map(TodoCategoryResponseDTO::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 입력값", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 카테고리 이름", content = @Content)
    })
    @PostMapping
    public ResponseEntity<TodoCategoryResponseDTO> create(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @RequestBody TodoCategoryRequestDTO request) {
        TodoCategory category = todoCategoryService.create(memberPrincipal.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TodoCategoryResponseDTO.from(category));
    }

    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "본인의 카테고리만 삭제 가능", content = @Content),
            @ApiResponse(responseCode = "404", description = "카테고리를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable Long categoryId) {
        todoCategoryService.delete(categoryId, memberPrincipal.id());
        return ResponseEntity.noContent().build();
    }
}
