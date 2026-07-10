package grit.domain.group.livekit.pomodoro.service;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.repository.PomodoroRepository;
import grit.domain.group.livekit.service.LiveKitService;
import grit.domain.member.entity.Member;
import grit.global.exception.AccessDeniedException;
import grit.global.exception.EntityNotFoundException;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final GroupService groupService;
    private final PomodoroRepository pomodoroRepository;
    private final LiveKitService liveKitService;
    private final Clock clock;
    private final ObservationRegistry observationRegistry;

    @Transactional(readOnly = true)
    public Pomodoro findCurrent(Member member, String groupCode) {
        Group group = groupService.findGroupByCode(groupCode);
        checkPermission(member, group);

        return pomodoroRepository.findByGroup(group).orElse(null);
    }

    @Transactional
    public Pomodoro start(Member member, String groupCode, int focusMinutes, int totalRounds) {
        Group group = groupService.findGroupByCodeForUpdate(groupCode);
        checkPermission(member, group);

        Instant now = Instant.now(clock);
        Pomodoro pomodoro = pomodoroRepository.findByGroup(group).orElse(null);
        if (pomodoro == null) {
            pomodoro = Pomodoro.builder()
                    .group(group)
                    .build();
        }

        pomodoro.start(now, focusMinutes, totalRounds);

        Pomodoro savedPomodoro = pomodoroRepository.save(pomodoro);
        sendPomodoroSyncAfterCommit("start", member, group, savedPomodoro);

        return savedPomodoro;
    }

    @Transactional
    public Pomodoro pause(Member member, String groupCode) {
        Group group = groupService.findGroupByCodeForUpdate(groupCode);
        checkPermission(member, group);

        Instant now = Instant.now(clock);
        Pomodoro pomodoro = findByGroup(group);
        pomodoro.pause(now);
        Pomodoro savedPomodoro = pomodoroRepository.save(pomodoro);
        sendPomodoroSyncAfterCommit("pause", member, group, savedPomodoro);

        return savedPomodoro;
    }

    @Transactional
    public Pomodoro resume(Member member, String groupCode) {
        Group group = groupService.findGroupByCodeForUpdate(groupCode);
        checkPermission(member, group);

        Instant now = Instant.now(clock);
        Pomodoro pomodoro = findByGroup(group);
        pomodoro.resume(now);
        Pomodoro savedPomodoro = pomodoroRepository.save(pomodoro);
        sendPomodoroSyncAfterCommit("resume", member, group, savedPomodoro);

        return savedPomodoro;
    }

    @Transactional
    public Pomodoro stop(Member member, String groupCode) {
        Group group = groupService.findGroupByCodeForUpdate(groupCode);
        checkPermission(member, group);

        Instant now = Instant.now(clock);
        Pomodoro pomodoro = findByGroup(group);
        pomodoro.stop();
        Pomodoro savedPomodoro = pomodoroRepository.save(pomodoro);
        sendPomodoroSyncAfterCommit("stop", member, group, savedPomodoro);

        return savedPomodoro;
    }

    private Pomodoro findByGroup(Group group) {
        return pomodoroRepository.findByGroup(group)
                .orElseThrow(() -> new EntityNotFoundException("진행 중인 뽀모도로가 없습니다."));
    }

    private void sendPomodoroSyncAfterCommit(String operation, Member member, Group group, Pomodoro pomodoro) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            liveKitService.sendPomodoroSync(member, group, pomodoro);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            private Observation commitObservation;
            private Observation.Scope commitScope;

            @Override
            public void beforeCompletion() {
                commitObservation = Observation.createNotStarted("pomodoro.tx.commit", observationRegistry)
                        .contextualName("Pomodoro transaction commit")
                        .lowCardinalityKeyValue("pomodoro.operation", operation)
                        .start();
                commitScope = commitObservation.openScope();
            }

            @Override
            public void afterCommit() {
                stopCommitObservation();
                liveKitService.sendPomodoroSync(member, group, pomodoro);
            }

            @Override
            public void afterCompletion(int status) {
                stopCommitObservation();
            }

            private void stopCommitObservation() {
                if (commitObservation != null) {
                    if (commitScope != null) {
                        commitScope.close();
                    }
                    commitObservation.stop();
                    commitScope = null;
                    commitObservation = null;
                }
            }
        });
    }

    private void checkPermission(Member member, Group group) {
        if (!groupService.isMemberInGroup(member, group)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
    }
}
