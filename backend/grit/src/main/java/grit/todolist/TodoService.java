package grit.todolist;

import grit.todolist.dto.CreateTodoRequestDTO;
import grit.todolist.dto.DailyAchievementDTO;
import grit.todolist.dto.UpdateTodoRequestDTO;
import grit.user.User;
import grit.user.UserRepository;
import grit.room.Room;
import grit.room.RoomMemberRepository;
import grit.room.RoomRepository;
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
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public List<Todo> findAll(Long roomId, Long userId, Long ownerId) {
        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 방의 멤버가 아닙니다.");
        }

        if (ownerId != null) {
            return todoRepository.findByRoomIdAndOwnerIdWithRelations(roomId, ownerId);
        } else {
            return todoRepository.findByRoomIdWithRelations(roomId);
        }
    }

    public List<Todo> findByUserId(Long userId) {
        return todoRepository.findByOwnerIdWithRelations(userId);
    }

    @Transactional
    public Todo create(Long userId, CreateTodoRequestDTO request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Todo todo = new Todo();
        todo.setOwner(owner);
        todo.setContent(request.getContent());
        todo.setSubjectCategory(request.getSubjectCategory());
        todo.setDueDate(request.getDueDate());
        todo.setIsDone(false);

        if (request.getRoomId() != null) {
            if (!roomMemberRepository.existsByRoomIdAndUserId(request.getRoomId(), userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 방의 멤버가 아닙니다.");
            }
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new NoSuchElementException("방을 찾을 수 없습니다."));
            todo.setRoom(room);
        }

        return todoRepository.save(todo);
    }

    @Transactional
    public Todo update(Long todoId, Long userId, UpdateTodoRequestDTO request) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new NoSuchElementException("투두를 찾을 수 없습니다."));

        if (!todo.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 투두만 수정할 수 있습니다.");
        }

        if (request.getContent() != null) {
            todo.setContent(request.getContent());
        }
        if (request.getIsDone() != null) {
            todo.setIsDone(request.getIsDone());
        }
        if (request.getSubjectCategory() != null) {
            todo.setSubjectCategory(request.getSubjectCategory());
        }
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }

        return todo;
    }

    @Transactional
    public void delete(Long todoId, Long userId) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new NoSuchElementException("투두를 찾을 수 없습니다."));

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
                .filter(todo -> todo.getDueDate() != null)
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

