package grit.room;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    Optional<RoomMember> findByRoomIdAndMemberId(Long roomId, Long memberId);

    List<RoomMember> findByRoomId(Long roomId);

    List<RoomMember> findByMemberId(Long memberId);

    boolean existsByRoomIdAndMemberId(Long roomId, Long memberId);
}

