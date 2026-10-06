package grit.domain.studytime.service;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.dto.GroupStudyTimeMemberResponseDto;
import grit.domain.group.livekit.service.LiveKitService;
import grit.domain.member.entity.Member;
import grit.domain.member.dto.MemberStudyTimeResponseDto;
import grit.global.exception.AccessDeniedException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class GroupStudyTimeService {

    private final GroupService groupService;
    private final StudyTimeService studyTimeService;
    private final LiveKitService liveKitService;

    @Transactional(readOnly = true)
    public List<GroupStudyTimeMemberResponseDto> getGroupStudyTimes(Member requester, String groupCode) {
        List<Member> members = groupService.findGroupMembers(groupCode, requester.getId());
        return members.stream()
                .map(member -> GroupStudyTimeMemberResponseDto.from(
                        member,
                        studyTimeService.getStudyTime(member)
                ))
                .toList();
    }

    @Transactional
    public GroupStudyTimeMemberResponseDto resume(Member member, String groupCode) {
        Group group = findAuthorizedGroup(member, groupCode);
        MemberStudyTimeResponseDto studyTime = studyTimeService.resume(member);
        GroupStudyTimeMemberResponseDto response = GroupStudyTimeMemberResponseDto.from(member, studyTime);
        sendSyncAfterCommit(member, group, response);
        return response;
    }

    @Transactional
    public GroupStudyTimeMemberResponseDto pause(Member member, String groupCode) {
        Group group = findAuthorizedGroup(member, groupCode);
        MemberStudyTimeResponseDto studyTime = studyTimeService.pause(member);
        GroupStudyTimeMemberResponseDto response = GroupStudyTimeMemberResponseDto.from(member, studyTime);
        sendSyncAfterCommit(member, group, response);
        return response;
    }

    private Group findAuthorizedGroup(Member member, String groupCode) {
        Group group = groupService.findGroupByCode(groupCode);
        if (!groupService.isMemberInGroup(member, group)) {
            throw new AccessDeniedException("해당 그룹의 멤버가 아닙니다.");
        }
        return group;
    }

    private void sendSyncAfterCommit(
            Member member,
            Group group,
            GroupStudyTimeMemberResponseDto response
    ) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            liveKitService.sendStudyTimeSync(member, group, response);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                liveKitService.sendStudyTimeSync(member, group, response);
            }
        });
    }
}