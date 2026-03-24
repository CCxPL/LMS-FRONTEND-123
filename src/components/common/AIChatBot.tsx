import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Bot, Sparkles, ArrowRight, Lightbulb, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// --- Types ---
interface Message {
  id: string;
  text: string | React.ReactNode;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
} 

interface KnowledgeItem {
  text: string;
  link: string | null;
  suggestions: string[];
  keywords: string[];
}

interface RoleKnowledge {
  [key: string]: KnowledgeItem;
}

// --- COMPLETE KNOWLEDGE BASE (ENGLISH) ---
const KNOWLEDGE_BASE: { [role: string]: RoleKnowledge } = {
  // 🎓 STUDENT COMPLETE GUIDE
  student: {
    'dashboard': {
      text: `🏠 **Student Dashboard**

Here you will find:
• **Progress Overview** - Your learning progress
• **Upcoming Deadlines** - Assignment/Quiz due dates
• **Recent Courses** - Courses you are studying
• **Stats Cards** - Total courses, completed, pending
• **Streak & Badges** - Gamification rewards

**Buttons:**
• Resume Learning - Continue where you left off
• View All - See all details`,
      link: '/student/dashboard',
      suggestions: ['My Courses', 'Assignments', 'Quizzes', 'Progress'],
      keywords: ['dashboard', 'home', 'main', 'start', 'progress', 'stats', 'streak', 'badge', 'resume', 'overview']
    },
    'my-courses': {
      text: `📚 **My Courses Page**

Here are your enrolled courses:
• **Course Cards** - Thumbnail, title, progress bar
• **Progress %** - How much is completed
• **Continue Button** - Resume the course
• **Certificate** - Download when 100% complete

**How to use:**
1. Click on a course card
2. Press "Continue Learning"
3. Watch videos, take quizzes`,
      link: '/student/my-courses',
      suggestions: ['Browse Courses', 'Certificates', 'Progress', 'Dashboard'],
      keywords: ['my courses', 'enrolled', 'learning', 'continue', 'course list', 'my course', 'enrolled courses']
    },
    'browse': {
      text: `🔍 **Browse Courses**

Find new courses here:
• **Search Bar** - Search by course name
• **Filters** - Filter by Category, Level, Price
• **Course Cards** - Preview with ratings
• **Enroll Button** - Join the course

**Categories:** Programming, Design, Business, etc.
**Levels:** Beginner, Intermediate, Advanced`,
      link: '/student/browse-courses',
      suggestions: ['My Courses', 'Dashboard', 'Categories'],
      keywords: ['browse', 'search', 'find', 'new course', 'enroll', 'join', 'explore', 'discover', 'new']
    },
    'leaderboard': {
      text: `🏆 **Leaderboard Page**

See the competition here:
• **Rankings** - Top students list
• **Points** - Earned from Quiz/Assignment marks
• **Your Rank** - Your position
• **Weekly/Monthly** - Time filters

**How to earn points:**
• Quiz complete = +10 points
• Assignment submit = +15 points
• Course complete = +50 points
• Daily login = +5 points`,
      link: '/student/leaderboard',
      suggestions: ['Dashboard', 'Quizzes', 'Achievements'],
      keywords: ['leaderboard', 'rank', 'ranking', 'top', 'points', 'competition', 'winner', 'score', 'position']
    },
    'discussion': {
      text: `💬 **Discussion Forum**

Ask doubts and help others:
• **Topics** - Subject-wise threads
• **Ask Question** - Post a new doubt
• **Reply** - Help others
• **Upvote** - Vote for good answers

**Rules:**
• Be respectful
• Write clear questions
• You can attach screenshots`,
      link: '/student/discussion',
      suggestions: ['Messages', 'My Courses', 'Help'],
      keywords: ['discussion', 'forum', 'doubt', 'question', 'ask', 'help', 'community', 'chat', 'query']
    },
    'assignments': {
      text: `📝 **Assignments Page**

Submit your homework here:
• **Pending** - To be done (Orange badge)
• **Submitted** - Already sent (Blue badge)
• **Graded** - Teacher checked (Green badge)
• **Overdue** - Past deadline (Red badge)

**How to submit:**
1. Click on an assignment
2. Press "View Details"
3. Upload file or write text
4. Click "Submit" button

**Supported formats:** PDF, DOC, DOCX, Images`,
      link: '/student/assignments',
      suggestions: ['Quizzes', 'My Courses', 'Grades'],
      keywords: ['assignment', 'homework', 'submit', 'pending', 'graded', 'upload', 'file', 'work', 'task']
    },
    'quizzes': {
      text: `✍️ **Quizzes Page**

Take tests here:
• **Available** - Quizzes you can take
• **Completed** - Already taken
• **Score** - View your marks
• **Review** - Check wrong answers

**During quiz:**
• Timer will run (Be careful!)
• MCQ or Text answers
• Submit button at the end
• Auto-submit on timeout

**Tips:**
• Read questions carefully
• Manage your time
• Review before submitting`,
      link: '/student/quizzes',
      suggestions: ['Assignments', 'Leaderboard', 'My Courses'],
      keywords: ['quiz', 'test', 'exam', 'mcq', 'attempt', 'score', 'marks', 'paper', 'examination']
    },
    'messages': {
      text: `💌 **Messages Page**

Talk to your teachers:
• **Inbox** - Received messages
• **Sent** - Messages you sent
• **Compose** - Write a new message
• **Search** - Find messages

**To send a message:**
1. Click "New Message"
2. Select a teacher
3. Write subject and message
4. Press Send`,
      link: '/student/messages',
      suggestions: ['Discussion', 'Feedback', 'Notifications'],
      keywords: ['message', 'inbox', 'send', 'teacher', 'contact', 'mail', 'talk', 'communicate']
    },
    'feedback': {
      text: `⭐ **Feedback Page**

Rate your courses:
• **Star Rating** - Give 1-5 stars
• **Review** - Write your experience
• **Course Feedback** - For specific courses
• **Teacher Rating** - Rate the instructor

**Why it's important:**
• Helps teachers improve
• Helps other students choose courses`,
      link: '/student/feedback',
      suggestions: ['My Courses', 'Certificates', 'Dashboard'],
      keywords: ['feedback', 'review', 'rating', 'star', 'opinion', 'rate', 'comment']
    },
    'certificates': {
      text: `🎓 **Certificates Page**

View your certificates:
• **Earned** - Certificates you got
• **Download** - Download as PDF
• **Share** - Share on LinkedIn
• **Verify** - Check certificate ID

**When do you get a certificate:**
• Complete course 100%
• Pass all quizzes
• Submit all assignments`,
      link: '/student/certificates',
      suggestions: ['My Courses', 'Progress', 'Achievements'],
      keywords: ['certificate', 'download', 'earned', 'completion', 'proof', 'credential', 'diploma']
    },
    'notifications': {
      text: `🔔 **Notifications Page**

See updates here:
• **New** - Unread notifications
• **All** - All notifications
• **Mark Read** - Mark as read
• **Settings** - Choose which notifications you want

**Types:**
• Assignment due reminders
• Quiz available alerts
• Grade announcements
• Teacher messages`,
      link: '/student/notifications',
      suggestions: ['Dashboard', 'Settings', 'Messages'],
      keywords: ['notification', 'alert', 'update', 'bell', 'remind', 'notice', 'updates']
    },
    'progress': {
      text: `📊 **Progress Page**

Track your growth:
• **Overall Progress** - Total completion %
• **Course-wise** - Progress for each course
• **Time Spent** - Hours spent learning
• **Achievements** - Badges earned

**Charts:**
• Weekly learning graph
• Subject-wise performance
• Quiz score trends`,
      link: '/student/progress',
      suggestions: ['Dashboard', 'Leaderboard', 'Certificates'],
      keywords: ['progress', 'growth', 'track', 'analytics', 'performance', 'improvement', 'stats']
    },
    'schedule': {
      text: `📅 **Schedule Page**

View your class schedule:
• **Calendar View** - Monthly/Weekly view
• **Upcoming Classes** - Next sessions
• **Live Classes** - Join online sessions
• **Reminders** - Get notified before class

**Features:**
• Sync with Google Calendar
• Set personal reminders
• View teacher availability`,
      link: '/student/schedule',
      suggestions: ['Dashboard', 'My Courses', 'Notifications'],
      keywords: ['schedule', 'calendar', 'timetable', 'class', 'timing', 'session', 'live']
    },
    'achievements': {
      text: `🏅 **Achievements Page**

View your badges and rewards:
• **Badges** - Earned for milestones
• **Streaks** - Daily login streaks
• **Points** - Total points earned
• **Levels** - Your current level

**How to earn:**
• Complete courses
• Pass quizzes with high scores
• Help others in discussions
• Daily logins`,
      link: '/student/achievements',
      suggestions: ['Leaderboard', 'Progress', 'Dashboard'],
      keywords: ['achievement', 'badge', 'reward', 'streak', 'level', 'milestone', 'trophy']
    },
    'settings': {
      text: `⚙️ **Settings Page**

Customize your account:
• **Profile** - Update your info
• **Password** - Change password
• **Notifications** - Manage alerts
• **Privacy** - Privacy settings
• **Theme** - Light/Dark mode

**Options:**
• Email preferences
• Language settings
• Account deletion`,
      link: '/student/settings',
      suggestions: ['Profile', 'Dashboard', 'Notifications'],
      keywords: ['settings', 'preferences', 'account', 'profile', 'password', 'theme', 'privacy']
    }
  },

  // 👨‍🏫 TEACHER COMPLETE GUIDE
  teacher: {
    'dashboard': {
      text: `🏠 **Teacher Dashboard**

Your teaching hub:
• **Stats** - Students, Courses, Earnings
• **Recent Activity** - Latest submissions
• **Quick Actions** - Create course, grade work
• **Analytics** - Performance graphs

**Cards:**
• Total Students enrolled
• Active Courses count
• Pending assignments to grade
• This month earnings`,
      link: '/teacher/dashboard',
      suggestions: ['Create Course', 'My Students', 'Grade Work', 'Analytics'],
      keywords: ['dashboard', 'home', 'overview', 'stats', 'teaching', 'main']
    },
    'my-courses': {
      text: `📚 **My Courses Page**

Your created courses:
• **Published** - Live courses
• **Draft** - Not yet complete
• **Edit** - Modify course
• **Analytics** - Per course stats

**Actions:**
• Edit Content - Update lessons
• View Students - See who is enrolled
• Delete - Remove course (be careful!)`,
      link: '/teacher/my-courses',
      suggestions: ['Create Course', 'Dashboard', 'Students'],
      keywords: ['my courses', 'created', 'published', 'draft', 'edit', 'course']
    },
    'create-course': {
      text: `🚀 **Create Course Page**

Create a new course:
**Step 1: Basic Info**
• Title - Course name
• Description - What you'll teach
• Category - Choose subject
• Price - Free or paid

**Step 2: Curriculum**
• Add Module - Create sections
• Add Lesson - Add videos/text
• Upload - Upload video files

**Step 3: Settings**
• Thumbnail - Cover image
• Preview Video - Free intro
• Requirements - Prerequisites

**Step 4: Publish**
• Save Draft - Complete later
• Publish - Make it live`,
      link: '/teacher/create-course',
      suggestions: ['My Courses', 'Dashboard', 'Upload Video'],
      keywords: ['create', 'new course', 'build', 'make', 'new', 'add course']
    },
    'assignments': {
      text: `📝 **Assignments Page**

Manage homework:
• **Create** - Create new assignment
• **View All** - All assignments
• **Submissions** - Student submissions
• **Due Date** - Set deadlines

**To create an assignment:**
1. Click "Create Assignment"
2. Write title and instructions
3. Select course
4. Set due date
5. Add marks weightage
6. Publish`,
      link: '/teacher/assignments',
      suggestions: ['Grade Work', 'Quizzes', 'My Courses'],
      keywords: ['assignment', 'homework', 'create', 'task', 'work']
    },
    'grade-work': {
      text: `✅ **Grade Work Page**

Check submissions:
• **Pending** - Needs grading
• **Graded** - Already checked
• **Filter** - By Course/Assignment
• **Bulk Grade** - Multiple at once

**Grading process:**
1. Click on a submission
2. View student's work
3. Give marks (out of 100)
4. Write feedback
5. Submit grade`,
      link: '/teacher/grade-assignments',
      suggestions: ['Assignments', 'My Students', 'Dashboard'],
      keywords: ['grade', 'check', 'marks', 'evaluate', 'feedback', 'correct', 'score']
    },
    'quizzes': {
      text: `❓ **Quizzes Page**

Manage quizzes:
• **All Quizzes** - List of quizzes
• **Results** - Student scores
• **Analytics** - Question-wise stats
• **Edit** - Modify quiz

**Quiz features:**
• MCQ questions
• True/False
• Short answer
• Time limit setting
• Set passing marks`,
      link: '/teacher/quizzes',
      suggestions: ['Create Quiz', 'Grade Work', 'Analytics'],
      keywords: ['quiz', 'quizzes', 'test', 'list', 'manage']
    },
    'create-quiz': {
      text: `📝 **Create Quiz Page**

Create a new quiz:
**Step 1: Basic**
• Quiz title
• Select course
• Time limit (minutes)
• Passing marks %

**Step 2: Questions**
• Add Question button
• Question type (MCQ/Text)
• Add options
• Mark correct answer
• Marks per question

**Step 3: Settings**
• Shuffle questions
• Show answers after submit
• Allow multiple attempts?

**Step 4: Publish**
• Save as draft
• Or publish immediately`,
      link: '/teacher/create-quiz',
      suggestions: ['Quizzes', 'My Courses', 'Dashboard'],
      keywords: ['create quiz', 'new quiz', 'make quiz', 'add quiz', 'test create']
    },
    'my-students': {
      text: `👥 **My Students Page**

View your students:
• **Student List** - All enrolled students
• **Progress** - Their progress
• **Filter** - By course
• **Search** - Search by name

**Actions:**
• View Profile - See details
• Send Message - Direct message
• View Progress - Detailed analytics
• Download Report - PDF report`,
      link: '/teacher/my-students',
      suggestions: ['Messages', 'Dashboard', 'Grade Work'],
      keywords: ['student', 'enrolled', 'learner', 'class', 'batch', 'students']
    },
    'messages': {
      text: `💌 **Messages Page**

Talk to students:
• **Inbox** - Received messages
• **Sent** - Messages sent
• **Compose** - Write new message
• **Bulk Message** - Message multiple students

**Features:**
• Attach files
• Quick reply
• Mark important
• Search messages`,
      link: '/teacher/messages',
      suggestions: ['My Students', 'Notifications', 'Dashboard'],
      keywords: ['message', 'inbox', 'send', 'student', 'contact', 'communicate']
    },
    'feedback': {
      text: `⭐ **Feedback Page**

View student feedback:
• **Course Reviews** - Ratings & comments
• **Overall Rating** - Average stars
• **Recent** - Latest feedback
• **Respond** - Reply to reviews

**Use feedback to:**
• Improve course content
• Understand student needs
• Fix problems quickly`,
      link: '/teacher/feedback',
      suggestions: ['My Courses', 'Dashboard', 'Analytics'],
      keywords: ['feedback', 'review', 'rating', 'opinion', 'comments']
    },
    'notifications': {
      text: `🔔 **Notifications Page**

View updates:
• **New Submissions** - Assignment/Quiz submitted
• **Messages** - New student messages
• **Course Updates** - Enrollment alerts
• **System** - Platform announcements

**Settings:**
• Email notifications on/off
• Push notifications
• Frequency settings`,
      link: '/teacher/notifications',
      suggestions: ['Dashboard', 'Messages', 'Settings'],
      keywords: ['notification', 'alert', 'update', 'bell', 'notice']
    },
    'analytics': {
      text: `📊 **Analytics Page**

View your performance:
• **Course Performance** - Enrollment, completion rates
• **Student Engagement** - Active learners
• **Revenue** - Earnings breakdown
• **Quiz Analytics** - Question difficulty

**Charts:**
• Monthly enrollments
• Revenue trends
• Student progress
• Completion rates`,
      link: '/teacher/analytics',
      suggestions: ['Dashboard', 'My Courses', 'Students'],
      keywords: ['analytics', 'stats', 'performance', 'data', 'report', 'insights']
    },
    'schedule': {
      text: `📅 **Schedule Page**

Manage your class schedule:
• **Calendar View** - View all classes
• **Create Class** - Schedule new session
• **Live Class** - Start online session
• **Availability** - Set your availability

**Features:**
• Recurring classes
• Send reminders to students
• Integration with Zoom/Meet`,
      link: '/teacher/schedule',
      suggestions: ['Dashboard', 'My Courses', 'Students'],
      keywords: ['schedule', 'calendar', 'timetable', 'class', 'timing', 'session', 'live']
    },
    'earnings': {
      text: `💰 **Earnings Page**

Track your income:
• **Total Earnings** - All time earnings
• **This Month** - Current month
• **Pending** - Awaiting payout
• **Withdraw** - Request payout

**Details:**
• Course-wise breakdown
• Transaction history
• Payout schedule
• Tax information`,
      link: '/teacher/earnings',
      suggestions: ['Dashboard', 'Analytics', 'Settings'],
      keywords: ['earnings', 'money', 'income', 'revenue', 'payout', 'withdraw', 'payment']
    },
    'settings': {
      text: `⚙️ **Settings Page**

Manage your account:
• **Profile** - Update your info
• **Password** - Change password
• **Notifications** - Manage alerts
• **Payout** - Payment settings
• **Privacy** - Privacy controls

**Options:**
• Bio and expertise
• Social media links
• Email preferences`,
      link: '/teacher/settings',
      suggestions: ['Profile', 'Dashboard', 'Earnings'],
      keywords: ['settings', 'preferences', 'account', 'profile', 'password']
    }
  },

  // 🛡️ ADMIN COMPLETE GUIDE
  admin: {
    'dashboard': {
      text: `📊 **Admin Dashboard**

Platform overview:
• **Total Users** - Students + Teachers count
• **Active Courses** - Live courses
• **Today's Activity** - Recent actions
• **Quick Stats** - Revenue, signups

**Widgets:**
• User growth chart
• Course popularity
• Recent registrations
• System health`,
      link: '/admin/dashboard',
      suggestions: ['Teachers', 'Students', 'Courses', 'Reports'],
      keywords: ['dashboard', 'home', 'overview', 'admin', 'main']
    },
    'teachers': {
      text: `👨‍🏫 **Teachers Page**

Teacher management:
• **All Teachers** - Complete list
• **Pending Verification** - New applicants
• **Verified** - Approved teachers
• **Blocked** - Suspended accounts

**Actions:**
• Approve - Verify the teacher
• Reject - Deny application
• View Profile - See details
• Suspend - Temporarily block`,
      link: '/admin/teachers',
      suggestions: ['Students', 'Courses', 'Verification'],
      keywords: ['teacher', 'instructor', 'faculty', 'verify', 'approve']
    },
    'courses': {
      text: `📚 **Courses Page**

Course management:
• **All Courses** - Complete list
• **Published** - Live courses
• **Under Review** - Needs approval
• **Reported** - Complaints received

**Actions:**
• Approve - Publish the course
• Reject - Don't allow
• Feature - Show on homepage
• Remove - Delete from platform`,
      link: '/admin/courses',
      suggestions: ['Teachers', 'Students', 'Reports'],
      keywords: ['course', 'content', 'curriculum', 'approve', 'review']
    },
    'students': {
      text: `👥 **Students Page**

Student management:
• **All Students** - Complete list
• **Active** - Currently learning
• **Inactive** - Not active recently
• **Blocked** - Suspended accounts

**Actions:**
• View Profile - See details
• Send Message - Direct contact
• Suspend - Block temporarily
• Delete - Remove account`,
      link: '/admin/students',
      suggestions: ['Teachers', 'Activity', 'Reports'],
      keywords: ['student', 'learner', 'user', 'manage']
    },
    'messages': {
      text: `💌 **Messages Page**

Communication hub:
• **Inbox** - All messages
• **Announcements** - Broadcast messages
• **Support** - User queries
• **Compose** - Send new message

**Features:**
• Bulk messaging
• Template messages
• Priority flags
• Auto-replies`,
      link: '/admin/messages',
      suggestions: ['Notifications', 'Dashboard', 'Support'],
      keywords: ['message', 'inbox', 'send', 'contact', 'announce']
    },
    'reports': {
      text: `📈 **Reports Page**

View platform reports:
• **User Reports** - User statistics
• **Course Reports** - Course analytics
• **Revenue Reports** - Financial data
• **Activity Reports** - Platform usage

**Export:**
• Download as PDF
• Export to Excel
• Schedule reports`,
      link: '/admin/reports',
      suggestions: ['Dashboard', 'Analytics', 'Activity'],
      keywords: ['report', 'analytics', 'stats', 'data', 'export']
    },
    'notifications': {
      text: `🔔 **Notifications Page**

System alerts:
• **New Users** - Registrations
• **Reports** - User complaints
• **System** - Technical alerts
• **Payments** - Transaction updates

**Manage:**
• Mark as read
• Filter by type
• Clear all
• Notification settings`,
      link: '/admin/notifications',
      suggestions: ['Dashboard', 'Activity', 'Messages'],
      keywords: ['notification', 'alert', 'update', 'bell']
    },
    'activity': {
      text: `📋 **Activity Page**

Platform activity log:
• **User Actions** - Login, logout, etc.
• **Course Actions** - Created, updated
• **Admin Actions** - What admins did
• **System Logs** - Technical events

**Filters:**
• By user type
• By action type
• By date range
• Search by user`,
      link: '/admin/activity',
      suggestions: ['Dashboard', 'Students', 'Reports'],
      keywords: ['activity', 'log', 'history', 'audit', 'record']
    },
    'support': {
      text: `🎧 **Support Page**

Handle user support:
• **Open Tickets** - Pending issues
• **Resolved** - Closed tickets
• **Priority** - Urgent issues
• **Categories** - Issue types

**Actions:**
• Reply to ticket
• Assign to team
• Escalate issue
• Close ticket`,
      link: '/admin/support',
      suggestions: ['Messages', 'Activity', 'Dashboard'],
      keywords: ['support', 'ticket', 'help', 'issue', 'query', 'problem']
    },
    'settings': {
      text: `⚙️ **Settings Page**

Admin settings:
• **Profile** - Your admin profile
• **System** - Platform settings
• **Email** - Email templates
• **Security** - Access controls

**Options:**
• Site maintenance mode
• Email configurations
• Backup settings`,
      link: '/admin/settings',
      suggestions: ['Dashboard', 'Security', 'Profile'],
      keywords: ['settings', 'config', 'preferences', 'system']
    }
  },

  // 👑 SUPER ADMIN COMPLETE GUIDE
  'super-admin': {
    'dashboard': {
      text: `📊 **Super Admin Dashboard**

Complete platform control:
• **Total Stats** - Users, Revenue, Courses
• **Admin Activity** - What admins are doing
• **System Health** - Server status
• **Revenue Graph** - Earnings chart

**Quick Actions:**
• Add new admin
• Broadcast message
• System settings
• View reports`,
      link: '/super-admin/dashboard',
      suggestions: ['Admins', 'Users', 'Stats', 'Settings'],
      keywords: ['dashboard', 'home', 'overview', 'main', 'control']
    },
    'admins': {
      text: `🛡️ **Manage Admins Page**

Admin management:
• **All Admins** - Admin list
• **Add Admin** - Create new admin
• **Permissions** - Access control
• **Activity** - Admin logs

**Create Admin:**
1. Click "Add Admin"
2. Enter details (name, email)
3. Set password
4. Choose permissions
5. Save

**Permissions:**
• Manage Teachers
• Manage Students
• Manage Courses
• View Reports only`,
      link: '/super-admin/manage-admins',
      suggestions: ['Users', 'Dashboard', 'Permissions'],
      keywords: ['admin', 'manage', 'create', 'permission', 'access']
    },
    'users': {
      text: `👥 **Manage Users Page**

All users control:
• **All Users** - Complete list
• **Filter** - By role (Student/Teacher)
• **Search** - Find specific user
• **Bulk Actions** - Multiple users at once

**Actions:**
• Edit - Modify user details
• Reset Password - New password
• Suspend - Block temporarily
• Delete - Remove permanently
• Import PDF - Bulk add users

**Import PDF feature:**
• Upload PDF with user list
• System extracts data
• Auto-creates accounts
• Sends login emails`,
      link: '/super-admin/manage-users',
      suggestions: ['Teachers', 'Admins', 'Import'],
      keywords: ['user', 'manage', 'all', 'import', 'pdf', 'bulk']
    },
    'teachers': {
      text: `👨‍🏫 **All Teachers Page**

Teacher oversight:
• **Verified Teachers** - Approved list
• **Pending** - Awaiting verification
• **Top Performers** - Best rated
• **Suspended** - Blocked accounts

**Super Admin Actions:**
• Force verify
• Override admin decisions
• Set as featured teacher
• Revenue sharing settings`,
      link: '/super-admin/all-teachers',
      suggestions: ['Users', 'Dashboard', 'Verification'],
      keywords: ['teacher', 'instructor', 'verify', 'all']
    },
    'messages': {
      text: `💌 **Messages Page**

Platform-wide messaging:
• **System Announcements** - Broadcast to all
• **Admin Messages** - To/from admins
• **Support Escalations** - Critical issues
• **Templates** - Pre-made messages

**Broadcast:**
• To all users
• To specific role
• Schedule messages
• Emergency alerts`,
      link: '/super-admin/messages',
      suggestions: ['Notifications', 'Dashboard', 'Announcements'],
      keywords: ['message', 'broadcast', 'announce', 'send']
    },
    'stats': {
      text: `📈 **Stats Page**

Complete analytics:
• **Revenue** - Total earnings, trends
• **Users** - Growth charts
• **Courses** - Popularity stats
• **Engagement** - Active users

**Reports:**
• Download PDF report
• Export to Excel
• Custom date range
• Compare periods

**Insights:**
• Top performing courses
• Most active teachers
• Peak usage times
• Revenue predictions`,
      link: '/super-admin/stats',
      suggestions: ['Dashboard', 'Settings', 'Reports'],
      keywords: ['stats', 'analytics', 'report', 'revenue', 'data', 'graph']
    },
    'settings': {
      text: `⚙️ **Settings Page**

Platform configuration:
**General:**
• Site name & logo
• Contact information
• Default language

**Security:**
• Password policies
• 2FA enforcement
• Session timeout

**Payments:**
• Payment gateway config
• Commission rates
• Payout settings

**Email:**
• SMTP configuration
• Email templates
• Notification triggers

**Features:**
• Enable/disable features
• Maintenance mode
• API settings`,
      link: '/super-admin/settings',
      suggestions: ['Dashboard', 'Stats', 'Security'],
      keywords: ['setting', 'config', 'option', 'security', 'payment', 'email']
    },
    'security': {
      text: `🔐 **Security Page**

Platform security:
• **Login Logs** - All login attempts
• **Failed Logins** - Suspicious activity
• **Active Sessions** - Current users
• **IP Blocks** - Blocked IPs

**Actions:**
• Force logout all users
• Block suspicious IPs
• Enable maintenance mode
• Security audit logs`,
      link: '/super-admin/security',
      suggestions: ['Settings', 'Activity', 'Dashboard'],
      keywords: ['security', 'login', 'ip', 'block', 'audit', 'protection']
    },
    'backup': {
      text: `💾 **Backup Page**

Data backup management:
• **Auto Backups** - Scheduled backups
• **Manual Backup** - Create now
• **Restore** - Restore from backup
• **Download** - Download backup files

**Settings:**
• Backup frequency
• Storage location
• Retention period
• Email notifications`,
      link: '/super-admin/backup',
      suggestions: ['Settings', 'Security', 'Dashboard'],
      keywords: ['backup', 'restore', 'data', 'save', 'download']
    },
    'logs': {
      text: `📋 **System Logs Page**

View all system logs:
• **Error Logs** - System errors
• **Access Logs** - Page visits
• **API Logs** - API calls
• **Admin Logs** - Admin actions

**Filters:**
• By log type
• By date range
• By severity
• Search logs`,
      link: '/super-admin/logs',
      suggestions: ['Activity', 'Security', 'Dashboard'],
      keywords: ['log', 'error', 'system', 'api', 'debug']
    }
  }
};

// Common queries that work for all roles
const COMMON_QUERIES: { [key: string]: { text: string; suggestions: string[] } } = {
  'hello': {
    text: `👋 **Hello!**

Welcome! I'm your LMS Assistant. How can I help you today?

You can ask me about:
• How to use any feature
• Navigation help
• Troubleshooting issues
• Understanding your dashboard

Just type your question or click on the suggestions below!`,
    suggestions: ['Dashboard', 'Help', 'Features', 'Settings']
  },
  'hi': {
    text: `👋 **Hi there!**

Great to see you! I'm here to help you navigate the LMS.

What would you like to know about?
• Your Dashboard
• Courses
• Assignments
• Messages
• Settings

Feel free to ask anything!`,
    suggestions: ['Dashboard', 'My Courses', 'Help']
  },
  'login': {
    text: `🔐 **Login Help**

**How to login:**
1. Go to the login page
2. Enter your Email/Username
3. Enter your Password
4. Click the "Login" button

**Having problems?**
• Forgot Password - You'll receive a reset link via email
• Account Locked - Contact admin
• Wrong Password - Account locks after 5 attempts`,
    suggestions: ['Dashboard', 'Password', 'Help']
  },
  'logout': {
    text: `👋 **Logout Help**

**How to logout:**
1. Click on your profile icon (top right)
2. Select "Logout" option
3. Confirm

**Note:**
• Session automatically logs out after 30 mins of inactivity
• Logout from all devices option available in settings`,
    suggestions: ['Dashboard', 'Settings', 'Login']
  },
  'password': {
    text: `🔑 **Password Help**

**Change Password:**
1. Go to Settings
2. Find "Security" section
3. Enter current password
4. Enter new password (twice)
5. Save

**Forgot Password:**
1. Click "Forgot Password" on login page
2. Enter your email
3. You'll receive a reset link
4. Click the link
5. Set new password

**Strong Password Tips:**
• Minimum 8 characters
• Use upper + lowercase letters
• Include numbers
• Add special characters (@#$)`,
    suggestions: ['Login', 'Settings', 'Security']
  },
  'profile': {
    text: `👤 **Profile Help**

**How to update your profile:**
1. Click on your profile icon
2. Select "Edit Profile"
3. Update your details:
   • Name
   • Profile picture
   • Bio
   • Contact info
4. Click "Save Changes"

**Profile Picture:**
• JPG/PNG format
• Max 2MB size
• Square images work best`,
    suggestions: ['Settings', 'Dashboard', 'Password']
  },
  'help': {
    text: `❓ **Help & Support**

**You can ask me about:**
• Any page or feature
• How to use buttons
• How features work
• Solving problems

**Contact Support:**
• Email: support@lms.com
• Help Center in Settings
• FAQ section

**Tip:** Ask specific questions like "How to create a quiz?" or "How to submit an assignment?"`,
    suggestions: ['Dashboard', 'Settings', 'FAQ']
  },
  'error': {
    text: `🔧 **Common Errors & Solutions**

**Page not loading?**
• Check your internet connection
• Refresh the page (Ctrl+F5)
• Clear browser cache
• Try a different browser

**File upload failing?**
• Check file size (check max limit)
• Check format (allowed types only)
• Ensure stable internet

**Login issues?**
• Is the password correct?
• Is caps lock off?
• Is your account active?

**Still stuck?**
Contact support with an error screenshot`,
    suggestions: ['Help', 'Dashboard', 'Support']
  },
  'features': {
    text: `✨ **Platform Features**

**For Students:**
• Course enrollment & learning
• Quizzes & Assignments
• Progress tracking
• Certificates
• Discussion forums

**For Teachers:**
• Create & manage courses
• Create quizzes
• Grade assignments
• Track student progress
• Earnings dashboard

**General:**
• Messages & notifications
• Profile customization
• Dark/Light mode
• Mobile responsive`,
    suggestions: ['Dashboard', 'My Courses', 'Settings']
  },
  'shortcut': {
    text: `⌨️ **Keyboard Shortcuts**

**Navigation:**
• Ctrl + D - Go to Dashboard
• Ctrl + M - Go to Messages
• Ctrl + N - View Notifications
• Ctrl + S - Go to Settings

**Actions:**
• Ctrl + F - Search
• Ctrl + / - Open this chatbot
• Esc - Close modals

**Note:** Shortcuts may vary by browser`,
    suggestions: ['Dashboard', 'Help', 'Settings']
  },
  'theme': {
    text: `🎨 **Theme Settings**

**Change Theme:**
1. Go to Settings
2. Find "Appearance" section
3. Choose your theme:
   • Light Mode ☀️
   • Dark Mode 🌙
   • System Default

**Note:** Theme preference is saved to your account`,
    suggestions: ['Settings', 'Profile', 'Dashboard']
  },
  'mobile': {
    text: `📱 **Mobile App**

**Access on Mobile:**
• Open browser on your phone
• Go to the LMS website
• Login with your credentials
• Site is mobile responsive!

**Mobile App (Coming Soon):**
• iOS & Android apps
• Push notifications
• Offline access
• Better experience`,
    suggestions: ['Dashboard', 'Features', 'Help']
  },
  'support': {
    text: `🎧 **Contact Support**

**Get Help:**
• Email: support@lms.com
• Response time: 24-48 hours
• Include screenshots if possible

**Before contacting:**
• Check FAQ section
• Try the troubleshooting steps
• Ask me for help!

**For urgent issues:**
Contact your admin directly`,
    suggestions: ['Help', 'FAQ', 'Dashboard']
  },
  'faq': {
    text: `📖 **Frequently Asked Questions**

**Q: How do I enroll in a course?**
A: Browse courses > Click on course > Click Enroll

**Q: How do I submit an assignment?**
A: Assignments > Select assignment > Upload file > Submit

**Q: How do I get a certificate?**
A: Complete 100% of the course with passing grades

**Q: How do I contact my teacher?**
A: Go to Messages > New Message > Select teacher

**Need more help?** Ask me anything!`,
    suggestions: ['Help', 'Dashboard', 'Support']
  },
  'thank': {
    text: `😊 **You're Welcome!**

I'm glad I could help! Is there anything else you'd like to know?

Feel free to ask me:
• More about features
• How to do something
• Troubleshooting help

I'm always here to assist! 🚀`,
    suggestions: ['Dashboard', 'Help', 'Features']
  },
  'bye': {
    text: `👋 **Goodbye!**

It was great helping you! Come back anytime you need assistance.

**Quick reminder:**
• Bookmark important pages
• Check notifications regularly
• Complete your assignments on time

See you soon! 🎉`,
    suggestions: ['Dashboard', 'My Courses', 'Help']
  }
};

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(Date.now().toString());
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get initial message based on role
  const getInitialMessage = useCallback((): Message => {
    const roleLabels: { [key: string]: string } = {
      'student': 'Student',
      'teacher': 'Teacher', 
      'admin': 'Admin',
      'super-admin': 'Super Admin'
    };
    const roleLabel = roleLabels[user?.role || 'student'] || 'Student';
    
    const roleKB = KNOWLEDGE_BASE[user?.role || 'student'];
    const availablePages = roleKB ? Object.keys(roleKB).slice(0, 4) : [];
    
    return {
      id: `init-${sessionId}`,
      text: `👋 Hello ${user?.name || 'User'}! I'm your **${roleLabel} Assistant**.

Ask me anything like:
• "What's on the Dashboard?"
• "How to submit an assignment?"
• "How to create a quiz?"
• "Where are Settings?"

Or click the suggestions below! 👇`,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Dashboard Guide', 'Help', 'Features', 'Settings', ...availablePages.slice(0, 2)]
    };
  }, [user, sessionId]);

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize/Reset chat
  const initializeChat = useCallback(() => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    setMessages([{
      ...getInitialMessage(),
      id: `init-${newSessionId}`
    }]);
    setInput('');
    setIsTyping(false);
  }, [getInitialMessage]);

  // Reset on login/logout/user change
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [user?.id, user?.role]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, initializeChat, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clear Chat
  const handleClearChat = () => {
    initializeChat();
  };

  // Refresh Chat
  const handleRefresh = () => {
    initializeChat();
  };

  // 🧠 INTELLIGENT RESPONSE GENERATOR
  const generateResponse = (query: string): { text: string; link: string | null; suggestions: string[] } => {
    const q = query.toLowerCase().trim();
    const role = user?.role || 'student';
    const roleKB = KNOWLEDGE_BASE[role] || KNOWLEDGE_BASE['student'];

    // Check common queries first
    for (const [key, value] of Object.entries(COMMON_QUERIES)) {
      if (q.includes(key) || q === key) {
        return { ...value, link: null };
      }
    }

    // Check role-specific knowledge base
    for (const [key, value] of Object.entries(roleKB)) {
      // Check direct key match
      if (q.includes(key)) {
        return {
          text: value.text,
          link: value.link,
          suggestions: value.suggestions
        };
      }
      
      // Check keywords
      if (value.keywords.some(kw => q.includes(kw))) {
        return {
          text: value.text,
          link: value.link,
          suggestions: value.suggestions
        };
      }
    }

    // Smart fallback with suggestions
    const availableTopics = Object.keys(roleKB);
    const randomTopics = availableTopics.sort(() => 0.5 - Math.random()).slice(0, 4);

    return {
      text: `🤔 I couldn't find exact information about "${query}".

**Try these:**
• Mention a specific page name (e.g., "Dashboard", "Quizzes")
• Ask a clear question (e.g., "How to submit an assignment?")

**Or ask about these topics:**
${randomTopics.map(t => `• ${t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}`).join('\n')}

**Need help?**
Type "help" or click the suggestions!`,
      link: null,
      suggestions: ['Help', 'Dashboard', 'Features', ...randomTopics.slice(0, 2)]
    };
  };

  const handleSend = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const txt = (textOverride || input).trim();
    if (!txt) return;

    // Handle special commands
    if (txt.toLowerCase() === 'clear' || txt.toLowerCase() === 'clear chat') {
      handleClearChat();
      return;
    }

    if (txt.toLowerCase() === 'refresh') {
      handleRefresh();
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: txt,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Generate response with delay for natural feel
    setTimeout(() => {
      const response = generateResponse(txt);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        text: (
          <div className="space-y-2">
            <div className="whitespace-pre-line leading-relaxed text-sm">{response.text}</div>
            {response.link && (
              <button 
                onClick={() => { 
                  navigate(response.link!); 
                  setIsOpen(false); 
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-md"
              >
                <span>Go to Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ),
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  // Don't render if no user
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-95 h-145 flex flex-col bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-linear-to-r from-black via-gray-900 to-black text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">LMS Assistant</h3>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"/> 
                  Online • {user.role?.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={handleRefresh} 
                className="hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110" 
                title="Refresh Chat"
              >
                <RotateCcw className="w-4 h-4 text-gray-300 hover:text-white" />
              </button>
              <button 
                onClick={handleClearChat} 
                className="hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110" 
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4 text-gray-300 hover:text-white" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 scroll-smooth">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}
              >
                <div className={`max-w-[88%] p-3.5 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-linear-to-br from-black to-gray-800 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-md'
                }`}>
                  {msg.text}
                </div>
                
                {/* Suggestion Chips */}
                {msg.suggestions && msg.sender === 'bot' && (
                  <div className="flex flex-wrap gap-2 mt-3 max-w-[95%]">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(undefined, s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all cursor-pointer"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-500" /> 
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2 shrink-0">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white transition-all placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-linear-to-r from-black via-gray-900 to-black hover:from-gray-800 hover:via-black hover:to-gray-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-black/25 z-50"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-25 transition-all duration-500 ease-out font-semibold whitespace-nowrap">
            Ask AI
          </span>
        </button>
      )}
    </div>
  );
};

export default AIChatBot;