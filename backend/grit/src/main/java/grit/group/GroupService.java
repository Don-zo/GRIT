package grit.group;

import grit.global.util.InviteCodeGenerator;
import grit.group.dto.CreateGroupRequestDTO;
import grit.group.dto.GroupResponseDTO;
import grit.group.dto.UpdateGroupRequestDTO;
import grit.group.entity.Group;
import grit.group.entity.UserGroup;
import grit.group.repository.GroupRepository;
import grit.group.repository.UserGroupRepository;
import grit.user.User;
import grit.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;

    // 그룹 생성
    @Transactional
    public GroupResponseDTO createGroup(Long userId, CreateGroupRequestDTO groupRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String inviteCode = generateInviteCode();

        Group group = Group.builder()
                .name(groupRequest.getName())
                .imageUrl(groupRequest.getImageUrl())
                .inviteCode(inviteCode)
                .build();

        group.increaseMemberCount();
        Group savedGroup = groupRepository.save(group);

        UserGroup userGroup = UserGroup.builder()
                .user(user)
                .group(savedGroup)
                .build();
        userGroupRepository.save(userGroup);

        return new GroupResponseDTO(savedGroup);
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
    public GroupResponseDTO joinGroup(Long userId, String inviteCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        boolean isAlreadyMember = userGroupRepository.existsByUserIdAndGroupId(userId, group.getId());
        if (isAlreadyMember) {
            throw new IllegalStateException("이미 가입된 그룹입니다.");
        }

        UserGroup userGroup = UserGroup.builder()
                .user(user)
                .group(group)
                .build();

        userGroupRepository.save(userGroup);
        group.increaseMemberCount();

        return new GroupResponseDTO(group);
    }

    // 그룹 나가기(삭제)
    @Transactional
    public void deleteGroup(Long userId, Long groupId) {
        UserGroup userGroup = userGroupRepository.findByUserIdAndGroupId(userId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("참여 중인 그룹이 아닙니다."));

        Group group = userGroup.getGroup();

        userGroupRepository.delete(userGroup);

        group.decreaseMemberCount();

        if (group.getMemberCount() <= 0) {
            groupRepository.delete(group);
            System.out.println("그룹 내의 인원이 0명이 되어 그룹이 자동 삭제되었습니다." + groupId);
        }
    }

    // 그룹 정보 수정
    @Transactional
    public void updateGroup(Long userId, Long groupId, UpdateGroupRequestDTO updateRequest) {
        boolean isMember = userGroupRepository.existsByUserIdAndGroupId(userId, groupId);
        if (!isMember) {
            throw new IllegalArgumentException("그룹 멤버만 수정할 수 있습니다.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        group.updateInfo(updateRequest.getName(), updateRequest.getImageUrl());
    }

    // 그룹 상세 조회
    @Transactional(readOnly = true)
    public GroupResponseDTO getGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        return new GroupResponseDTO(group);
    }

    // 사용자가 속한 모든 그룹 조회
    @Transactional(readOnly = true)
    public List<GroupResponseDTO> getMyGroups(Long userId) {
        List<UserGroup> myUserGroups = userGroupRepository.findAllByUserId(userId);

        return myUserGroups.stream()
                .map(userGroup -> new GroupResponseDTO(userGroup.getGroup()))
                .toList();
    }
}
