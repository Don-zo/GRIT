package grit.friend;

import grit.friend.dto.FriendResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Friend", description = "친구 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friends")
public class FriendController {
    private final FriendService friendService;

    @Operation(summary = "친구 추가", description = "특정 사용자를 친구로 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "친구 추가 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 자기 자신을 친구로 추가)", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 닉네임을 가진 사용자가 없음", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 친구로 등록된 사용자", content = @Content)
    })
    @PostMapping("/{nickname}")
    public ResponseEntity<FriendResponseDTO> addFriend(@Parameter(description = "친구의 닉네임", example = "그릿유저친구") @PathVariable String nickname) {
        Long currentUserId = 1L; // 임시 ID

        FriendResponseDTO addedFriend = friendService.addFriend(currentUserId, nickname);

        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(addedFriend);
    }

    // 친구 제거
    @Operation(summary = "친구 제거", description = "특정 사용자를 친구 목록에서 제거합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "친구 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 친구 관계가 아님, 자기 자신 삭제 시도)", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 닉네임의 친구가 존재하지 않음", content = @Content)
    })
    @DeleteMapping("/{nickname}")
    public ResponseEntity<FriendResponseDTO> removeFriend(@Parameter(description = "친구의 닉네임", example = "그릿유저친구") @PathVariable String nickname) {
        Long currentUserId = 1L; // 임시 ID

        FriendResponseDTO removedFriend = friendService.removeFriend(currentUserId, nickname);

        return ResponseEntity.ok(removedFriend);
    }

    // 친구 목록 조회
    @Operation(summary = "친구 목록 조회", description = "특정 사용자의 친구 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<List<FriendResponseDTO>> findFriends(@Parameter(description = "친구 목록을 조회할 사용자의 ID (PK)", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(friendService.getFriendList(id));
    }
}
