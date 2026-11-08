import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExamList } from "../exam-components/ExamList";
import { ExamInsights, IdleEditor } from "../exam-components/ExamInsights";
import { ExamEditForm } from "../exam-components/ExamEditForm";
import type { ExamRecord, SidePanel } from "../types/Exam.types";
import { useExamList } from "../hooks/useExamList";

export function ExamDesk() {
  const {
    filteredExams,
    allExamsCount,
    publishedCount,
    draftCount,
    batches,
    isLoading,
    error,
    query,
    setQuery,
    examDateFilter,
    setExamDateFilter,
    filtersActive,
    clearFilters,
    getBatchNames,
  } = useExamList();

  const [panel, setPanel] = useState<SidePanel>(null);

  const activeExam = panel
    ? filteredExams.find(
        (exam) => exam.id === panel.id || exam._id === panel.id,
      )
    : undefined;

  const openEdit = useCallback((exam: ExamRecord) => {
    if (exam.status === "published") {
      toast("Unpublish this exam before editing.");
      return;
    }
    setPanel({ type: "edit", id: exam.id });
  }, []);

  const toggleStatus = useCallback(
    (exam: ExamRecord) => {
      const next = exam.status === "published" ? "draft" : "published";

      // TODO: call mutation here (e.g. updateExamStatus)
      // For now just optimistic UI feedback
      if (
        next === "published" &&
        panel?.type === "edit" &&
        panel.id === exam.id
      ) {
        setPanel(null);
      }

      toast.success(
        next === "published" ? "Exam published." : "Exam moved back to draft.",
      );
    },
    [panel],
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Failed to load exams.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary font-display text-lg text-primary-foreground">
              E
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Registrar
              </p>
              <p className="font-display text-lg leading-none">Exam Desk</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Exam listing
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl">
                All exams ({filteredExams?.length})
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  {publishedCount}
                </span>{" "}
                published
                <span aria-hidden="true"> · </span>
                <span className="font-medium text-foreground tabular-nums">
                  {draftCount}
                </span>{" "}
                drafts
                {filtersActive && (
                  <>
                    <span aria-hidden="true"> · </span>
                    showing{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {filteredExams.length}
                    </span>
                  </>
                )}
                . Edit a draft on the right. Only the fields you change are
                saved.
              </p>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_11rem_auto] lg:max-w-xl">
              <label className="sr-only" htmlFor="exam-search">
                Search exams
              </label>
              <Input
                id="exam-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, subject, or batch"
              />
              <label className="sr-only" htmlFor="exam-date-filter">
                Filter by exam date
              </label>
              <Input
                id="exam-date-filter"
                type="date"
                value={examDateFilter}
                onChange={(e) => setExamDateFilter(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!filtersActive}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full items-start gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(28rem,36rem)]">
        <section className={cn("min-w-0", panel && "order-2 xl:order-1")}>
          <ExamList
            exams={filteredExams}
            totalCount={allExamsCount}
            batches={batches}
            activeId={panel?.id}
            onEdit={openEdit}
            onOpen={(mode, exam) => setPanel({ type: mode, id: exam.id })}
            onToggleStatus={toggleStatus}
            getBatchNames={getBatchNames}
          />
          {examDateFilter && (
            <p className="mt-3 text-xs text-muted-foreground">
              Date filter: {examDateFilter}
            </p>
          )}
        </section>

        <aside
          className={cn(
            "min-w-0 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto",
            panel ? "order-1 xl:order-2" : "hidden xl:block",
          )}
        >
          {panel?.type === "edit" && activeExam && (
            <ExamEditForm
              key={activeExam.id}
              exam={activeExam}
              batches={batches}
              onCancel={() => setPanel(null)}
            />
          )}
          {panel && panel.type !== "edit" && activeExam && (
            <ExamInsights
              exam={activeExam}
              batches={batches}
              mode={panel.type}
              onClose={() => setPanel(null)}
              onEdit={openEdit}
              getBatchNames={getBatchNames}
            />
          )}
          {!panel && <IdleEditor exams={filteredExams} onEdit={openEdit} />}
        </aside>
      </main>
    </div>
  );
}
