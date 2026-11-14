import { useState, useEffect } from 'react';
import { useGetCoursesQuery } from '../services/courseApi';
import type { ICourse, ITopic, CourseType } from '../types/course.types';

export function useCourses() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courseType, setCourseType] = useState<CourseType | ''>('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'course' | 'topic'>(
    'all',
  );

  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useGetCoursesQuery({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(courseType ? { courseType } : {}),
  });

  const rawCourses: ICourse[] = Array.isArray(data)
    ? data
    : ((data as { data?: ICourse[] } | undefined)?.data ?? []);

  //  (Course vs Topic)
  const courses = rawCourses.filter((course) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();

    const matchesCourse =
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query);
    const matchesTopic = course.topics?.some((t) =>
      t.title.toLowerCase().includes(query),
    );

    if (searchTarget === 'course') return matchesCourse;
    if (searchTarget === 'topic') return matchesTopic;
    return matchesCourse || matchesTopic;
  });

  const toggleTopic = (id: string) =>
    setExpandedTopics((p) => ({ ...p, [id]: !p[id] }));
  const toggleChapter = (id: string) =>
    setExpandedChapters((p) => ({ ...p, [id]: !p[id] }));

  const handleBuyFullCourse = (course: ICourse) => {
    console.log('Buy Full Course:', {
      courseId: course._id,
      amount: course.discountPrice || course.price,
    });
  };

  const handleBuyTopic = (course: ICourse, topic: ITopic) => {
    console.log('Buy Topic:', {
      courseId: course._id,
      topicId: topic._id,
      amount: topic.discountPrice || topic.price,
    });
  };

  return {
    search,
    setSearch,
    courseType,
    setCourseType,
    searchTarget,
    setSearchTarget,
    courses,
    isLoading,
    isError,
    error,
    refetch,
    selectedCourse,
    setSelectedCourse,
    expandedTopics,
    expandedChapters,
    toggleTopic,
    toggleChapter,
    handleBuyFullCourse,
    handleBuyTopic,
  };
}
