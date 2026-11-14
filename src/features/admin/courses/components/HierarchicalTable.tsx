import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Layers,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  useGetCoursesQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
} from "../services/courseApi";
import {
  useGetTopicsQuery,
  useDeleteTopicMutation,
} from "../services/topicApi";
import {
  useGetChaptersQuery,
  useDeleteChapterMutation,
  useUpdateChapterMutation,
} from "../services/chapterApi";
import { ICourse, ITopic, IChapter } from "../types/course.types";
import StatusBadge from "../ui/StatusBadge";
import { toast } from "sonner";
import { Fragment } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RowType = "course" | "topic" | "chapter";

interface HierarchicalRow {
  id: string;
  type: RowType;
  title: string;
  code?: string;
  price?: number;
  order: number;
  isActive: boolean;
  isLocked?: boolean;
  isPublished?: boolean;
  original: ICourse | ITopic | IChapter;
  subRows?: HierarchicalRow[];
}

export default function HierarchicalTable() {
  const { data: coursesData, isLoading: loadingCourses } = useGetCoursesQuery();
  const { data: topicsData } = useGetTopicsQuery();
  const { data: chaptersData } = useGetChaptersQuery();

  const [deleteCourse] = useDeleteCourseMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [updateChapter] = useUpdateChapterMutation();

  // Expanded state tracking by row id
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build hierarchical data structure
  const data = useMemo(() => {
    if (!coursesData?.data) return [];

    return coursesData.data.map((course): HierarchicalRow => {
      const courseTopics =
        topicsData?.data?.filter((t) => {
          const cid =
            typeof t.courseId === "string" ? t.courseId : t.courseId?._id;
          return cid === course._id;
        }) || [];

      return {
        id: course._id,
        type: "course",
        title: course.title,
        code: course.code,
        price: course.price,
        order: course.order,
        isActive: course.isActive,
        isPublished: course.isPublished,
        original: course,
        subRows: courseTopics.map((topic): HierarchicalRow => {
          const topicChapters =
            chaptersData?.data?.filter((c) => {
              const tid =
                typeof c.topicId === "string" ? c.topicId : c.topicId?._id;
              return tid === topic._id;
            }) || [];

          return {
            id: topic._id,
            type: "topic",
            title: topic.title,
            price: topic.price,
            order: topic.order,
            isActive: topic.isActive,
            original: topic,
            subRows: topicChapters.map(
              (chapter): HierarchicalRow => ({
                id: chapter._id,
                type: "chapter",
                title: chapter.title,
                order: chapter.order,
                isActive: chapter.isActive,
                isLocked: chapter.isLocked,
                original: chapter,
              }),
            ),
          };
        }),
      };
    });
  }, [coursesData, topicsData, chaptersData]);

  const handleDelete = async (row: HierarchicalRow) => {
    if (!confirm(`Are you sure you want to delete this ${row.type}?`)) return;

    try {
      if (row.type === "course") {
        await deleteCourse({ id: row.id }).unwrap();
      } else if (row.type === "topic") {
        await deleteTopic({ id: row.id }).unwrap();
      } else {
        await deleteChapter({ id: row.id }).unwrap();
      }
      toast.success(`${row.type} deleted successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  const handleToggleActive = async (row: HierarchicalRow) => {
    try {
      if (row.type === "course") {
        await updateCourse({
          id: row.id,
          body: { isActive: !row.isActive },
        }).unwrap();
      } else if (row.type === "chapter") {
        await updateChapter({
          id: row.id,
          body: { isActive: !row.isActive },
        }).unwrap();
      }
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleToggleLock = async (row: HierarchicalRow) => {
    if (row.type !== "chapter") return;
    try {
      await updateChapter({
        id: row.id,
        body: { isLocked: !row.isLocked },
      }).unwrap();
      toast.success(row.isLocked ? "Chapter unlocked" : "Chapter locked");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  // Recursive Row Renderer Component
  const renderRows = (rows: HierarchicalRow[], depth = 0) => {
    return rows.map((row) => {
      const isExpanded = !!expandedRows[row.id];
      const hasSubRows = row.subRows && row.subRows.length > 0;

      return (
        <Fragment key={row.id}>
          <TableRow className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
            {/* Title & Expand/Collapse */}
            <TableCell className="py-3.5">
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${depth * 24}px` }}
              >
                {hasSubRows ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-slate-700 p-0"
                    onClick={() => toggleExpand(row.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <span className="w-6" /> // Spacer for alignment
                )}

                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  {row.type === "course" && (
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  )}
                  {row.type === "topic" && (
                    <Layers className="h-4 w-4 text-blue-500" />
                  )}
                  {row.type === "chapter" && (
                    <FileText className="h-4 w-4 text-emerald-500" />
                  )}
                  {row.title}
                </span>

                {row.code && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-slate-500"
                  >
                    {row.code}
                  </Badge>
                )}
              </div>
            </TableCell>

            {/* Type */}
            <TableCell className="py-3.5">
              <span className="capitalize text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                {row.type}
              </span>
            </TableCell>

            {/* Order */}
            <TableCell className="py-3.5 text-xs font-medium text-slate-600">
              {row.order}
            </TableCell>

            {/* Price */}
            <TableCell className="py-3.5 text-xs font-semibold text-slate-700">
              {row.price !== undefined ? `৳${row.price}` : "—"}
            </TableCell>

            {/* Status & Lock */}
            <TableCell className="py-3.5">
              <div className="flex items-center gap-2">
                <StatusBadge
                  active={row.isActive}
                  onClick={() => handleToggleActive(row)}
                />
                {row.type === "chapter" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLock(row)}
                    className={`h-7 px-2 text-xs font-semibold gap-1 ${
                      row.isLocked
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {row.isLocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                    {row.isLocked ? "Locked" : "Unlocked"}
                  </Button>
                )}
              </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="py-3.5 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row)}
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>

          {/* Render SubRows recursively when expanded */}
          {hasSubRows && isExpanded && (
            <AnimatePresence>
              {renderRows(row.subRows!, depth + 1)}
            </AnimatePresence>
          )}
        </Fragment>
      );
    });
  };

  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-medium">
        Loading courses...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="bg-slate-50/75 border-b border-slate-200">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Title & Hierarchy
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Order
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Price
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              renderRows(data)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-20 text-slate-400"
                >
                  No data found. Create a course first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
