package grit.domain.member.service;

import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.dto.MemberProfileImageUploadUrlResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.global.exception.EntityAlreadyExistsException;
import grit.global.exception.EntityNotFoundException;
import grit.global.exception.InvalidInputException;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import grit.global.exception.NicknameConflictException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    private final S3Service s3Service;

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
        if (nickname == null) {
            return false;
        }

        if (nickname.equals(currentMember.getNickname())) {
            return false;
        }

        return memberRepository.existsByNickname(nickname);
    }

    public MemberProfileImageUploadUrlResponseDto generateProfileImageUploadUrl() {
        String fileName = UUID.randomUUID().toString();
        String uploadUrl = s3Service.createSignedPutUrl(S3Directory.PROFILE_IMAGES, fileName, Duration.ofMinutes(5)).toString();
        return new MemberProfileImageUploadUrlResponseDto(fileName, uploadUrl);
    }

    // 이메일 중복 체크
    private void validEmail(String email) {
        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            String providerDescription = member.get().getProvider().getDescription();
            throw new EntityAlreadyExistsException("이미 " + providerDescription + " 서비스를 통해 가입된 계정입니다.");
        }
    }

    public Member findMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다."));
    }

    public Member findMemberByNickname(String nickname) {
        return memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new EntityNotFoundException("해당 닉네임의 사용자가 없습니다."));
    }

    @Transactional
    public void initializeProfile(
            Member member, String nickname, String introduction, UUID image,
            LocalDate dDayDate, String dDayTitle, LocalTime weeklyStudyTimeGoal) {

        if (isNicknameTaken(member, nickname)) {
            throw new NicknameConflictException("이미 사용 중인 닉네임입니다.");
        }

        if (image != null && !s3Service.isObjectExists(S3Directory.PROFILE_IMAGES, image.toString())) {
            throw new InvalidInputException("유효하지 않은 이미지입니다.");
        }

        member.initializeProfile(nickname, introduction, image, dDayDate, dDayTitle,
                weeklyStudyTimeGoal);
    }

    // 정보 수정
    @Transactional
    public void updateProfile(
            Member member, String nickname, String introduction, UUID image,
            LocalDate dDayDate, String dDayTitle, LocalTime weeklyStudyTimeGoal) {

        if (isNicknameTaken(member, nickname)) {
            throw new NicknameConflictException("이미 사용 중인 닉네임입니다.");
        }

        if (image != null && !s3Service.isObjectExists(S3Directory.PROFILE_IMAGES, image.toString())) {
            throw new InvalidInputException("유효하지 않은 이미지입니다.");
        }

        member.updateProfile(nickname, introduction, image, dDayDate, dDayTitle,
                weeklyStudyTimeGoal);
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
