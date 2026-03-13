package grit.domain.group;

import grit.domain.member.entity.Member;
import grit.global.util.InviteCodeGenerator;
import grit.domain.group.dto.GroupCreateRequestDto;
import grit.domain.group.dto.GroupInfoResponseDto;
import grit.domain.group.dto.GroupUpdateRequestDto;
import grit.domain.group.entity.Group;
import grit.domain.group.entity.MemberGroup;
import grit.domain.group.repository.GroupRepository;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.repository.MemberRepository;
import grit.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final MemberGroupRepository memberGroupRepository;
    private final MemberRepository memberRepository;
    private final S3Service s3Service;

    // 그룹 생성
    @Transactional
    public GroupInfoResponseDto createGroup(Long userId, GroupCreateRequestDto groupRequest) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (groupRequest.getImageName() != null && !s3Service.isObjectExists("group-images", groupRequest.getImageName().toString())) {
            throw new IllegalArgumentException("유효하지 않은 그룹 이미지입니다.");
        }

        String inviteCode = generateInviteCode();

        Group group = Group.builder()
                .name(groupRequest.getName())
                .imageName(groupRequest.getImageName())
                .inviteCode(inviteCode)
                .build();

        group.increaseMemberCount();
        Group savedGroup = groupRepository.save(group);

        MemberGroup memberGroup = MemberGroup.builder()
                .member(member)
                .group(savedGroup)
                .build();
        memberGroupRepository.save(memberGroup);

        return new GroupInfoResponseDto(savedGroup, getRawImageUrl(savedGroup));
    }

    private String generateInviteCode() {
        String code;
        int retryCount = 0;
        do {
            code = InviteCodeGenerator.generate();
            retryCount++;
            if (retryCount > 10) {
                throw new IllegalStateException("초대 코드 생성을 10회 이상 시도하였으나 실패하였습니다.");
            }
        } while (groupRepository.existsByInviteCode(code));
        return code;
    }

    // 그룹 가입
    @Transactional
    public GroupInfoResponseDto joinGroup(Long userId, String inviteCode) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        boolean isAlreadyMember = memberGroupRepository.existsByMemberIdAndGroupId(userId,
                group.getId());
        if (isAlreadyMember) {
            throw new IllegalStateException("이미 가입된 그룹입니다.");
        }

        MemberGroup memberGroup = MemberGroup.builder()
                .member(member)
                .group(group)
                .build();

        memberGroupRepository.save(memberGroup);
        group.increaseMemberCount();

        return new GroupInfoResponseDto(group, getRawImageUrl(group));
    }

    // 그룹 나가기(삭제)
    @Transactional
    public void deleteGroup(Long userId, Long groupId) {
        MemberGroup memberGroup = memberGroupRepository.findByMemberIdAndGroupId(userId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("참여 중인 그룹이 아닙니다."));

        Group group = memberGroup.getGroup();

        memberGroupRepository.delete(memberGroup);

        group.decreaseMemberCount();

        if (group.getMemberCount() <= 0) {
            groupRepository.delete(group);
            System.out.println("그룹 내의 인원이 0명이 되어 그룹이 자동 삭제되었습니다." + groupId);
        }
    }

    // 그룹 정보 수정
    @Transactional
    public void updateGroup(Long userId, Long groupId, GroupUpdateRequestDto updateRequest) {
        boolean isMember = memberGroupRepository.existsByMemberIdAndGroupId(userId, groupId);
        if (!isMember) {
            throw new IllegalArgumentException("그룹 멤버만 수정할 수 있습니다.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        if (updateRequest.getImageName() != null && !s3Service.isObjectExists("group-images", updateRequest.getImageName().toString())) {
            throw new IllegalArgumentException("유효하지 않은 그룹 이미지입니다.");
        }

        group.updateInfo(updateRequest.getName(), updateRequest.getImageName());
    }

    // 그룹 상세 조회
    @Transactional(readOnly = true)
    public GroupInfoResponseDto getGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        return new GroupInfoResponseDto(group, getRawImageUrl(group));
    }

    // 사용자가 속한 모든 그룹 조회
    @Transactional(readOnly = true)
    public List<GroupInfoResponseDto> getMyGroups(Long userId) {
        List<MemberGroup> myMemberGroups = memberGroupRepository.findAllByMemberId(userId);

        return myMemberGroups.stream()
                .map(memberGroup -> new GroupInfoResponseDto(memberGroup.getGroup(), getRawImageUrl(memberGroup.getGroup())))
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isMemberInGroup(Member member, Long groupId) {
        return memberGroupRepository.existsByMemberIdAndGroupId(member.getId(), groupId);
    }

    public grit.domain.group.dto.GroupProfileImageUploadUrlResponseDto generateGroupImageUploadUrl() {
        String fileName = java.util.UUID.randomUUID().toString();
        String uploadUrl = s3Service.createSignedPutUrl("group-images", fileName, java.time.Duration.ofMinutes(10)).toString();
        return new grit.domain.group.dto.GroupProfileImageUploadUrlResponseDto(fileName, uploadUrl);
    }

    private String getRawImageUrl(Group group) {
        return group.getImageName() != null ? group.getImageName().toString() : null;
    }
}
