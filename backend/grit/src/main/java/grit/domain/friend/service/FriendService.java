package grit.domain.friend.service;

import grit.domain.member.dto.MemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.global.exception.EntityAlreadyExistsException;
import grit.global.exception.EntityNotFoundException;
import grit.global.exception.SelfReferenceException;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
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
    private final S3Service s3Service;

    @Transactional
    public MemberResponseDto addFriend(Member member, String friendNickname) {
        Member friend = memberService.findMemberByNickname(friendNickname);

        if (member.equals(friend)) {
            throw new SelfReferenceException("자기 자신은 친구로 추가할 수 없습니다.");
        }
        if (member.getFriends().contains(friend)) {
            throw new EntityAlreadyExistsException("이미 친구 추가된 사용자입니다.");
        }

        member.addFriend(friend);
        friend.addFriend(member);
        return toFriendDto(friend);
    }

    @Transactional
    public MemberResponseDto removeFriend(Member member, String friendNickname) {
        Member friend = memberService.findMemberByNickname(friendNickname);

        if (member.equals(friend)) {
            throw new SelfReferenceException("자기 자신을 친구 목록에서 삭제할 수 없습니다.");
        }
        if (!member.getFriends().contains(friend)) {
            throw new EntityNotFoundException("해당 사용자는 친구 목록에 존재하지 않습니다.");
        }

        member.removeFriend(friend);
        friend.removeFriend(member);
        return toFriendDto(friend);
    }

    public List<MemberResponseDto> getFriendList(Member member) {
        return member.getFriends().stream()
                .map(this::toFriendDto)
                .sorted(Comparator.comparing(MemberResponseDto::nickname))
                .toList();
    }

    private MemberResponseDto toFriendDto(Member member) {
        String imageUrl = s3Service.resolveUrl(S3Directory.PROFILE_IMAGES, member.getImageName());
        return MemberResponseDto.fromForFriend(member, imageUrl);
    }
}
