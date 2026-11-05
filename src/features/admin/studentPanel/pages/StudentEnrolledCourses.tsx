import React, { useState } from 'react';
// Components gulo ke sothik path theke import korun
import EnrolledCourses from '../components/StudentEnrolledCourses/EnrolledCourses';
import CourseSubjects from '../components/StudentEnrolledCourses/CourseSubjects';
import SubjectLessons from '../components/StudentEnrolledCourses/SubjectLessons';
import CustomVideoPlayer from '../components/StudentEnrolledCourses/CustomVideoPlayer';

export default function StudentEnrolledCourses() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<null>(null);

  // Mock student data (dynamico hote pare)
  const studentPhone = '017XXXXXXXX';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Step 1: Jodi lesson select kora thake, tahole Video Player dekhabe */}
      {activeLesson ? (
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <button
            onClick={() => setActiveLesson(null)}
            className="text-sm text-violet-400 hover:underline"
          >
            ← Back to Lessons
          </button>
          <h2 className="text-xl font-bold">{activeLesson.title}</h2>
          <CustomVideoPlayer
            src={activeLesson.videoUrl}
            studentPhone={studentPhone}
            onEnded={() => {}}
          />
        </div>
      ) : selectedSubject ? (
        /* Step 2: Subject select korle lesson/class list dekhabe */
        <SubjectLessons
          subjectTitle="Selected Subject Name"
          lessons={[
            {
              _id: 'l1',
              title: 'DC CKT BASIC 1',
              duration: '10:00',
              order: 1,
              videoUrl: 'https://...',
            },
          ]}
          completedLessons={[]}
          onBack={() => setSelectedSubject(null)}
          onSelectLesson={(lesson) => setActiveLesson(lesson)}
        />
      ) : selectedCourse ? (
        /* Step 3: Course select korle subjects gulo dekhabe */
        <CourseSubjects
          courseTitle="Selected Course Title"
          subjects={[
            {
              _id: 's1',
              label: 'Basic Electrical',
              code: 'EE-101',
              totalLessons: 6,
            },
          ]}
          onBack={() => setSelectedCourse(null)}
          onSelectSubject={(subjectId) => setSelectedSubject(subjectId)}
        />
      ) : (
        /* Step 4: Default view - Enrolled Courses list */
        <EnrolledCourses
          courses={[
            {
              _id: 'c1',
              title: 'RPR DUET Admission Care',
              thumbnail: '',
              totalSubjects: 4,
              progress: 25,
            },
          ]}
          onSelectCourse={(courseId) => setSelectedCourse(courseId)}
        />
      )}
    </div>
  );
}
