import axiosInstance from '../api/axiosInstance';

export const certificateService = {
  getMyRequests: async () => {
    const res = await axiosInstance.get('/certificates/my');
    return res.data?.data?.certificates || [];
  },

  requestCertificate: async (courseId: string) => {
    const res = await axiosInstance.post('/certificates/issue', { courseId });
    return res.data?.data?.certificate;
  },

  getTeacherRequests: async () => {
    const res = await axiosInstance.get('/certificates/teacher-requests');
    return res.data?.data?.requests || [];
  },

  getAdminRequests: async () => {
    const res = await axiosInstance.get('/certificates/admin-requests');
    return res.data?.data?.requests || [];
  },

  teacherApprove: async (id: string) => {
    const res = await axiosInstance.patch(`/certificates/${id}/teacher-approve`);
    return res.data?.data?.certificate;
  },

  teacherDeny: async (id: string, reason: string) => {
    const res = await axiosInstance.patch(`/certificates/${id}/teacher-deny`, { reason });
    return res.data?.data?.certificate;
  },

  adminApprove: async (id: string) => {
    const res = await axiosInstance.patch(`/certificates/${id}/admin-approve`);
    return res.data?.data?.certificate;
  },

  adminDeny: async (id: string, reason: string) => {
    const res = await axiosInstance.patch(`/certificates/${id}/admin-deny`, { reason });
    return res.data?.data?.certificate;
  },

  uploadPdf: async (id: string, pdfUrl: string, pdfFileName: string) => {
    const res = await axiosInstance.patch(`/certificates/${id}/upload-pdf`, { pdfUrl, pdfFileName });
    return res.data?.data?.certificate;
  },
};