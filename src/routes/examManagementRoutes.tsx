import { ExamMarksEntryForm } from "@/features/ExamManagement/exam-components/ExamMarksEntryForm";
import { PostExamForm } from "@/features/ExamManagement/exam-components/PostExamForm";
import ResultSheetList from "@/features/ExamManagement/exam-components/ResultSheetList";
import { ExamDesk } from "@/features/ExamManagement/pages/ExamDesk";

export const examRoutes = [
  {
    path: "all",
    element: <ExamDesk />,
  },
  {
    path: "create",
    element: <PostExamForm />,
  },
  {
    path: "marks", // Full path: /exam/marks
    element: <ExamMarksEntryForm />,
  },
  {
    path: "results", // Full path: /exam/results
    element: <ResultSheetList />,
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
