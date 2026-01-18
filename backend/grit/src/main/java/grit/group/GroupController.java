package grit.group;

import grit.group.dto.CreateGroupRequestDTO;
import grit.group.dto.GroupResponseDTO;
import grit.group.dto.UpdateGroupRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Group", description = "그룹 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups")
public class GroupController {
    private final GroupService groupService;

    @Operation(summary = "그룹 생성", description = "새로운 그룹을 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "그룹 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 입력값", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 (생성자 ID 오류)", content = @Content)
    })
    @PostMapping
    public ResponseEntity<GroupResponseDTO> createGroup(
            @Parameter(description = "그룹을 생성하는 사용자의 ID", example = "1")
            @RequestParam Long userId, // 테스트용 Id
            @RequestBody CreateGroupRequestDTO request) {

        GroupResponseDTO response = groupService.createGroup(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "그룹 가입", description = "기존에 생성된 그룹에 참여합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "가입 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 그룹 또는 사용자", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 가입된 그룹", content = @Content)
    })
    @PostMapping("/{groupId}/join")
    public ResponseEntity<GroupResponseDTO> joinGroup(
            @Parameter(description = "가입할 그룹 ID", example = "10")
            @PathVariable Long groupId,
            @Parameter(description = "가입 신청하는 사용자의 ID", example = "1")
            @RequestParam Long userId) {

        groupService.joinGroup(userId, groupId);

        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "그룹 상세 조회", description = "특정 그룹의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 그룹 ID", content = @Content)
    })
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDTO> getGroup(
            @Parameter(description = "조회할 그룹 ID", example = "10")
            @PathVariable Long groupId) {

        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 그룹 목록 조회", description = "내가 속한 모든 그룹 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/my")
    public ResponseEntity<List<GroupResponseDTO>> getMyGroups(
            @Parameter(description = "조회할 사용자의 ID", example = "1")
            @RequestParam Long userId) {

        List<GroupResponseDTO> response = groupService.getMyGroups(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "그룹 정보 수정", description = "그룹의 정보(이름, 이미지 경로)를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "수정 권한 없음", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 그룹 ID", content = @Content)
    })
    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponseDTO> updateGroup(
            @Parameter(description = "수정할 그룹 ID", example = "10")
            @PathVariable Long groupId,
            @Parameter(description = "요청하는 사용자의 ID", example = "1")
            @RequestParam Long userId,
            @RequestBody UpdateGroupRequestDTO updateRequest) {

        groupService.updateGroup(userId, groupId, updateRequest);

        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "그룹 나가기 (삭제)", description = "그룹을 탈퇴합니다. 해당 그룹 멤버의 인원이 0명이 되면 그룹이 자동 삭제됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "탈퇴/삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 그룹 또는 사용자", content = @Content)
    })
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long groupId,
            @RequestParam Long userId) {

        groupService.deleteGroup(userId, groupId);
        return ResponseEntity.noContent().build();
    }
}