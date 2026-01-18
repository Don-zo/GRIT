package grit.group;

import grit.group.dto.CreateGroupRequestDTO;
import grit.user.User;
import grit.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long CreateGroup(Long userId, CreateGroupRequestDTO groupRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // Group 생성


        //
    }
}
