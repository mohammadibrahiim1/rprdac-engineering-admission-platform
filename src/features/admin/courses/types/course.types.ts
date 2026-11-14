// types/course.types.ts
export type CourseType = 'departmental' | 'non_departmental' | 'combo_package';

export interface ILesson {
  _id: string;
  title: string;
  order: number;
  duration?: string;
  isFreePreview?: boolean;
  thumbnail?: string | null;
  slug?: string;
}

export interface IChapter {
  _id: string;
  title: string;
  order: number;
  isLocked: boolean;
  description?: string;
  slug?: string;
  lessons: ILesson[];
  lessonCount: number;
}

export interface ITopic {
  _id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  order: number;
  chapters: IChapter[];
  chapterCount: number;
  lessonCount: number;
}

export interface ICourse {
  _id: string;
  title: string;
  code: string;
  courseType: CourseType;
  isCommon: boolean;
  description?: string;
  thumbnail?: string | null;
  bannerImage?: string | null;
  features?: string[];
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  order: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  topics: ITopic[];
  topicCount: number;
  chapterCount: number;
  lessonCount: number;
}

export interface DisplayCoursesProps {
  courses: ICourse[];
  isLoading: boolean;
  searchQuery: string;
  searchTarget: 'all' | 'course' | 'topic';
  selectedCourse: ICourse | null;
  setSelectedCourse: (course: ICourse | null) => void;
  expandedTopics: Record<string, boolean>;
  expandedChapters: Record<string, boolean>;
  toggleTopic: (id: string) => void;
  toggleChapter: (id: string) => void;
  handleBuyFullCourse: (course: ICourse) => void;
  handleBuyTopic: (course: ICourse, topic: ITopic) => void;
}

// ==================== Course Input Types ====================
export type CreateCourseInput = Omit<
  ICourse,
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | 'discountPercentage'
  | 'topics'
  | 'topicCount'
  | 'chapterCount'
  | 'lessonCount'
  | 'code'
> & {
  code?: string;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

// ==================== Topic Input Types (Added Missing) ====================
export type CreateTopicInput = Omit<
  ITopic,
  '_id' | 'discountPercentage' | 'chapters' | 'chapterCount' | 'lessonCount'
>;

export type UpdateTopicInput = Partial<CreateTopicInput>;

// ==================== Chapter Input Types (Added Missing) ====================
export type CreateChapterInput = Omit<
  IChapter,
  '_id' | 'lessons' | 'lessonCount'
>;

export type UpdateChapterInput = Partial<CreateChapterInput>;
