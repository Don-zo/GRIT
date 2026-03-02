package grit.domain.member.service;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.global.exception.EntityNotFoundException;
import grit.global.exception.NicknameConflictException;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;

    // 회원 가입
    public Member createMember(String email, SocialProvider provider, String providerId) {
        validEmail(email);

        Member member = Member.builder()
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .role(Role.PENDING)
                .build();

        return memberRepository.save(member);
    }

    public boolean isNicknameTaken(Member currentMember, String nickname) {
        if (nickname.equals(currentMember.getNickname())) {
            return false;
        }

        return memberRepository.existsByNickname(nickname);
    }

    // 이메일 중복 체크
    private void validEmail(String email) {
        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            String providerDescription = member.get().getProvider().getDescription();
            throw new IllegalStateException("이미 " + providerDescription + " 서비스를 통해 가입된 계정입니다.");
        }
    }

    // 단일 회원 조회
    public Member findMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다."));
    }

    @Transactional
    public void initializeProfile(
            Member member, String nickname, String introduction, String image) {

        if (isNicknameTaken(member, nickname)) {
            throw new NicknameConflictException("이미 사용 중인 닉네임입니다.");
        }
        member.initializeProfile(nickname, introduction, image);
    }

    // 정보 수정
    @Transactional
    public void updateProfile(
            Member member, String nickname, String introduction, String image) {

        if (nickname != null && isNicknameTaken(member, nickname)) {
            throw new NicknameConflictException("이미 사용 중인 닉네임입니다.");
        }
        member.updateProfile(nickname, introduction, image);
    }

    // 회원 탈퇴
    public void delete(Member member) {
        memberRepository.delete(member);
    }

    public Optional<Member> getBySocialAccount(SocialProvider provider, String providerId) {
        return memberRepository.findByProviderAndProviderId(provider, providerId);
    }

    public boolean isMemberPending(Member member) {
        return member.getRole() == Role.PENDING;
    }

}
