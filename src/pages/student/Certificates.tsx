import React, { useState, useEffect } from 'react';
import { Award, Download, Share2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getMyCertificatesApi } from '../../api/certificateApi';

const Certificates: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const res = await getMyCertificatesApi();
      const data = (res.data.certificates || []).map((c: any) => ({
        id: c._id || c.id,
        courseName: c.course?.title || c.courseName || '',
        studentName: c.student?.name || user?.name || '',
        instructorName: c.course?.teacher?.name || c.instructorName || 'Instructor',
        grade: c.grade || 'A',
        score: c.score ?? 0,
        issueDate: c.issueDate || c.issuedAt || new Date().toISOString(),
      }));
      setCerts(data);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  };

  const handleDownload = (cert: any) => {
    const text = `
    CERTIFICATE OF COMPLETION
    ========================================
    
    This certifies that
    ${cert.studentName}
    
    Has successfully completed the course
    "${cert.courseName}"
    
    with a grade of ${cert.grade} (${cert.score}%)
    
    Instructor: ${cert.instructorName}
    Date: ${cert.issueDate}
    ID: ${cert.id}
    
    ========================================
    LMS Portal
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${cert.courseName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Certificate downloaded!', 'success');
  };

  const handleShare = (courseName: string) => {
    navigator.clipboard.writeText(`I just earned a certificate in ${courseName}!`);
    showToast('Share text copied!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">Showcase your achievements</p>
      </div>

      {certs.length === 0 ? (
        <Card className="text-center py-16">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Certificates Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Complete courses and pass assessments to earn certificates.
          </p>
          <Button onClick={() => window.location.href = '/student/my-courses'}>
            Go to Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <Card key={cert.id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Certificate Preview */}
              <div className="bg-black text-white p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-white/20 rounded-tl-3xl m-4" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-white/20 rounded-br-3xl m-4" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Certificate of Completion</p>
                  <h3 className="text-2xl font-bold mb-2">{cert.courseName}</h3>
                  <p className="text-gray-400 text-sm">Awarded to</p>
                  <p className="text-lg font-medium text-white mt-1">{cert.studentName}</p>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{cert.grade}</p>
                    <p className="text-xs text-gray-500">Grade</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{cert.score}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">
                      {cert.issueDate}
                    </p>
                    <p className="text-xs text-gray-500">Issued</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                  <CheckCircle className="w-4 h-4 text-gray-700" />
                  Verified by <strong>{cert.instructorName}</strong>
                </div>

                <div className="flex gap-3">
                  <Button fullWidth onClick={() => handleDownload(cert)}>
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(cert.courseName)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;