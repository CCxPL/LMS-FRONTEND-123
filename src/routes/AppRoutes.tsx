import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';

// Layouts
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import NotFound from '../pages/shared/NotFound';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Shared Pages
import Messages from '../pages/shared/Messages';
import Tasks from '../pages/shared/Tasks';
import Notifications from '../pages/shared/Notifications';

// Super Admin Pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import ManageAdmins from '../pages/super-admin/ManageAdmins';
import ManageUsers from '../pages/super-admin/ManageUsers';
import AllTeachers from '../pages/super-admin/AllTeachers';
import PlatformStats from '../pages/super-admin/PlatformStats';
import Settings from '../pages/super-admin/Settings';
import SuperAdminSchedule from '../pages/super-admin/Schedule';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import ManageTeachers from '../pages/admin/ManageTeachers';
import ManageCourses from '../pages/admin/ManageCourses';
import ManageStudents from '../pages/admin/ManageStudents';
import Activity from '../pages/admin/Activity';
import AdminSchedule from '../pages/admin/Schedule';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherMyCourses from '../pages/teacher/MyCourses';
import CreateCourse from '../pages/teacher/CreateCourse';
import TeacherAssignments from '../pages/teacher/Assignments';
import GradeAssignment from '../pages/teacher/GradeAssignment';
import TeacherQuizzes from '../pages/teacher/Quizzes';
import CreateQuiz from '../pages/teacher/CreateQuiz';
import MyStudents from '../pages/teacher/MyStudents';
import StudentFeedback from '../pages/teacher/StudentFeedback';
import CourseDetail from '../pages/teacher/CourseDetail';
import TeacherSchedule from '../pages/teacher/Schedule';



// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentMyCourses from '../pages/student/MyCourses';
import BrowseCourses from '../pages/student/BrowseCourses';
import CourseEnroll from '../pages/student/CourseEnroll';
import CourseView from '../pages/student/CourseView';
import StudentAssignments from '../pages/student/Assignments';
import SubmitAssignment from '../pages/student/SubmitAssignment';
import StudentQuizzes from '../pages/student/Quizzes';
import AttemptQuiz from '../pages/student/AttemptQuiz';
import GiveFeedback from '../pages/student/GiveFeedback';
import Certificates from '../pages/student/Certificates';
import Progress from '../pages/student/Progress';
import LeaderboardPage from '../pages/student/LeaderboardPage';
import DiscussionPage from '../pages/student/DiscussionPage';
import StudentSchedule from '../pages/student/Schedule';

// ✅ ADD: Attendance Report Page
import StudentAttendanceReport from '../pages/teacher/StudentAttendanceReport';
import FeedbackManagement from '../pages/super-admin/FeedbackManagement';
import BatchSelection from '../pages/teacher/BatchSelection';
import TeacherLeaves from '../pages/teacher/TeacherLeaves';
import CertificateApprovals from '../pages/teacher/CertificateApprovals';
import CertificateManagement from '../pages/admin/CertificateManagement';


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['super-admin']}>
              <SuperAdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="manage-admins" element={<ManageAdmins />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="all-teachers" element={<AllTeachers />} />
        <Route path="platform-stats" element={<PlatformStats />} />
        <Route path="feedback-management" element={<FeedbackManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="schedule" element={<SuperAdminSchedule />} />
        <Route path="attendance-report" element={<StudentAttendanceReport />} /> {/* ✅ ADD */}
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="manage-teachers" element={<ManageTeachers />} />
        <Route path="certificate-management" element={<CertificateManagement />} />
        <Route path="manage-courses" element={<ManageCourses />} />
        <Route path="manage-students" element={<ManageStudents />} />
        <Route path="activity" element={<Activity />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="attendance-report" element={<StudentAttendanceReport />} /> {/* ✅ ADD */}
      </Route>

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['teacher']}>
              <TeacherLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="my-courses" element={<TeacherMyCourses />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="course/:id" element={<CourseDetail />} />
        <Route path="/teacher/course/:courseId/batches" element={<BatchSelection />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="grade-assignments" element={<GradeAssignment />} />
        <Route path="certificate-approvals" element={<CertificateApprovals />} />
        <Route path="quizzes" element={<TeacherQuizzes />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="create-quiz" element={<CreateQuiz />} />
        <Route path="my-students" element={<MyStudents />} />
        <Route path="feedback" element={<StudentFeedback />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="attendance-report" element={<StudentAttendanceReport />} /> 
        <Route path="leaves" element={<TeacherLeaves />} />{/* ✅ ADD */}
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['student']}>
              <StudentLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="my-courses" element={<StudentMyCourses />} />
        <Route path="browse-courses" element={<BrowseCourses />} />
        <Route path="course-enroll/:id" element={<CourseEnroll />} />
        <Route path="course/:id" element={<CourseView />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="submit-assignment/:id" element={<SubmitAssignment />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quiz/:id" element={<AttemptQuiz />} />
        <Route path="feedback" element={<GiveFeedback />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="discussion" element={<DiscussionPage />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="progress" element={<Progress />} />
        <Route path="schedule" element={<StudentSchedule />} />
      </Route>

      {/* Default & 404 Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;