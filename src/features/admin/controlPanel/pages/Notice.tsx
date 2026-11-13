import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice as NoticeType, ViewMode } from "../types/Notice.types";
import {
  useDeleteNoticeMutation,
  useGetAllNoticesQuery,
  usePostNoticeMutation,
  useUpdateNoticeMutation,
} from "../services/noticeApi";
import { toast } from "sonner";
import { NoticeFilters } from "../components/NoticeFilters";
import { NoticeInbox } from "../components/NoticeInbox";
import { NoticePanel } from "../components/NoticePanel";

export default function Notice() {
  const user = useSelector((state: any) => state?.auth?.user);

  const [viewMode, setViewMode] = useState<ViewMode>("inbox");
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);
  const [editingNotice, setEditingNotice] = useState<NoticeType | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postNotice] = usePostNoticeMutation();
  const [updateNotice] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const { data, isLoading, error, refetch } = useGetAllNoticesQuery({
    page,
    limit,
    date: selectedDate || "",
    author: selectedAuthor || null,
    search: searchTerm || null,
  });

  const notices = useMemo(() => data?.notices ?? [], [data]);
  const totalPages = useMemo(
    () => Math.ceil((data?.totalItems ?? 0) / limit) || 1,
    [data],
  );

  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>();

    notices?.forEach((notice) => {
      const name = notice.author?.name || notice.authorName;
      if (name && typeof name === "string") {
        authors.add(name);
      }
    });

    return Array.from(authors);
  }, [notices]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return notices.filter(
      (n: any) => new Date(n.createdAt).toDateString() === today,
    ).length;
  }, [notices]);

  const hasActiveFilters = !!(searchTerm || selectedDate || selectedAuthor);

  // ---------- Handlers ----------
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedAuthor("");
    setPage(1);
  };

  const handleSelectNotice = (notice: NoticeType) => {
    setSelectedNotice(notice);
    setViewMode("view");
  };

  const handleEditNotice = (notice: NoticeType) => {
    setEditingNotice(notice);
    setViewMode("edit");
  };

  const handleCancel = () => {
    if (selectedNotice) {
      setViewMode("view");
    } else {
      setViewMode("inbox");
    }
    setEditingNotice(null);
  };

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        authorId: user?._id,
        authorName: user?.userName,
        authorRole: user?.userType,
      };

      if (viewMode === "edit" && editingNotice) {
        await updateNotice({ id: editingNotice._id, ...payload }).unwrap();
        toast.success("Notice updated successfully");
        setSelectedNotice({ ...editingNotice, ...payload });
        setViewMode("view");
      } else {
        await postNotice(payload).unwrap();
        toast.success("Notice created successfully");
        setViewMode("inbox");
        setSelectedNotice(null);
      }
      setEditingNotice(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    setDeletingId(id);
    try {
      await deleteNotice(id).unwrap();
      toast.success("Notice deleted successfully");
      if (selectedNotice?._id === id) {
        setSelectedNotice(null);
        setViewMode("inbox");
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete notice");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight sm:text-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              All Notices Registry
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              All important notices are listed here. Easily view and stay
              updated with the latest announcements.
            </p>
          </div>

          <Button
            onClick={() => {
              setViewMode("add");
              setEditingNotice(null);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Notice
          </Button>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left – Filters */}
          <div className="lg:col-span-3">
            <NoticeFilters
              searchTerm={searchTerm}
              selectedDate={selectedDate}
              selectedAuthor={selectedAuthor}
              uniqueAuthors={uniqueAuthors}
              totalItems={data?.totalItems ?? 0}
              todayCount={todayCount}
              onSearchChange={(v) => {
                setSearchTerm(v);
                setPage(1);
              }}
              onDateChange={(v) => {
                setSelectedDate(v);
                setPage(1);
              }}
              onAuthorChange={(v) => {
                setSelectedAuthor(v);
                setPage(1);
              }}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Center – Inbox */}
          <div className="lg:col-span-3">
            <NoticeInbox
              notices={notices}
              selectedNotice={selectedNotice}
              isLoading={isLoading}
              error={error}
              totalItems={data?.totalItems ?? 0}
              page={page}
              totalPages={totalPages}
              onSelectNotice={handleSelectNotice}
              onPageChange={setPage}
              onRetry={refetch}
              onCreateFirst={() => setViewMode("add")}
              onClearFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Right – Details / Form */}
          <div className="lg:col-span-6">
            <NoticePanel
              viewMode={viewMode}
              selectedNotice={selectedNotice}
              editingNotice={editingNotice}
              isSubmitting={isSubmitting}
              deletingId={deletingId}
              onEdit={handleEditNotice}
              onDelete={handleDeleteNotice}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              onCreateMode={() => setViewMode("add")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
