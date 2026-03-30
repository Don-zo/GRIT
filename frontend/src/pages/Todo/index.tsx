import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import EditCard from "@/pages/Todo/Edit/EditCard";
import TodoList from "@/pages/Todo/TodoList/TodoList";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type TodoItem,
} from "@/pages/Todo/types";

const TodoPage = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTodo = useMemo(
    () =>
      editingId ? (todos.find((t) => t.id === editingId) ?? null) : null,
    [editingId, todos],
  );

  useEffect(() => {
    if (editingId && !todos.some((t) => t.id === editingId)) {
      setEditingId(null);
    }
  }, [editingId, todos]);

  const handleAddTodo = (item: {
    title: string;
    dueDate: string;
    categoryId: string;
  }) => {
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...item, completed: false },
    ]);
  };

  const handleUpdateTodo = (
    id: string,
    item: { title: string; dueDate: string; categoryId: string },
  ) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...item } : t)),
    );
    setEditingId(null);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setEditingId(null);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-darkest pt-[65px]">
      <Header variant="dark" alwaysVisible />
      <div className="flex min-h-0 flex-1 flex-row gap-3 px-8 pb-8 pt-4">
        <TodoList
          todos={todos}
          categories={categories}
          onTodosLoaded={setTodos}
          onEditTodo={(todo) => setEditingId(todo.id)}
          onToggleComplete={(id) =>
            setTodos((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t,
              ),
            )
          }
          onMoveTodoToDate={(id, dueDate) =>
            setTodos((prev) =>
              prev.map((t) => (t.id === id ? { ...t, dueDate } : t)),
            )
          }
        />

        <EditCard
          categories={categories}
          setCategories={setCategories}
          editingTodo={editingTodo}
          onAddTodo={handleAddTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      </div>
    </div>
  );
};

export default TodoPage;
