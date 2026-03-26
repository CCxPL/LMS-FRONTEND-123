import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, HelpCircle, CheckCircle, GripVertical } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { createQuizApi } from '../../api/quizApi';
import { getTeacherCoursesApi } from '../../api/teacherApi';

interface QuestionForm {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [duration, setDuration] = useState('30');
  const [passingPercentage, setPassingPercentage] = useState('60');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await getTeacherCoursesApi();
      setCourses(res.data?.courses || []);
    } catch {
      showToast('Failed to load courses', 'error');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 5,
    }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    showToast('Question removed', 'info');
  };

  const updateQuestion = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qId: string, optIdx: number, value: string) => {
    setQuestions(questions.map((q) =>
      q.id === qId ? { ...q, options: q.options.map((o, i) => (i === optIdx ? value : o)) } : q
    ));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map((q) =>
      q.id === qId && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const removeOption = (qId: string, optIdx: number) => {
    setQuestions(questions.map((q) => {
      if (q.id === qId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optIdx);
        const newCorrect = q.correctAnswer >= newOptions.length ? 0 : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      }
      return q;
    }));
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const duplicated = { ...question, id: Date.now().toString() };
      const index = questions.findIndex(q => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, duplicated);
      setQuestions(newQuestions);
      showToast('Question duplicated', 'success');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !courseId || questions.length === 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
      showToast('Please fill all questions and options', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        courseId,
        timeLimit: parseInt(duration) || 30,
        passingScore: parseInt(passingPercentage) || 60,
        isPublished: true,
        questions: questions.map(q => ({
          questionText: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.marks,
        })),
      };

      await createQuizApi(payload as any);
      showToast('Quiz created successfully!', 'success');
      navigate('/teacher/quizzes');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to create quiz', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      showToast('Please enter quiz title', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title,
        courseId,
        timeLimit: parseInt(duration) || 30,
        passingScore: parseInt(passingPercentage) || 60,
        isPublished: false,
        questions: questions.map(q => ({
          questionText: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.marks,
        })),
      };

      await createQuizApi(payload as any);
      showToast('Quiz saved as draft', 'success');
      navigate('/teacher/quizzes');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/quizzes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
            <p className="text-sm text-gray-500">Build a quiz for your students</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>Save Draft</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Publish Quiz</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Quiz Information</h3>
            <div className="space-y-4">
              <Input label="Quiz Title *" placeholder="e.g., React Hooks Quiz" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Course *</label>
                  <select className="input-field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map((c: any) => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <Input label="Duration (min)" type="number" placeholder="30" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Passing %" type="number" placeholder="60" value={passingPercentage} onChange={(e) => setPassingPercentage(e.target.value)} />
                <Input label="Max Attempts" type="number" placeholder="3" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Questions ({questions.length})</h3>
              <Button variant="secondary" size="sm" onClick={addQuestion}><Plus className="w-4 h-4" /> Add Question</Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No questions yet</p>
                <Button variant="outline" onClick={addQuestion} className="mt-4"><Plus className="w-4 h-4" /> Add First Question</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">{qIdx + 1}</span>
                        <span className="text-sm font-medium">Question</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-500">Marks:</label>
                          <input type="number" className="input-field w-16 py-1 px-2 text-center text-sm" value={q.marks} onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value) || 0)} min={1} />
                        </div>
                        <button onClick={() => duplicateQuestion(q.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => removeQuestion(q.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <textarea className="input-field mb-4 min-h-[80px]" placeholder="Type your question here..." value={q.question} onChange={(e) => updateQuestion(q.id, 'question', e.target.value)} />
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <button onClick={() => updateQuestion(q.id, 'correctAnswer', optIdx)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctAnswer === optIdx ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                            {q.correctAnswer === optIdx && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                          <input className="input-field flex-1" placeholder={`Option ${String.fromCharCode(65 + optIdx)}`} value={opt} onChange={(e) => updateOption(q.id, optIdx, e.target.value)} />
                          {q.options.length > 2 && <button onClick={() => removeOption(q.id, optIdx)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      ))}
                      {q.options.length < 6 && <button onClick={() => addOption(q.id)} className="text-xs text-blue-600 hover:underline">+ Add Option</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Quiz Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Questions</span><span className="font-bold">{questions.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Marks</span><span className="font-bold">{totalMarks}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Duration</span><span className="font-bold">{duration} min</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Passing</span><span className="font-bold">{passingPercentage}%</span></div>
            </div>
            <div className="mt-6 space-y-2">
              <Button fullWidth onClick={handleSave} disabled={isSaving}><Save className="w-4 h-4" /> Publish Quiz</Button>
              <Button variant="outline" fullWidth onClick={handleSaveDraft} disabled={isSaving}>Save as Draft</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;