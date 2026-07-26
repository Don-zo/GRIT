package grit.domain.group.livekit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.member.entity.Member;
import io.micrometer.observation.ObservationRegistry;
import java.time.Clock;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
class LiveKitServiceTest {

    @Mock
    private GroupService groupService;

    @Mock
    private LiveKitRoomStatusService liveKitRoomStatusService;

    private LiveKitService liveKitService;
    private Member member;

    @BeforeEach
    void setUp() {
        liveKitService = new LiveKitService(
                groupService,
                new ObjectMapper(),
                Clock.systemUTC(),
                ObservationRegistry.NOOP,
                liveKitRoomStatusService
        );
        ReflectionTestUtils.setField(liveKitService, "apiKey", "api-key");
        ReflectionTestUtils.setField(liveKitService, "apiSecret", "api-secret");

        member = Member.builder()
                .id(1L)
                .nickname("grit-user")
                .email("grit@example.com")
                .build();

        Group group = mock(Group.class);
        when(group.getCode()).thenReturn("CURRENT");
        when(groupService.findGroupByCode("CURRENT")).thenReturn(group);
        when(groupService.isMemberInGroup(member, group)).thenReturn(true);
    }

    @Test
    void returnsFalseWhenMemberIsOnlyInCurrentRoom() {
        when(liveKitRoomStatusService.isParticipatingInOtherRoom(
                eq("grit-user"),
                eq("CURRENT"),
                any(Supplier.class)
        ))
                .thenReturn(false);

        boolean result = liveKitService.isParticipatingInOtherRoom(member, "CURRENT");

        assertThat(result).isFalse();
    }

    @Test
    void returnsTrueWhenMemberIsInAnotherRoom() {
        when(liveKitRoomStatusService.isParticipatingInOtherRoom(
                eq("grit-user"),
                eq("CURRENT"),
                any(Supplier.class)
        ))
                .thenReturn(true);

        boolean result = liveKitService.isParticipatingInOtherRoom(member, "CURRENT");

        assertThat(result).isTrue();
    }
}
