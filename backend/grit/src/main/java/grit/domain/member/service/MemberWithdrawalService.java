package grit.domain.member.service;

import grit.domain.auth.repository.RefreshTokenRepository;
import grit.domain.group.GroupService;
import grit.domain.group.entity.MemberGroup;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.member.withdrawal.WithdrawalCleanup;
import grit.domain.member.withdrawal.WithdrawalCleanupRepository;
import grit.domain.studytime.repository.StudyTimerStateRepository;
import grit.domain.studytime.repository.WeeklyStudyTimeRepository;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import grit.global.exception.EntityNotFoundException;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberWithdrawalService {

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TodoRepository todoRepository;
    private final TodoCategoryRepository todoCategoryRepository;
    private final StudyTimerStateRepository studyTimerStateRepository;
    private final WeeklyStudyTimeRepository weeklyStudyTimeRepository;
    private final MemberGroupRepository memberGroupRepository;
    private final GroupService groupService;
    private final WithdrawalCleanupRepository cleanupRepository;
    private final Clock clock;

    @Transactional
    public void withdraw(Long memberId) {
        Member member = memberRepository.findLockedById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다."));

        Instant now = clock.instant();
        refreshTokenRepository.deleteAllForMember(memberId);
        todoRepository.deleteAllForMember(memberId);
        todoCategoryRepository.deleteAllForMember(memberId);
        studyTimerStateRepository.deleteAllForMember(memberId);
        weeklyStudyTimeRepository.deleteAllForMember(memberId);
        memberRepository.deleteFriendships(memberId);

        // 여러 그룹을 탈퇴하는 경우에도 잠금 순서를 일정하게 유지한다.
        memberGroupRepository.findAllByMember(member).stream()
                .map(MemberGroup::getGroup)
                .map(group -> group.getCode())
                .sorted()
                .toList()
                .forEach(code -> groupService.deleteGroupByCode(member, code));

        memberRepository.delete(member);
        memberRepository.flush();

        if (member.getImageName() != null && !memberRepository.existsByImageName(member.getImageName())) {
            cleanupRepository.save(WithdrawalCleanup.create(member.getImageName(), now));
        }
    }
}
