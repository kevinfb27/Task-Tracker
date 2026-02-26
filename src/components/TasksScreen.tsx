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
} from "@nextui-org/react";
import { ArrowLeft, Edit, Minus, Plus, Trash } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../AppProvider";
import Task from "../domain/Task";
import { TaskStatus } from "../domain/TaskStatus";

const TaskListScreen: React.FC = () => {
  const { state, api } = useAppContext();
  const { listId } = useParams<{ listId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const taskList = state.taskLists.find((tl) => tl.id === listId);

  // =======================
  // Load initial data
  // =======================
  useEffect(() => {
    const safeListId = listId;
    if (!safeListId) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        if (!taskList) {
          await api.getTaskList(safeListId);
        }
        await api.fetchTasks(safeListId);
      } catch (error) {
        console.error("Error loading task list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [listId, taskList, api]);

  // =======================
  // Completion percentage
  // =======================
  const completionPercentage = useMemo(() => {
    const safeListId = listId;
    if (!safeListId) return 0;

    const tasks = state.tasks[safeListId];
    if (!tasks || tasks.length === 0) return 0;

    const closedCount = tasks.filter(
      (task) => task.status === TaskStatus.CLOSED
    ).length;

    return (closedCount / tasks.length) * 100;
  }, [state.tasks, listId]);

  // =======================
  // Toggle task status
  // =======================
  const toggleStatus = async (task: Task) => {
    const safeListId = listId;
    if (!safeListId) return;

    const updatedTask: Task = {
      ...task,
      status:
        task.status === TaskStatus.CLOSED
          ? TaskStatus.OPEN
          : TaskStatus.CLOSED,
    };

    await api.updateTask(safeListId, task.id, updatedTask);
    await api.fetchTasks(safeListId);
  };

  // =======================
  // Delete task list
  // =======================
  const deleteTaskList = async () => {
    const safeListId = listId;
    if (!safeListId) return;

    await api.deleteTaskList(safeListId);
    navigate("/");
  };

  // =======================
  // Table rows (NEVER null)
  // =======================
  const tableRows = (): JSX.Element[] => {
    const safeListId = listId;
    if (!safeListId) return [];

    const tasks = state.tasks[safeListId];
    if (!tasks) return [];

    return tasks.map((task) => (
      <TableRow key={task.id} className="border-t">
        <TableCell className="px-4 py-2">
          <Checkbox
            isSelected={task.status === TaskStatus.CLOSED}
            onValueChange={() => toggleStatus(task)}
            aria-label={`Toggle task ${task.title}`}
          />
        </TableCell>

        <TableCell className="px-4 py-2">{task.title}</TableCell>
        <TableCell className="px-4 py-2">{task.priority}</TableCell>

        <TableCell className="px-4 py-2">
          {task.dueDate && (
            <DateInput
              isDisabled
              defaultValue={parseDate(
                new Date(task.dueDate).toISOString().split("T")[0]
              )}
            />
          )}
        </TableCell>

        <TableCell className="px-4 py-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(`/task-lists/${safeListId}/edit-task/${task.id}`)
              }
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => api.deleteTask(safeListId, task.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  // =======================
  // Render states
  // =======================
  if (isLoading) {
    return <Spinner />;
  }

  if (!listId) {
    return <div className="p-4">Invalid Task List</div>;
  }

  // =======================
  // UI
  // =======================
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <h1 className="text-2xl font-bold mx-4">
            {taskList?.title ?? "Unknown Task List"}
          </h1>

          <Button
            variant="ghost"
            onClick={() => navigate(`/edit-task-list/${listId}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={completionPercentage} className="mb-4" />

      <Button
        className="mb-4 w-full"
        onClick={() => navigate(`/task-lists/${listId}/new-task`)}
      >
        <Plus className="h-4 w-4" /> Add Task
      </Button>

      <div className="border rounded-lg overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableColumn>Completed</TableColumn>
            <TableColumn>Title</TableColumn>
            <TableColumn>Priority</TableColumn>
            <TableColumn>Due Date</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>{tableRows()}</TableBody>
        </Table>
      </div>

      <Spacer y={4} />

      <div className="flex justify-end">
        <Button
          color="danger"
          startContent={<Minus size={20} />}
          onClick={deleteTaskList}
        >
          Delete TaskList
        </Button>
      </div>

      <Spacer y={4} />
    </div>
  );
};

export default TaskListScreen;