package grit.group;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {

}

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {

}
