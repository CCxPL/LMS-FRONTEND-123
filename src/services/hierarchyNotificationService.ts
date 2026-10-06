// Backend automatically sends all notifications via socket.
// This service is kept as a stub so existing imports don't break.

export const hierarchyNotificationService = {
  notifyAdminRoleChanged: () => {},
  notifyAdminPermissionChanged: () => {},
  notifyAdminDeleted: () => {},
  notifyTeacherRoleChanged: () => {},
  notifyTeacherCourseAssigned: () => {},
  notifyTeacherDeleted: () => {},
  notifyStudentClassScheduled: () => {},
  notifyStudentClassUpdated: () => {},
  notifyStudentClassCancelled: () => {},
  notifyStudentRemoved: () => {},
  notifyTeacherLate: () => {},
  notifyClassSummaryReady: () => {},
  getNotificationsForUser: (_userId: string) => [],
  getAllNotifications: () => [],
  markAsRead: (_id: string) => {},
  subscribe: (_cb: any) => () => {},
};