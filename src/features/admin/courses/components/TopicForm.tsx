import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  CreateTopicInput,
  ITopic,
  UpdateTopicInput,
} from "../types/course.types";
import { toast } from "sonner";
import { useGetCoursesQuery } from "../services/courseApi";
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
} from "../services/topicApi";

interface Props {
  editData?: ITopic | null;
  onSuccess?: () => void;
}

export default function TopicForm({ editData, onSuccess }: Props) {
  const { data: coursesData } = useGetCoursesQuery();
  const [createTopic, { isLoading: creating }] = useCreateTopicMutation();
  const [updateTopic, { isLoading: updating }] = useUpdateTopicMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTopicInput>({
    defaultValues: editData
      ? {
          courseId:
            typeof editData.courseId === "string"
              ? editData.courseId
              : editData.courseId._id,
          title: editData.title,
          description: editData.description,
          price: editData.price,
          discountPrice: editData.discountPrice,
          order: editData.order,
          isActive: editData.isActive,
        }
      : {
          price: 0,
          discountPrice: 0,
          order: 1,
          isActive: true,
        },
  });

  const onSubmit = async (data: CreateTopicInput) => {
    try {
      if (editData) {
        const { courseId, ...rest } = data;
        await updateTopic({
          id: editData._id,
          body: rest as UpdateTopicInput,
        }).unwrap();
        toast.success("Topic updated successfully");
      } else {
        await createTopic(data).unwrap();
        toast.success("Topic created successfully");
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
              {c.title} ({c.code})
            </option>
          ))}
        </select>
        {errors.courseId && (
          <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>
        )}
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

        <div>
          <label className="block text-sm font-medium mb-1">Price *</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { required: true, valueAsNumber: true })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Price
          </label>
          <input
            type="number"
            step="0.01"
            {...register("discountPrice", { valueAsNumber: true })}
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

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register("isActive")} />
        <span className="text-sm">Active</span>
      </label>

      <button
        type="submit"
        disabled={creating || updating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
      >
        {creating || updating
          ? "Saving..."
          : editData
            ? "Update Topic"
            : "Create Topic"}
      </button>
    </motion.form>
  );
}
