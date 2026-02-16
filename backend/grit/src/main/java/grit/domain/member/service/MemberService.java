package grit.domain.member.service;

import grit.domain.member.dto.MemberCreateRequestDto;
import grit.domain.member.dto.MemberUpdateRequestDto;
import grit.domain.member.dto.MemberInfoResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원 가입
    public Member join(MemberCreateRequestDto request) {
        validNickname(request.getNickname());
        validEmail(request.getEmail());

        String encodedPW = passwordEncoder.encode(request.getPassword());

        Member member = Member.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(encodedPW)
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
        if (memberRepository.existsByEmail(email)) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }
    }

    // 회원 전체 조회
    public List<MemberInfoResponseDto> findAll() {
        return memberRepository.findAll().stream()
                .map(MemberInfoResponseDto::new)
                .toList();
    }

    // 단일 회원 조회
    public MemberInfoResponseDto findOne(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(id + " 회원을 찾을 수 없습니다."));
        return new MemberInfoResponseDto(member);
    }

    // 정보 수정
    @Transactional
    public void update(Long id, MemberUpdateRequestDto updateParam) {
        Member member = findMemberById(id);

        updateNickname(member, updateParam.getNickname());
        updatePassword(member, updateParam.getPassword());
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

        if (member.getNickname().equals(newNickname))
            throw new IllegalStateException("변경하려는 닉네임이 기존 닉네임과 동일합니다.");

        if (memberRepository.existsByNickname(newNickname))
            throw new IllegalStateException("이미 사용 중인 닉네임입니다.");

        member.setNickname(newNickname);
    }

    // 비밀번호 수정
    private void updatePassword(Member member, String newPassword) {
        if (newPassword == null) return;

        if (passwordEncoder.matches(newPassword, member.getPassword())) {
            throw new IllegalStateException("변경하려는 비밀번호가 기존 비밀번호와 동일합니다.");
        }
        member.setPassword(passwordEncoder.encode(newPassword));
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
}
