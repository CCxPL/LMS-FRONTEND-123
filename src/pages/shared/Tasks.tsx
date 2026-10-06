import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  MessageSquare,
  Calendar,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';

import {
  getMyTasksApi,
  getTaskUsersApi,
  createTaskApi,
  updateTaskStatusApi,
  addTaskCommentApi,
  deleteTaskApi,
} from '../../api/taskApi';

/* =========================================================
   TYPES
========================================================= */

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

interface Task {
  id: string;

  title: string;
  description: string;

  assignedById: string;
  assignedByName: string;
  assignedByRole: string;

  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;

  status:
    | 'pending'
    | 'in-progress'
    | 'completed';

  priority:
    | 'low'
    | 'medium'
    | 'high';

  dueDate: string;
  createdAt: string;
  completedAt?: string;

  comments: TaskComment[];
}

interface AssignUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

/* =========================================================
   HELPERS
========================================================= */

const getId = (item: any): string => {
  return String(
    item?.id ||
      item?._id ||
      ''
  );
};

const normalizeComment = (
  comment: any
): TaskComment => {
  return {
    id: getId(comment),

    userId: String(
      comment?.userId ||
        comment?.user?.id ||
        comment?.user?._id ||
        ''
    ),

    userName:
      comment?.userName ||
      comment?.user?.name ||
      'User',

    body:
      comment?.body ||
      comment?.comment ||
      '',

    createdAt:
      comment?.createdAt ||
      new Date().toISOString(),
  };
};

const normalizeTask = (
  task: any
): Task => {
  return {
    id: getId(task),

    title:
      task?.title ||
      'Untitled Task',

    description:
      task?.description ||
      '',

    assignedById: String(
      task?.assignedById ||
        task?.assignedBy?.id ||
        task?.assignedBy?._id ||
        ''
    ),

    assignedByName:
      task?.assignedByName ||
      task?.assignedBy?.name ||
      'Unknown',

    assignedByRole:
      task?.assignedByRole ||
      task?.assignedBy?.role ||
      '',

    assignedToId: String(
      task?.assignedToId ||
        task?.assignedTo?.id ||
        task?.assignedTo?._id ||
        ''
    ),

    assignedToName:
      task?.assignedToName ||
      task?.assignedTo?.name ||
      'Unknown',

    assignedToRole:
      task?.assignedToRole ||
      task?.assignedTo?.role ||
      '',

    status:
      task?.status ===
        'in-progress' ||
      task?.status ===
        'completed'
        ? task.status
        : 'pending',

    priority:
      task?.priority ===
        'high' ||
      task?.priority ===
        'low'
        ? task.priority
        : 'medium',

    dueDate:
      task?.dueDate ||
      '',

    createdAt:
      task?.createdAt ||
      '',

    completedAt:
      task?.completedAt ||
      undefined,

    comments:
      Array.isArray(
        task?.comments
      )
        ? task.comments.map(
            normalizeComment
          )
        : [],
  };
};

const normalizeUser = (
  item: any
): AssignUser => {
  return {
    id: getId(item),

    name:
      item?.name ||
      'Unknown User',

    role:
      item?.role ||
      '',

    email:
      item?.email ||
      '',
  };
};

const formatDate = (
  value?: string
): string => {
  if (!value) {
    return 'N/A';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'N/A';
  }

  return date.toLocaleDateString();
};

const formatTime = (
  value?: string
): string => {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Tasks: React.FC = () => {
  const { user } =
    useAuth();

  const { showToast } =
    useToast();

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([]);

  const [
    users,
    setUsers,
  ] = useState<
    AssignUser[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    filter,
    setFilter,
  ] = useState<
    | 'all'
    | 'assigned'
    | 'created'
  >('all');

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<
    Task | null
  >(null);

  const [
    showCreate,
    setShowCreate,
  ] = useState(false);

  const [
    deleteId,
    setDeleteId,
  ] = useState<
    string | null
  >(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState('');

  const [
    desc,
    setDesc,
  ] = useState('');

  const [
    assignTo,
    setAssignTo,
  ] = useState('');

  const [
    dueDate,
    setDueDate,
  ] = useState('');

  const [
    priority,
    setPriority,
  ] = useState<
    | 'low'
    | 'medium'
    | 'high'
  >('medium');

  const [
    commentText,
    setCommentText,
  ] = useState('');

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData =
    useCallback(
      async () => {
        try {
          const [
            tasksRes,
            usersRes,
          ] =
            await Promise.all([
              getMyTasksApi(),
              getTaskUsersApi(),
            ]);

          /*
           * Supports:
           *
           * res.data.tasks
           * res.data.data.tasks
           */

          const rawTasks =
            tasksRes?.data
              ?.data
              ?.tasks ??
            tasksRes?.data
              ?.tasks ??
            [];

          const rawUsers =
            usersRes?.data
              ?.data
              ?.users ??
            usersRes?.data
              ?.users ??
            [];

          const safeTasks =
            Array.isArray(
              rawTasks
            )
              ? rawTasks
                  .map(
                    normalizeTask
                  )
                  .filter(
                    (
                      task
                    ) =>
                      Boolean(
                        task.id
                      )
                  )
              : [];

          const safeUsers =
            Array.isArray(
              rawUsers
            )
              ? rawUsers
                  .map(
                    normalizeUser
                  )
                  .filter(
                    (
                      item
                    ) =>
                      Boolean(
                        item.id
                      )
                  )
              : [];

          setTasks(
            safeTasks
          );

          setUsers(
            safeUsers
          );

          /*
           * Keep currently selected task synced
           * with latest backend data.
           */
          setSelectedTask(
            (
              previous
            ) => {
              if (
                !previous
              ) {
                return null;
              }

              return (
                safeTasks.find(
                  (
                    task
                  ) =>
                    task.id ===
                    previous.id
                ) ||
                null
              );
            }
          );
        } catch (
          error
        ) {
          console.error(
            'Failed to load tasks:',
            error
          );

          setTasks(
            []
          );

          setUsers(
            []
          );

          setSelectedTask(
            null
          );

          showToast(
            'Failed to load tasks',
            'error'
          );
        } finally {
          setIsLoading(
            false
          );
        }
      },
      [showToast]
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =======================================================
     FILTER TASKS
  ======================================================= */

  const myTasks =
    useMemo(() => {
      const currentUserId =
        String(
          user?.id ||
            ''
        );

      return tasks.filter(
        (task) => {
          const isAssigned =
            task.assignedToId ===
            currentUserId;

          const isCreated =
            task.assignedById ===
            currentUserId;

          const isInvolved =
            isAssigned ||
            isCreated;

          if (
            !isInvolved
          ) {
            return false;
          }

          if (
            filter ===
            'assigned'
          ) {
            return isAssigned;
          }

          if (
            filter ===
            'created'
          ) {
            return isCreated;
          }

          return true;
        }
      );
    }, [
      tasks,
      filter,
      user?.id,
    ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      setIsRefreshing(
        true
      );

      try {
        await loadData();

        showToast(
          'Tasks refreshed',
          'success'
        );
      } finally {
        setIsRefreshing(
          false
        );
      }
    };

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm =
    () => {
      setTitle('');
      setDesc('');
      setAssignTo('');
      setDueDate('');
      setPriority(
        'medium'
      );
    };

  /* =======================================================
     CREATE TASK
  ======================================================= */

  const handleCreate =
    async () => {
      if (
        !title.trim() ||
        !assignTo ||
        !dueDate
      ) {
        showToast(
          'Please fill all required fields',
          'error'
        );

        return;
      }

      setIsSubmitting(
        true
      );

      try {
        await createTaskApi(
          {
            title:
              title.trim(),

            description:
              desc.trim(),

            assignedToId:
              assignTo,

            dueDate,

            priority,
          }
        );

        /*
         * Reload from backend instead
         * of creating local fake data.
         */
        await loadData();

        showToast(
          'Task created successfully',
          'success'
        );

        setShowCreate(
          false
        );

        resetForm();
      } catch (
        error
      ) {
        console.error(
          'Create task failed:',
          error
        );

        showToast(
          'Failed to create task',
          'error'
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  /* =======================================================
     STATUS UPDATE
  ======================================================= */

  const handleStatusUpdate =
    async (
      status:
        Task['status']
    ) => {
      if (
        !selectedTask
      ) {
        return;
      }

      try {
        await updateTaskStatusApi(
          selectedTask.id,
          status
        );

        await loadData();

        showToast(
          `Task marked as ${status.replace(
            '-',
            ' '
          )}`,
          'success'
        );
      } catch (
        error
      ) {
        console.error(
          'Status update failed:',
          error
        );

        showToast(
          'Failed to update status',
          'error'
        );
      }
    };

  /* =======================================================
     COMMENT
  ======================================================= */

  const handleComment =
    async () => {
      const body =
        commentText.trim();

      if (
        !body ||
        !selectedTask
      ) {
        return;
      }

      try {
        await addTaskCommentApi(
          selectedTask.id,
          body
        );

        setCommentText(
          ''
        );

        /*
         * Reload actual comment from backend.
         * No fake Date.now() comment ID.
         */
        await loadData();

        showToast(
          'Comment added',
          'success'
        );
      } catch (
        error
      ) {
        console.error(
          'Comment failed:',
          error
        );

        showToast(
          'Failed to add comment',
          'error'
        );
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteConfirm =
    async () => {
      if (
        !deleteId
      ) {
        return;
      }

      try {
        await deleteTaskApi(
          deleteId
        );

        if (
          selectedTask
            ?.id ===
          deleteId
        ) {
          setSelectedTask(
            null
          );
        }

        setDeleteId(
          null
        );

        await loadData();

        showToast(
          'Task deleted',
          'info'
        );
      } catch (
        error
      ) {
        console.error(
          'Delete task failed:',
          error
        );

        showToast(
          'Failed to delete task',
          'error'
        );
      }
    };

  /* =======================================================
     UI HELPERS
  ======================================================= */

  const getPriorityStyles =
    (
      value: string
    ) => {
      switch (
        value
      ) {
        case 'high':
          return 'bg-gray-900 text-white';

        case 'medium':
          return 'bg-gray-200 text-gray-800';

        default:
          return 'bg-gray-100 text-gray-600';
      }
    };

  const getStatusIcon =
    (
      status: string
    ) => {
      switch (
        status
      ) {
        case 'completed':
          return (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          );

        case 'in-progress':
          return (
            <Clock className="w-4 h-4 text-amber-500" />
          );

        default:
          return (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          );
      }
    };

  /* =======================================================
     LOADER
  ======================================================= */

  if (
    isLoading
  ) {
    return (
      <Loader text="Loading tasks..." />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tasks
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage your tasks and assignments
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={
              handleRefresh
            }
            disabled={
              isRefreshing
            }
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </Button>

          <Button
            onClick={() =>
              setShowCreate(
                true
              )
            }
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* CONTENT */}

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{
          minHeight:
            'calc(100vh - 220px)',
        }}
      >
        {/* TASK LIST */}

        <Card
          padding="none"
          className="flex flex-col overflow-hidden"
        >
          {/* FILTERS */}

          <div className="flex p-2 bg-gray-50 border-b border-gray-200">
            {(
              [
                'all',
                'assigned',
                'created',
              ] as const
            ).map(
              (
                item
              ) => (
                <button
                  key={
                    item
                  }
                  onClick={() => {
                    setFilter(
                      item
                    );

                    setSelectedTask(
                      null
                    );
                  }}
                  className={`flex-1 py-2 text-xs font-medium uppercase rounded-lg transition-all ${
                    filter ===
                    item
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* TASKS */}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {myTasks.length ===
            0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />

                <p className="text-sm">
                  No tasks found
                </p>
              </div>
            ) : (
              myTasks.map(
                (
                  task
                ) => (
                  <div
                    key={
                      task.id
                    }
                    onClick={() =>
                      setSelectedTask(
                        task
                      )
                    }
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTask
                        ?.id ===
                      task.id
                        ? 'border-black bg-gray-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityStyles(
                          task.priority
                        )}`}
                      >
                        {
                          task.priority
                        }
                      </span>

                      {getStatusIcon(
                        task.status
                      )}
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {
                        task.title
                      }
                    </h4>

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                      <span>
                        {task.assignedToId ===
                        String(
                          user?.id ||
                            ''
                        )
                          ? 'Assigned to me'
                          : task.assignedToName ||
                            'Unknown'}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />

                        {formatDate(
                          task.dueDate
                        )}
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </Card>

        {/* TASK DETAILS */}

        <Card
          padding="none"
          className="lg:col-span-2 flex flex-col overflow-hidden"
        >
          {selectedTask ? (
            <>
              {/* DETAIL HEADER */}

              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                        selectedTask.status ===
                        'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedTask.status ===
                              'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedTask.status.replace(
                        '-',
                        ' '
                      )}
                    </span>

                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityStyles(
                        selectedTask.priority
                      )}`}
                    >
                      {
                        selectedTask.priority
                      }
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {
                      selectedTask.title
                    }
                  </h2>
                </div>

                {selectedTask.assignedById ===
                  String(
                    user?.id ||
                      ''
                  ) && (
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteId(
                        selectedTask.id
                      )
                    }
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* DETAIL BODY */}

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    {
                      label:
                        'Assigned By',

                      value:
                        selectedTask.assignedByName ||
                        'Unknown',
                    },

                    {
                      label:
                        'Assigned To',

                      value:
                        selectedTask.assignedToName ||
                        'Unknown',
                    },

                    {
                      label:
                        'Due Date',

                      value:
                        formatDate(
                          selectedTask.dueDate
                        ),
                    },

                    {
                      label:
                        'Priority',

                      value:
                        selectedTask.priority,
                    },
                  ].map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.label
                        }
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="block text-gray-500 text-xs mb-1">
                          {
                            item.label
                          }
                        </span>

                        <span className="font-medium text-gray-900 capitalize">
                          {
                            item.value
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* DESCRIPTION */}

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Description
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedTask.description ||
                      'No description provided.'}
                  </p>
                </div>

                {/* COMMENTS */}

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />

                    Comments (
                    {selectedTask
                      .comments
                      ?.length ??
                      0}
                    )
                  </h3>

                  {(selectedTask
                    .comments
                    ?.length ??
                    0) ===
                  0 ? (
                    <p className="text-sm text-gray-400 italic">
                      No comments yet
                    </p>
                  ) : (
                    selectedTask.comments.map(
                      (
                        comment,
                        index
                      ) => (
                        <div
                          key={
                            comment.id ||
                            `${selectedTask.id}-comment-${index}`
                          }
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.userName ||
                                'User'}
                            </span>

                            <span className="text-xs text-gray-400">
                              {formatTime(
                                comment.createdAt
                              )}
                            </span>
                          </div>

                          <p className="text-gray-700 text-sm">
                            {
                              comment.body
                            }
                          </p>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              {/* DETAIL FOOTER */}

              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Add a comment..."
                    value={
                      commentText
                    }
                    onChange={(
                      event
                    ) =>
                      setCommentText(
                        event
                          .target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        'Enter'
                      ) {
                        event.preventDefault();

                        void handleComment();
                      }
                    }}
                  />

                  <Button
                    onClick={
                      handleComment
                    }
                    disabled={
                      !commentText.trim()
                    }
                  >
                    Post
                  </Button>
                </div>

                {selectedTask.assignedToId ===
                  String(
                    user?.id ||
                      ''
                  ) &&
                  selectedTask.status !==
                    'completed' && (
                    <div className="flex gap-2">
                      <Button
                        fullWidth
                        onClick={() =>
                          handleStatusUpdate(
                            'completed'
                          )
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </Button>

                      {selectedTask.status ===
                        'pending' && (
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() =>
                            handleStatusUpdate(
                              'in-progress'
                            )
                          }
                        >
                          <Clock className="w-4 h-4" />
                          Start Progress
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20">
              <AlertCircle className="w-12 h-12 mb-3 opacity-20" />

              <p className="font-medium">
                Select a task to view details
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* CREATE TASK MODAL */}

      <Modal
        isOpen={
          showCreate
        }
        onClose={() => {
          setShowCreate(
            false
          );

          resetForm();
        }}
        title="Create New Task"
      >
        <div className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Review monthly report"
            value={title}
            onChange={(
              event
            ) =>
              setTitle(
                event.target
                  .value
              )
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign To *
            </label>

            <select
              className="input-field"
              value={
                assignTo
              }
              onChange={(
                event
              ) =>
                setAssignTo(
                  event
                    .target
                    .value
                )
              }
            >
              <option value="">
                Select User
              </option>

              {users.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }{' '}
                    (
                    {
                      item.role
                    }
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date *"
              type="date"
              value={
                dueDate
              }
              onChange={(
                event
              ) =>
                setDueDate(
                  event
                    .target
                    .value
                )
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority
              </label>

              <select
                className="input-field"
                value={
                  priority
                }
                onChange={(
                  event
                ) =>
                  setPriority(
                    event
                      .target
                      .value as
                      | 'low'
                      | 'medium'
                      | 'high'
                  )
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>

            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Task details..."
              value={desc}
              onChange={(
                event
              ) =>
                setDesc(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(
                  false
                );

                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleCreate
              }
              isLoading={
                isSubmitting
              }
            >
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM */}

      <ConfirmDialog
        isOpen={
          Boolean(
            deleteId
          )
        }
        onClose={() =>
          setDeleteId(
            null
          )
        }
        onConfirm={
          handleDeleteConfirm
        }
        title="Delete Task?"
        message="This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default Tasks;