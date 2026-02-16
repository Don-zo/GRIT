package grit.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    Optional<RoomMember> findByRoomIdAndMemberId(Long roomId, Long memberId);

    List<RoomMember> findByRoomId(Long memberId);

    List<RoomMember> findByMemberId(Long memberId);

    boolean existsByRoomIdAndMemberId(Long roomId, Long memberId);
}

