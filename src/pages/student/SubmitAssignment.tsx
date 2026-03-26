import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, FileText, Link as LinkIcon, Upload, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { submitAssignmentApi, getAssignmentByIdApi } from '../../api/assignmentApi';
import { uploadImageApi } from '../../api/uploadApi';
import Loader from '../../components/common/Loader';

const SubmitAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [assignment, setAssignment] = useState<any>(null);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'link'>('text');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    if (!id) return;
    try {
      const res = await getAssignmentByIdApi(id);
      setAssignment(res.data.assignment);
      if (res.data.assignment?.status === 'submitted' || res.data.assignment?.status === 'graded') {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to load assignment:', error);
    } finally {
      setIsLoadingAssignment(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        showToast('File size should be less than 50MB', 'error');
        return;
      }
      setFile(selectedFile);
      showToast('File selected', 'success');
    }
  };

  const handleSubmit = async () => {
    if (submissionType === 'text' && !text.trim()) {
      showToast('Please write your submission', 'error');
      return;
    }
    if (submissionType === 'link' && !link.trim()) {
      showToast('Please enter a link', 'error');
      return;
    }
    if (submissionType === 'file' && !file) {
      showToast('Please upload a file', 'error');
      return;
    }

    if (!id) return;
    setIsSubmitting(true);

    try {
      let submittedText = '';
      let fileUrl = '';

      if (submissionType === 'text') {
        submittedText = text;
      } else if (submissionType === 'link') {
        submittedText = link;
      } else if (submissionType === 'file' && file) {
        try {
          // ✅ Fix: File direct pass karo, FormData nahi
          const uploadRes = await uploadImageApi(file);
          fileUrl = uploadRes.data?.url || '';
          submittedText = fileUrl || file.name;
        } catch {
          submittedText = file.name;
        }
      }

      await submitAssignmentApi(id, {
        submittedText,
        submissionType,
        link: submissionType === 'link' ? link : undefined,
        fileUrl,
      });

      setIsSubmitted(true);
      showToast('Assignment submitted!', 'success');
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || 'Failed to submit assignment. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAssignment) return <Loader text="Loading assignment..." />;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Submitted!</h2>
          <p className="text-gray-500 mb-6">
            You will receive feedback once it's graded.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/student/assignments')}>
              View Assignments
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
              Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Assignment</h1>
          {assignment && (
            <p className="text-gray-500 text-sm mt-1">
              {assignment.title} — {assignment.course?.title || ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="p-6 space-y-6">
          {/* Submission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to submit?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'text' as const, icon: <FileText className="w-6 h-6" />, label: 'Text' },
                { type: 'file' as const, icon: <Upload className="w-6 h-6" />, label: 'File' },
                { type: 'link' as const, icon: <LinkIcon className="w-6 h-6" />, label: 'Link' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setSubmissionType(opt.type)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${submissionType === opt.type
                      ? 'border-black bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  {opt.icon}
                  <span className="font-medium text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content based on type */}
          {submissionType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                style={{ minHeight: 200 }}
                placeholder="Write your assignment answer here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">{text.length} characters</p>
            </div>
          )}

          {submissionType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload File</label>
              {file ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <span className="text-xs text-gray-400 mt-1">PDF, DOC, ZIP up to 50MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.py,.js,.ts,.jsx,.tsx"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          )}

          {submissionType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://github.com/your-project"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
              📌 Important Notes
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Make sure your submission is complete</li>
              <li>Late submissions may receive reduced marks</li>
              <li>You can only submit once</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button fullWidth size="lg" onClick={handleSubmit} isLoading={isSubmitting}>
            <Send className="w-5 h-5" /> Submit Assignment
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SubmitAssignment;