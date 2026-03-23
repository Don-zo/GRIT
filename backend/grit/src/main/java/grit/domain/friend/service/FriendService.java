package grit.domain.friend.service;

import grit.domain.friend.dto.FriendResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.global.exception.EntityAlreadyExistsException;
import grit.global.exception.EntityNotFoundException;
import grit.global.exception.SelfReferenceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final MemberService memberService;

    @Transactional
    public FriendResponseDto addFriend(Member member, String friendNickname) {
        Member friend = memberService.findMemberByNickname(friendNickname);

        if (member.equals(friend)) {
            throw new SelfReferenceException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        if (member.getFriends().contains(friend)) {
            throw new EntityAlreadyExistsException("이미 친구 추가된 사용자입니다.");
        }

        member.addFriend(friend);
        friend.addFriend(member);
        return FriendResponseDto.from(friend);
    }

    @Transactional
    public FriendResponseDto removeFriend(Member member, String friendNickname) {
        Member friend = memberService.findMemberByNickname(friendNickname);

        if (member.equals(friend)) {
            throw new SelfReferenceException("자기 자신을 친구 목록에서 삭제할 수 없습니다.");
        }
        if (!member.getFriends().contains(friend)) {
            throw new EntityNotFoundException("해당 사용자는 친구 목록에 존재하지 않습니다.");
        }

        member.removeFriend(friend);
        friend.removeFriend(member);
        return FriendResponseDto.from(friend);
    }

    public List<FriendResponseDto> getFriendList(Member member) {
        return member.getFriends().stream()
                .map(FriendResponseDto::from)
                .sorted(Comparator.comparing(FriendResponseDto::getNickname))
                .toList();
    }
}
