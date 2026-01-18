package grit.group;

import grit.group.dto.CreateGroupRequestDTO;
import grit.group.dto.GroupResponseDTO;
import grit.group.dto.UpdateGroupRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups")
public class GroupController {
    private final GroupService groupService;

    /**
     * 1. 그룹 생성
     * [POST] /api/groups?userId=1
     */
    @PostMapping
    public ResponseEntity<GroupResponseDTO> createGroup(
            @RequestParam Long userId, // 테스트용 Id
            @RequestBody CreateGroupRequestDTO request) {

        GroupResponseDTO response = groupService.createGroup(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. 그룹 가입하기
    // [POST] /api/groups/{groupId}/join?userId=1
    @PostMapping("/{groupId}/join")
    public ResponseEntity<GroupResponseDTO> joinGroup(
            @PathVariable Long groupId,
            @RequestParam Long userId) {

        groupService.joinGroup(userId, groupId);

        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    // 그룹 상세 조회
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDTO> getGroup(@PathVariable Long groupId) {
        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 그룹 목록 조회
     * [GET] /api/groups/my?userId=1
     */
    @GetMapping("/my")
    public ResponseEntity<List<GroupResponseDTO>> getMyGroups(@RequestParam Long userId) {
        List<GroupResponseDTO> response = groupService.getMyGroups(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 그룹 정보 수정
     * [PUT] /api/groups/{groupId}?userId=1
     */
    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponseDTO> updateGroup(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            @RequestBody UpdateGroupRequestDTO updateRequest) {

        groupService.updateGroup(userId, groupId, updateRequest);

        GroupResponseDTO response = groupService.getGroup(groupId);
        return ResponseEntity.ok(response);
    }

    /**
     * 그룹 나가기 (삭제)
     * [DELETE] /api/groups/{groupId}?userId=1
     */
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long groupId,
            @RequestParam Long userId) {

        groupService.deleteGroup(userId, groupId);
        return ResponseEntity.noContent().build();
    }
}