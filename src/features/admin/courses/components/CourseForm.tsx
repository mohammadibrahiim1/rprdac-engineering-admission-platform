import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "../services/courseApi";
import {
  CreateCourseInput,
  ICourse,
  UpdateCourseInput,
} from "../types/course.types";
import { toast } from "sonner";

interface Props {
  editData?: ICourse | null;
  onSuccess?: () => void;
}

export default function CourseForm({ editData, onSuccess }: Props) {
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    defaultValues: editData
      ? {
          title: editData.title,
          code: editData.code,
          courseType: editData.courseType,
          isCommon: editData.isCommon,
          description: editData.description,
          price: editData.price,
          discountPrice: editData.discountPrice,
          order: editData.order,
          isPublished: editData.isPublished,
          isActive: editData.isActive,
        }
      : {
          courseType: "departmental",
          isCommon: false,
          price: 0,
          discountPrice: 0,
          order: 1,
          isPublished: true,
          isActive: true,
        },
  });

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      if (editData) {
        await updateCourse({
          id: editData._id,
          body: data as UpdateCourseInput,
        }).unwrap();
        toast.success("Course updated successfully");
      } else {
        await createCourse(data).unwrap();
        toast.success("Course created successfully");
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
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <input
            {...register("code")}
            placeholder="Auto generated if empty"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Course Type *
          </label>
          <select
            {...register("courseType", { required: true })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="departmental">Departmental</option>
            <option value="non_departmental">Non Departmental</option>
            <option value="combo_package">Combo Package</option>
          </select>
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

        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <input
            type="number"
            {...register("order", { valueAsNumber: true })}
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

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isCommon")} />
          <span className="text-sm">Is Common</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isPublished")} />
          <span className="text-sm">Published</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} />
          <span className="text-sm">Active</span>
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
            ? "Update Course"
            : "Create Course"}
      </button>
    </motion.form>
  );
}
