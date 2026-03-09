import type { AttendanceRecord, AttendanceStats } from '../types/attendance.types';

interface PDFData {
  title: string;
  studentName?: string;
  courseName?: string;
  dateRange: string;
  stats: AttendanceStats;
  records: AttendanceRecord[];
}

export const generateAttendancePDF = (data: PDFData): void => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '✓ Present';
      case 'absent': return '✗ Absent';
      case 'late': return '⏰ Late';
      default: return status;
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .header h1 { font-size: 24px; margin-bottom: 10px; }
        .header p { color: #666; font-size: 14px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; gap: 10px; }
        .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; }
        .info-box h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
        .info-box p { font-size: 16px; font-weight: bold; }
        .stats-grid { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
        .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #eee; flex: 1; min-width: 100px; }
        .stat-card .value { font-size: 28px; font-weight: bold; color: #000; }
        .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
        .stat-card.present .value { color: #16a34a; }
        .stat-card.absent .value { color: #dc2626; }
        .stat-card.late .value { color: #ca8a04; }
        .stat-card.rate .value { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #000; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        tr:hover { background: #f9f9f9; }
        .status-present { color: #16a34a; font-weight: bold; }
        .status-absent { color: #dc2626; font-weight: bold; }
        .status-late { color: #ca8a04; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Attendance Report</h1>
        <p>${data.title}</p>
      </div>

      <div class="info-section">
        ${data.studentName ? `<div class="info-box"><h3>Student</h3><p>${data.studentName}</p></div>` : ''}
        ${data.courseName ? `<div class="info-box"><h3>Course</h3><p>${data.courseName}</p></div>` : ''}
        <div class="info-box"><h3>Date Range</h3><p>${data.dateRange}</p></div>
        <div class="info-box"><h3>Generated On</h3><p>${new Date().toLocaleDateString()}</p></div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="value">${data.stats.totalClasses}</div><div class="label">Total Classes</div></div>
        <div class="stat-card present"><div class="value">${data.stats.present}</div><div class="label">Present</div></div>
        <div class="stat-card absent"><div class="value">${data.stats.absent}</div><div class="label">Absent</div></div>
        <div class="stat-card late"><div class="value">${data.stats.late}</div><div class="label">Late</div></div>
        <div class="stat-card rate"><div class="value">${data.stats.attendancePercentage}%</div><div class="label">Attendance Rate</div></div>
      </div>

      <h2 style="margin-bottom: 15px; font-size: 18px;">Detailed Records</h2>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Status</th>
            <th>Join Time</th>
            <th>Leave Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${data.records.map(record => `
            <tr>
              <td>${formatDate(record.date)}</td>
              <td>${record.eventTitle}</td>
              <td class="status-${record.status}">${getStatusText(record.status)}</td>
              <td>${formatTime(record.joinTime)}</td>
              <td>${formatTime(record.leaveTime)}</td>
              <td>${record.duration > 0 ? `${record.duration} min` : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was automatically generated by LMS Portal</p>
        <p>© ${new Date().getFullYear()} LMS Portal. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
};