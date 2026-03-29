package grit.domain.todo.service;

import grit.domain.group.entity.Group;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.group.repository.GroupRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    private final TodoRepository todoRepository;
    private final TodoCategoryRepository todoCategoryRepository;
    private final MemberGroupRepository memberGroupRepository;
    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;

    public List<Todo> findAll(Long groupId, Long userId, Long ownerId) {
        if (!groupRepository.existsById(groupId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다.");
        }
        if (!memberGroupRepository.existsByMemberIdAndGroupId(userId, groupId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다.");
        }

        if (ownerId != null) {
            return todoRepository.findByGroupIdAndOwnerIdWithRelations(groupId, ownerId);
        } else {
            return todoRepository.findByGroupIdWithRelations(groupId);
        }
    }

    public List<Todo> findByUserId(Long userId) {
        return todoRepository.findByOwnerIdWithRelations(userId);
    }

    @Transactional
    public Todo create(Long userId, CreateTodoRequestDTO request) {
        Member owner = memberRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Todo todo = new Todo();
        todo.setOwner(owner);
        todo.setContent(request.getContent());
        todo.setDueDate(request.getDueDate());
        todo.setIsDone(false);

        if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            if (!category.getOwner().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 카테고리만 사용할 수 있습니다.");
            }
            todo.setCategory(category);
        }

        if (request.getGroupId() != null) {
            Long groupId = request.getGroupId();
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다."));
            if (!memberGroupRepository.existsByMemberIdAndGroupId(userId, groupId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다.");
            }
            todo.setGroup(group);
        }

        return todoRepository.save(todo);
    }

    @Transactional
    public Todo update(Long todoId, Long userId, UpdateTodoRequestDTO request) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "투두를 찾을 수 없습니다."));

        if (!todo.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 투두만 수정할 수 있습니다.");
        }

        if (request.getContent() != null) {
            todo.setContent(request.getContent());
        }
        if (request.getIsDone() != null) {
            todo.setIsDone(request.getIsDone());
        }
        if (Boolean.TRUE.equals(request.getClearCategory())) {
            todo.setCategory(null);
        } else if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            if (!category.getOwner().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 카테고리만 사용할 수 있습니다.");
            }
            todo.setCategory(category);
        }
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }

        return todo;
    }

    @Transactional
    public void delete(Long todoId, Long userId) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "투두를 찾을 수 없습니다."));

        if (!todo.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 투두만 삭제할 수 있습니다.");
        }

        todoRepository.deleteById(todoId);
    }

    public List<DailyAchievementDTO> getLast7DaysAchievement(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(7);
        LocalDate to = today.minusDays(1);

        List<Todo> todos = todoRepository.findByOwnerIdAndDueDateBetween(userId, from, to);

        Map<LocalDate, List<Todo>> todosByDate = todos.stream()
                .collect(Collectors.groupingBy(Todo::getDueDate));

        List<DailyAchievementDTO> result = new ArrayList<>();

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<Todo> todosOfDay = todosByDate.getOrDefault(date, Collections.emptyList());

            long total = todosOfDay.size();
            long done = todosOfDay.stream()
                    .filter(Todo::isDone)
                    .count();

            result.add(new DailyAchievementDTO(date, total, done));
        }

        return result;
    }
}
