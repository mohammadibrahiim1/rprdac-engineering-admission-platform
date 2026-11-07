import { ExamList } from "@/features/ExamManagement/exam-components/ExamList";
import { PostExamForm } from "@/features/ExamManagement/exam-components/PostExamForm";

const handleNavigate = (tab: string, id?: string) => {
  console.log("Navigation triggered:", tab, id);
};

export const examRoutes = [
  {
    path: "all",
    element: <ExamList />,
  },
  {
    path: "create",
    element: <PostExamForm />,
  },
  {
    path: "marks", // Full path: /exam/marks
    element: <div>Student Marks Entry Page</div>,
  },
  {
    path: "results", // Full path: /exam/results
    element: <div>Results & Merit List Page</div>,
  },
  {
    path: "batch-results", // Full path: /exam/batch-results
    element: <div>Batch Results Page</div>,
  },
  {
    path: "mcq-upload", // Full path: /exam/mcq-upload
    element: <div>MCQ Upload Page</div>,
  },
  {
    path: "students", // Full path: /exam/students
    element: <div>Student Management Page</div>,
  },
  {
    path: "lookup", // Full path: /exam/lookup
    element: <div>Student Result Lookup Page</div>,
  },
  {
    path: "data-management", // Full path: /exam/data-management
    element: <div>Data Management Page</div>,
  },
];
