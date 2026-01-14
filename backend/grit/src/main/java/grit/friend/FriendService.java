package grit.friend;

import grit.friend.dto.FriendResponseDTO;
import grit.user.User;
import grit.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {
    private final UserRepository userRepository;

    // 친구 추가
    @Transactional
    public FriendResponseDTO addFriend(Long userId, String friendNickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        User friend = userRepository.findByNickname(friendNickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임의 사용자가 없습니다."));

        if (user.getId().equals(friend.getId())) {
            throw new IllegalArgumentException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        if (user.getFriends().contains(friend)) {
            throw new IllegalArgumentException("이미 친구 추가된 사용자입니다.");
        }

        user.addFriend(friend);

        return FriendResponseDTO.from(friend);
    }

    // 친구 제거
    @Transactional
    public FriendResponseDTO removeFriend(Long userId, String friendNickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        User friend = userRepository.findByNickname(friendNickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임의 사용자가 없습니다."));

        if (user.getId().equals(friend.getId())) {
            throw new IllegalArgumentException("자기 자신을 친구 목록에서 삭제할 수 없습니다.");
        }
        if (!user.getFriends().contains(friend)) {
            throw new IllegalArgumentException("해당 사용자는 친구 목록에 존재하지 않습니다.");
        }

        user.removeFriend(friend);

        return FriendResponseDTO.from(friend);
    }

    // 친구 목록 조회
    public List<FriendResponseDTO> getFriendList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return user.getFriends().stream()
                .map(FriendResponseDTO::from)
                .sorted(Comparator.comparing(FriendResponseDTO::getNickname))
                .toList();
    }
}
