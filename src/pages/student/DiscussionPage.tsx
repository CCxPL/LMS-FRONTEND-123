import React, { useEffect, useState } from 'react';
import DiscussionBoard from '../../components/ui/DiscussionBoard';
import Card from '../../components/ui/Card';
import { getMyEnrolledCoursesApi } from '../../api/studentApi';

interface Course {
    id: string;
    name: string;
}

const TOPICS = [
    { id: 'general', name: 'General Discussion' },
    { id: 'qa', name: 'Q&A' },
    { id: 'doubt', name: 'Doubts' },
    { id: 'career', name: 'Career Guidance' },
];

const DiscussionPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await getMyEnrolledCoursesApi();
            const raw: any[] = res.data?.courses ?? [];
            const mapped: Course[] = raw.map((c: any) => ({
                id: c._id,
                name: c.title,
            }));
            setCourses(mapped);
            if (mapped.length > 0) setSelectedCourse(mapped[0].id);
        } catch (err) {
            console.error('Courses fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Community Forum</h1>
                    <p className="page-subtitle">Discuss, ask questions, and learn together</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Course Selection */}
                    <Card>
                        <h3 className="font-bold text-gray-900 mb-4">Select Course</h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-16">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                            </div>
                        ) : courses.length === 0 ? (
                            <p className="text-sm text-gray-400">No courses enrolled yet.</p>
                        ) : (
                            <div className="space-y-1">
                                {courses.map((course) => (
                                    <button
                                        key={course.id}
                                        onClick={() => setSelectedCourse(course.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            selectedCourse === course.id
                                                ? 'bg-gray-100 text-black border-l-4 border-black'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {course.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Topic Selection */}
                    <Card>
                        <h3 className="font-bold text-gray-900 mb-4">Topics</h3>
                        <div className="space-y-1">
                            {TOPICS.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedTopic === topic.id
                                            ? 'bg-gray-100 text-black border-l-4 border-black'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {topic.name}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Main Discussion Area */}
                <div className="lg:col-span-3">
                    {selectedCourse ? (
                        <DiscussionBoard
                            courseId={selectedCourse}
                            topic={selectedTopic}
                        />
                    ) : (
                        <Card>
                            <p className="text-center text-gray-400 py-10">
                                Select a course to view discussions.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscussionPage;