package grit.domain.member.service;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.dto.MemberUpdateRequestDto;
import grit.domain.member.dto.MemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

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

    // 닉네임 중복 체크
    private void validNickname(String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new IllegalStateException("이미 존재하는 닉네임입니다.");
        }
    }

    // 이메일 중복 체크
    private void validEmail(String email) {
        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            String providerDescription = member.get().getProvider().getDescription();
            throw new IllegalStateException("이미 " + providerDescription + " 서비스를 통해 가입된 계정입니다.");
        }
    }

    // 회원 전체 조회
    public List<MemberResponseDto> findAll() {
        return memberRepository.findAll().stream()
                .map(MemberResponseDto::new)
                .toList();
    }

    // 단일 회원 조회
    public Member findOne(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(id + " 회원을 찾을 수 없습니다."));
    }

    // 정보 수정
    @Transactional
    public void update(Long id, MemberUpdateRequestDto updateParam) {
        Member member = findMemberById(id);

        updateNickname(member, updateParam.getNickname());
        updateIntroduction(member, updateParam.getIntroduction());
    }

    // 사용자 조회 로직
    private Member findMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 회원입니다."));
    }

    // 닉네임 수정
    private void updateNickname(Member member, String newNickname) {
        if (newNickname == null) return;

        if (newNickname.equals(member.getNickname()))
            throw new IllegalStateException("변경하려는 닉네임이 기존 닉네임과 동일합니다.");

        if (memberRepository.existsByNickname(newNickname))
            throw new IllegalStateException("이미 사용 중인 닉네임입니다.");

        member.setNickname(newNickname);
    }

    // 한 줄 소개 수정
    private void updateIntroduction(Member member, String newIntroduction) {
        if (newIntroduction != null) {
            member.setIntroduction(newIntroduction);
        }
    }

    // 회원 탈퇴
    public void delete(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 회원입니다."));
        memberRepository.delete(member);
    }

    public Optional<Member> getBySocialAccount(SocialProvider provider, String providerId) {
        return memberRepository.findByProviderAndProviderId(provider, providerId);
    }

    public boolean isMemberPending(Member member) {
        return member.getRole() == Role.PENDING;
    }

}
