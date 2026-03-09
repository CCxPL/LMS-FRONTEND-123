import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ClassSummary } from '../types/attendance.types';
import { formatDate, formatTime } from '../types/attendance.types'; // ✅ CHANGED: import path

export const exportClassSummaryToPDF = (summary: ClassSummary) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Summary Report', 105, 20, { align: 'center' });

  // Add border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Class Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Information', 20, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const details = [
    ['Course:', summary.courseName],
    ['Teacher:', summary.teacherName],
    ['Date:', formatDate(summary.classStartTime)], // ✅ CHANGED: removed 'PPP' parameter
    ['Start Time:', formatTime(summary.classStartTime)], // ✅ CHANGED: use formatTime
    ['End Time:', formatTime(summary.classEndTime)], // ✅ CHANGED: use formatTime
    ['Duration:', `${summary.classDuration} minutes`],
  ];

  let yPos = 45;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });

  // Attendance Statistics
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Statistics', 20, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const attendanceRate = Math.round((summary.studentsAttended / summary.totalStudentsEnrolled) * 100);

  const stats = [
    ['Total Students Enrolled:', summary.totalStudentsEnrolled.toString()],
    ['Students Attended:', summary.studentsAttended.toString()],
    ['Attendance Rate:', `${attendanceRate}%`],
    ['Absent Students:', (summary.totalStudentsEnrolled - summary.studentsAttended).toString()],
  ];

  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });

  // Attendance Table
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Attendance Records', 20, yPos);

  const tableData = summary.attendanceRecords.map(record => [
    record.studentName,
    record.joinedAt ? formatTime(record.joinedAt) : 'N/A', // ✅ CHANGED: joinTime → joinedAt
    record.leftAt ? formatTime(record.leftAt) : 'Still in class', // ✅ CHANGED: leaveTime → leftAt
    record.duration ? `${record.duration} min` : 'N/A', // ✅ CHANGED: added null check
    record.isPresent ? '✓ Present' : '✗ Absent',
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Student Name', 'Join Time', 'Leave Time', 'Duration', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  // Save PDF
  const fileName = `class-report-${summary.courseName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const exportEventListToPDF = (events: any[], title: string = 'Events List') => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Table
  const tableData = events.map(event => [
    event.title,
    event.courseName,
    event.type.toUpperCase(),
    formatDate(event.date), // ✅ CHANGED: removed 'PP' parameter
    `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`,
    event.teacherName,
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Title', 'Course', 'Type', 'Date', 'Time', 'Teacher']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`${title.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
};