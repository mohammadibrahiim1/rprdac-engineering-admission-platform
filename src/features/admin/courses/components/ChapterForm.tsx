import { useForm, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import {
  useCreateChapterMutation,
  useUpdateChapterMutation,
} from "../services/chapterApi";
import { useGetCoursesQuery } from "../services/courseApi";
import { useGetTopicsQuery } from "../services/topicApi";
import {
  CreateChapterInput,
  IChapter,
  UpdateChapterInput,
} from "../types/course.types";
import { toast } from "sonner";

interface Props {
  editData?: IChapter | null;
  onSuccess?: () => void;
}

export default function ChapterForm({ editData, onSuccess }: Props) {
  const { data: coursesData } = useGetCoursesQuery();
  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();
  const [updateChapter, { isLoading: updating }] = useUpdateChapterMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateChapterInput>({
    defaultValues: editData
      ? {
          courseId:
            typeof editData.courseId === "string"
              ? editData.courseId
              : editData.courseId._id,
          topicId:
            typeof editData.topicId === "string"
              ? editData.topicId
              : editData.topicId._id,
          title: editData.title,
          description: editData.description,
          order: editData.order,
          isActive: editData.isActive,
          isLocked: editData.isLocked,
        }
      : {
          order: 1,
          isActive: true,
          isLocked: false,
        },
  });

  const selectedCourseId = useWatch({ control, name: "courseId" });

  const { data: topicsData } = useGetTopicsQuery(
    selectedCourseId ? { courseId: selectedCourseId } : undefined,
    { skip: !selectedCourseId },
  );

  const onSubmit = async (data: CreateChapterInput) => {
    try {
      if (editData) {
        const { courseId, topicId, ...rest } = data;
        await updateChapter({
          id: editData._id,
          body: rest as UpdateChapterInput,
        }).unwrap();
        toast.success("Chapter updated successfully");
      } else {
        await createChapter(data).unwrap();
        toast.success("Chapter created successfully");
        reset();
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-white p-6 rounded-xl shadow-sm border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Course *
          </label>
          <select
            {...register("courseId", { required: "Course is required" })}
            disabled={!!editData}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">-- Select Course --</option>
            {coursesData?.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Select Topic *
          </label>
          <select
            {...register("topicId", { required: "Topic is required" })}
            disabled={!!editData || !selectedCourseId}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">-- Select Topic --</option>
            {topicsData?.data?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order *</label>
          <input
            type="number"
            {...register("order", { required: true, valueAsNumber: true })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} />
          <span className="text-sm">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isLocked")} />
          <span className="text-sm">Locked</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={creating || updating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
      >
        {creating || updating
          ? "Saving..."
          : editData
            ? "Update Chapter"
            : "Create Chapter"}
      </button>
    </motion.form>
  );
}
