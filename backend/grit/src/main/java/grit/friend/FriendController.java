package grit.friend;

import grit.friend.dto.FriendResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friends")
public class FriendController {
    private final FriendService friendService;

    // 친구 추가
    @PostMapping("/{nickname}")
    public ResponseEntity<FriendResponseDTO> addFriend(@PathVariable String nickname) {
        Long currentUserId = 1L; // 임시 ID

        FriendResponseDTO addedFriend = friendService.addFriend(currentUserId, nickname);

        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(addedFriend);
    }

    // 친구 제거
    @DeleteMapping("/{nickname}")
    public ResponseEntity<FriendResponseDTO> removeFriend(@PathVariable String nickname) {
        Long currentUserId = 1L; // 임시 ID

        FriendResponseDTO removedFriend = friendService.removeFriend(currentUserId, nickname);

        return ResponseEntity.ok(removedFriend);
    }

    // 친구 목록 조회
    @GetMapping("/{id}")
    public ResponseEntity<List<FriendResponseDTO>> findFriends(@PathVariable Long id) {
        return ResponseEntity.ok(friendService.getFriendList(id));
    }
}
