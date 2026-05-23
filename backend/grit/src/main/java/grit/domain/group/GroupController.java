package grit.domain.group;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.group.dto.GroupCreateRequestDto;
import grit.domain.group.dto.GroupInfoResponseDto;
import grit.domain.group.dto.GroupProfileImageUploadUrlResponseDto;
import grit.domain.group.dto.GroupUpdateRequestDto;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.service.LiveKitRoomStatusService;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Group", description = "그룹 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final MemberService memberService;
    private final S3Service s3Service;
    private final LiveKitRoomStatusService liveKitRoomStatusService;

    @Operation(summary = "그룹 생성", description = "새로운 그룹을 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "그룹 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 입력값", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 (생성자 ID 오류)", content = @Content)
    })
    @PostMapping
    public ResponseEntity<GroupInfoResponseDto> createGroup(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @RequestBody GroupCreateRequestDto request) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        Group group = groupService.createGroup(member, request.getName(), request.getImageName());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(group));
    }

    @Operation(summary = "그룹 가입", description = "그룹 코드를 입력하여 그룹에 참여합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "가입 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 그룹 또는 사용자", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 가입된 그룹 또는 그룹 정원 초과", content = @Content)
    })
    @PostMapping("/{groupCode}/join")
    public ResponseEntity<GroupInfoResponseDto> joinGroup(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "가입할 그룹의 그룹 코드", example = "ABCD12")
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        Group group = groupService.joinGroup(member, groupCode);
        return ResponseEntity.ok(toResponseDto(group));
    }

    @Operation(summary = "그룹 상세 조회", description = "그룹 코드를 이용하여 특정 그룹의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "유효하지 않은 그룹 코드", content = @Content)
    })
    @GetMapping("/{groupCode}")
    public ResponseEntity<GroupInfoResponseDto> getGroup(
            @Parameter(description = "조회할 그룹의 그룹 코드", example = "ABCD12")
            @PathVariable String groupCode) {

        Group group = groupService.findGroupByCode(groupCode);
        return ResponseEntity.ok(toResponseDto(group));
    }

    @Operation(summary = "내 그룹 목록 조회", description = "내가 속한 모든 그룹 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/my")
    public ResponseEntity<List<GroupInfoResponseDto>> getMyGroups(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        List<GroupInfoResponseDto> response = groupService.getMyGroups(member)
                .stream()
                .map(this::toResponseDto)
                .toList();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "그룹 정보 수정", description = "그룹의 정보(이름, 이미지 경로)를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "수정 권한 없음", content = @Content),
            @ApiResponse(responseCode = "404", description = "유효하지 않은 그룹 코드", content = @Content)
    })
    @PutMapping("/{groupCode}")
    public ResponseEntity<GroupInfoResponseDto> updateGroup(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "수정할 그룹의 그룹 코드", example = "ABCD12")
            @PathVariable String groupCode,
            @RequestBody GroupUpdateRequestDto updateRequest) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        Group group = groupService.updateGroupByCode(member, groupCode, updateRequest.getName(), updateRequest.getImageName());
        return ResponseEntity.ok(toResponseDto(group));
    }

    @Operation(summary = "그룹 나가기 (삭제)", description = "그룹을 탈퇴합니다. 해당 그룹 멤버의 인원이 0명이 되면 그룹이 자동 삭제됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "탈퇴/삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "404", description = "유효하지 않은 그룹 코드 또는 사용자", content = @Content)
    })
    @DeleteMapping("/{groupCode}")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        groupService.deleteGroupByCode(member, groupCode);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "그룹 프로필 이미지 업로드 URL 발급", description = "AWS S3에 그룹 프로필 이미지를 업로드하기 위한 Presigned URL을 발급받습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL 생성 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content)
    })
    @GetMapping("/image-upload-url")
    public ResponseEntity<GroupProfileImageUploadUrlResponseDto> getGroupImageUploadUrl() {
        return ResponseEntity.ok(groupService.generateGroupImageUploadUrl());
    }

    private GroupInfoResponseDto toResponseDto(Group group) {
        String imageUrl = null;
        if (group.getImageName() != null) {
            imageUrl = s3Service.resolveUrl(S3Directory.GROUP_IMAGES, group.getImageName().toString());
        }
        int liveParticipantCount = liveKitRoomStatusService.getParticipantCount(group.getCode());
        return new GroupInfoResponseDto(
                group.getName(),
                group.getCode(),
                group.getMemberCount(),
                imageUrl,
                liveParticipantCount > 0,
                liveParticipantCount
        );
    }
}
