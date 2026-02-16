package grit.domain.friend.service;

import grit.domain.member.entity.Member;
import grit.domain.friend.dto.FriendResponseDto;
import grit.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {
    private final MemberRepository memberRepository;

    // 친구 추가
    @Transactional
    public FriendResponseDto addFriend(Long userId, String friendNickname) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Member friend = memberRepository.findByNickname(friendNickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임의 사용자가 없습니다."));

        if (member.getId().equals(friend.getId())) {
            throw new IllegalArgumentException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        if (member.getFriends().contains(friend)) {
            throw new IllegalArgumentException("이미 친구 추가된 사용자입니다.");
        }

        member.addFriend(friend);

        return FriendResponseDto.from(friend);
    }

    // 친구 제거
    @Transactional
    public FriendResponseDto removeFriend(Long userId, String friendNickname) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Member friend = memberRepository.findByNickname(friendNickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임의 사용자가 없습니다."));

        if (member.getId().equals(friend.getId())) {
            throw new IllegalArgumentException("자기 자신을 친구 목록에서 삭제할 수 없습니다.");
        }
        if (!member.getFriends().contains(friend)) {
            throw new IllegalArgumentException("해당 사용자는 친구 목록에 존재하지 않습니다.");
        }

        member.removeFriend(friend);

        return FriendResponseDto.from(friend);
    }

    // 친구 목록 조회
    public List<FriendResponseDto> getFriendList(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return member.getFriends().stream()
                .map(FriendResponseDto::from)
                .sorted(Comparator.comparing(FriendResponseDto::getNickname))
                .toList();
    }
}
