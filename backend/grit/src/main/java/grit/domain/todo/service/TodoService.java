package grit.domain.todo.service;

import grit.domain.group.entity.Group;
import grit.domain.group.repository.GroupRepository;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.MoveTodoDueDateRequestDTO;
import grit.domain.todo.dto.SetTodoDoneRequestDTO;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    private final TodoRepository todoRepository;
    private final TodoCategoryRepository todoCategoryRepository;
    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;
    private final MemberGroupRepository memberGroupRepository;

    public List<Todo> findByUserId(Long userId) {
        return todoRepository.findByOwnerIdWithRelations(userId);
    }

    /**
     * 해당 그룹 멤버가 작성한 투두 전체. {@code focusUserId}는 그룹 멤버여야 하며, 해당 작성자의 투두가 목록 최상단에 오도록 정렬합니다.
     * 요청자는 그룹 멤버여야 합니다.
     */
    public List<Todo> findForGroup(String groupCode, Long requesterUserId, Long focusUserId) {
        Member requester = memberRepository.findById(requesterUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Group group = groupRepository.findByCode(groupCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유효하지 않은 그룹 코드입니다."));

        if (!memberGroupRepository.existsByMemberAndGroup(requester, group)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다.");
        }

        if (!memberGroupRepository.existsByMember_IdAndGroup_Id(focusUserId, group.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 그룹에 속하지 않은 사용자입니다.");
        }

        List<Todo> todos = new ArrayList<>(todoRepository.findByGroupMembersTodosWithRelations(group.getId()));
        Comparator<Todo> comparator = Comparator
                .comparing((Todo t) -> !t.getOwner().getId().equals(focusUserId))
                .thenComparing((a, b) -> Boolean.compare(a.isDone(), b.isDone()))
                .thenComparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Todo::getId);
        todos.sort(comparator);
        return todos;
    }

    @Transactional
    public Todo create(Long userId, CreateTodoRequestDTO request) {
        Member owner = memberRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Todo todo = new Todo();
        todo.setOwner(owner);
        todo.setContent(request.getContent().trim());
        todo.setDueDate(request.getDueDate());
        todo.setIsDone(false);

        if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            todo.setCategory(category);
        }

        return todoRepository.save(todo);
    }

    @Transactional
    public Todo update(Long todoId, Long userId, UpdateTodoRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);

        if (request.getContent() != null) {
            String trimmed = request.getContent().trim();
            if (trimmed.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "투두 내용을 입력해주세요.");
            }
            todo.setContent(trimmed);
        }
        if (request.getIsDone() != null) {
            todo.setIsDone(request.getIsDone());
        }
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }

        if (Boolean.TRUE.equals(request.getRemoveCategory())) {
            todo.setCategory(null);
        } else if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            todo.setCategory(category);
        }

        return todo;
    }

    @Transactional
    public Todo moveDueDate(Long todoId, Long userId, MoveTodoDueDateRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);
        todo.setDueDate(request.getDueDate());
        return todo;
    }

    @Transactional
    public Todo setDone(Long todoId, Long userId, SetTodoDoneRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);
        todo.setIsDone(request.getIsDone());
        return todo;
    }

    @Transactional
    public void delete(Long todoId, Long userId) {
        getTodoAndValidateOwner(todoId, userId, "본인의 투두만 삭제할 수 있습니다.");
        todoRepository.deleteById(todoId);
    }

    private Todo getTodoAndValidateOwner(Long todoId, Long userId) {
        return getTodoAndValidateOwner(todoId, userId, "본인의 투두만 수정할 수 있습니다.");
    }

    private Todo getTodoAndValidateOwner(Long todoId, Long userId, String forbiddenMessage) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "투두를 찾을 수 없습니다."));

        if (!todo.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, forbiddenMessage);
        }
        return todo;
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

            if (total == 0) {
                result.add(new DailyAchievementDTO(date, null, null, null));
            } else {
                result.add(new DailyAchievementDTO(date, total, done));
            }
        }

        return result;
    }
}
