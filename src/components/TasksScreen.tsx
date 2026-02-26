import { parseDate } from "@internationalized/date";
import {
  Button,
  Checkbox,
  DateInput,
  Progress,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Spinner,
} from "@heroui/react";
import { ArrowLeft, Edit, Minus, Plus, Trash } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../AppProvider";
import Task from "../domain/Task";
import { TaskStatus } from "../domain/TaskStatus";

const TaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Validación fuerte para TypeScript
  if (!listId) {
    return <div>Invalid task list</div>;
  }

  const taskList = state.taskLists.find((tl) => tl.id === listId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!taskList) {
          await api.getTaskList(listId);
        }
        await api.fetchTasks(listId);
      } catch (error) {
        console.error("Error loading task list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [listId]);

  const completionPercentage = useMemo(() => {
    const tasks = state.tasks[listId];
    if (!tasks || tasks.length === 0) return 0;

    const closedTasks = tasks.filter(
      (task) => task.status === TaskStatus.CLOSED
    ).length;

    return (closedTasks / tasks.length) * 100;
  }, [state.tasks, listId]);

  const toggleStatus = async (task: Task) => {
    const updatedTask: Task = {
      ...task,
      status:
        task.status === TaskStatus.CLOSED
          ? TaskStatus.OPEN
          : TaskStatus.CLOSED,
    };

    await api.updateTask(listId, task.id, updatedTask);
    await api.fetchTasks(listId);
  };

  const deleteTaskList = async () => {
    await api.deleteTaskList(listId);
    navigate("/");
  };

  if (isLoading) {
    return <Spinner />;
  }

  const tasks = state.tasks[listId] ?? [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button isIconOnly variant="light" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-2xl font-bold">
          {taskList?.title ?? "Task List"}
        </h1>

        <Button
          isIconOnly
          variant="light"
          onClick={() => navigate(`/edit-task-list/${listId}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <Progress
        value={completionPercentage}
        className="mb-4"
        aria-label="Task completion"
      />

      {/* Add task */}
      <Button
        color="primary"
        className="mb-4 w-full"
        onClick={() => navigate(`/task-lists/${listId}/new-task`)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>

      {/* Tasks table */}
      <div className="border rounded-lg overflow-hidden">
        <Table aria-label="Tasks list">
          <TableHeader>
            <TableColumn>Done</TableColumn>
            <TableColumn>Title</TableColumn>
            <TableColumn>Priority</TableColumn>
            <TableColumn>Due Date</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>

          <TableBody emptyContent="No tasks yet">
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    isSelected={task.status === TaskStatus.CLOSED}
                    onValueChange={() => toggleStatus(task)}
                  />
                </TableCell>

                <TableCell>{task.title}</TableCell>
                <TableCell>{task.priority}</TableCell>

                <TableCell>
                  {task.dueDate && (
                    <DateInput
                      isDisabled
                      defaultValue={parseDate(
                        new Date(task.dueDate)
                          .toISOString()
                          .split("T")[0]
                      )}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      onClick={() =>
                        navigate(
                          `/task-lists/${listId}/edit-task/${task.id}`
                        )
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onClick={() => api.deleteTask(listId, task.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Spacer y={4} />

      {/* Delete list */}
      <div className="flex justify-end">
        <Button
          color="danger"
          startContent={<Minus size={18} />}
          onClick={deleteTaskList}
        >
          Delete Task List
        </Button>
      </div>
    </div>
  );
};

export default TaskListScreen;