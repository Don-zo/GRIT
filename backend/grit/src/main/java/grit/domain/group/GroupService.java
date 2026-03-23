package grit.domain.group;

import grit.domain.group.dto.GroupProfileImageUploadUrlResponseDto;
import grit.domain.group.entity.Group;
import grit.domain.group.entity.MemberGroup;
import grit.domain.group.repository.GroupRepository;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.entity.Member;
import grit.global.exception.AccessDeniedException;
import grit.global.exception.EntityAlreadyExistsException;
import grit.global.exception.EntityNotFoundException;
import grit.global.exception.InvalidInputException;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import grit.global.util.GroupCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final MemberGroupRepository memberGroupRepository;
    private final S3Service s3Service;

    @Transactional
    public Group createGroup(Member member, String name, UUID imageName) {
        if (imageName != null && !s3Service.isObjectExists(S3Directory.GROUP_IMAGES, imageName.toString())) {
            throw new InvalidInputException("유효하지 않은 그룹 이미지입니다.");
        }

        String groupCode = generateGroupCode();
        Group group = Group.builder()
                .name(name)
                .imageName(imageName)
                .code(groupCode)
                .build();

        group.increaseMemberCount();
        Group savedGroup = groupRepository.save(group);

        MemberGroup memberGroup = MemberGroup.builder()
                .member(member)
                .group(savedGroup)
                .build();
        memberGroupRepository.save(memberGroup);

        return savedGroup;
    }

    private String generateGroupCode() {
        String code;
        int retryCount = 0;
        do {
            code = GroupCodeGenerator.generate();
            retryCount++;
            if (retryCount > 10) {
                throw new IllegalStateException("그룹 코드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } while (groupRepository.existsByCode(code));
        return code;
    }

    @Transactional
    public Group joinGroup(Member member, String groupCode) {
        Group group = findGroupByCode(groupCode);

        boolean isAlreadyMember = memberGroupRepository.existsByMemberAndGroup(member, group);
        if (isAlreadyMember) {
            throw new EntityAlreadyExistsException("이미 가입된 그룹입니다.");
        }

        MemberGroup memberGroup = MemberGroup.builder()
                .member(member)
                .group(group)
                .build();

        memberGroupRepository.save(memberGroup);
        group.increaseMemberCount();

        return group;
    }

    @Transactional
    public void deleteGroupByCode(Member member, String groupCode) {
        Group group = findGroupByCode(groupCode);

        MemberGroup memberGroup = memberGroupRepository.findByMemberAndGroup(member, group)
                .orElseThrow(() -> new AccessDeniedException("참여 중인 그룹이 아닙니다."));

        memberGroupRepository.delete(memberGroup);

        group.decreaseMemberCount();

        if (group.getMemberCount() <= 0) {
            groupRepository.delete(group);
        }
    }

    @Transactional
    public Group updateGroupByCode(Member member, String groupCode, String name, UUID imageName) {
        Group group = findGroupByCode(groupCode);

        boolean isMember = memberGroupRepository.existsByMemberAndGroup(member, group);
        if (!isMember) {
            throw new AccessDeniedException("그룹 멤버만 수정할 수 있습니다.");
        }

        if (imageName != null && !s3Service.isObjectExists(S3Directory.GROUP_IMAGES, imageName.toString())) {
            throw new InvalidInputException("유효하지 않은 그룹 이미지입니다.");
        }

        group.updateInfo(name, imageName);

        return group;
    }

    @Transactional(readOnly = true)
    public Group findGroupByCode(String groupCode) {
        return groupRepository.findByCode(groupCode)
                .orElseThrow(() -> new EntityNotFoundException("유효하지 않은 그룹 코드입니다."));
    }

    @Transactional(readOnly = true)
    public List<Group> getMyGroups(Member member) {
        return memberGroupRepository.findAllByMember(member).stream()
                .map(MemberGroup::getGroup)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isMemberInGroup(Member member, Group group) {
        return memberGroupRepository.existsByMemberAndGroup(member, group);
    }

    public GroupProfileImageUploadUrlResponseDto generateGroupImageUploadUrl() {
        String fileName = UUID.randomUUID().toString();
        String uploadUrl = s3Service.createSignedPutUrl(S3Directory.GROUP_IMAGES, fileName, Duration.ofMinutes(10)).toString();
        return new GroupProfileImageUploadUrlResponseDto(fileName, uploadUrl);
    }
}
