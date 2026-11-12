package grit.domain.auth.repository;

import grit.domain.auth.entity.RefreshToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    @Modifying
    @Query("delete from RefreshToken r where r.token = :token")
    int deleteByToken(@Param("token") String token);

    @Modifying
    @Query("delete from RefreshToken e where e.member.id = :memberId")
    void deleteAllForMember(@Param("memberId") Long memberId);
}
