import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExamBatch, ExamRecord } from "../types/Exam.types";
import { Badge } from "@/components/ui/badge";

const SEED_MARKS: Record<
  string,
  { id: string; roll: string; name: string; mcq: number; written: number }[]
> = {};

function gradeFor(percent: number): string {
  if (percent >= 80) return "A+";
  if (percent >= 70) return "A";
  if (percent >= 60) return "A-";
  if (percent >= 50) return "B";
  if (percent >= 40) return "C";
  return "F";
}

type InsightProps = {
  exam: ExamRecord;
  batches: ExamBatch[];
  mode: "marks" | "results";
  onClose: () => void;
  onEdit: (exam: ExamRecord) => void;
  getBatchNames: (ids: string[] | undefined) => string;
};

export function ExamInsights({
  exam,
  batches,
  mode,
  onClose,
  onEdit,
}: InsightProps) {
  const marks = SEED_MARKS[exam.id] ?? [];
  const ranked = marks
    .map((row) => {
      const total = row.mcq + row.written;
      const percent = exam.fullMarks > 0 ? (total / exam.fullMarks) * 100 : 0;
      return { ...row, total, percent };
    })
    .sort((a, b) => b.total - a.total || a.roll.localeCompare(b.roll))
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      passed: row.percent >= 40,
      grade: gradeFor(row.percent),
    }));

  const passed = ranked.filter((row) => row.passed).length;

  return (
    <Card className="panel-in">
      <CardHeader>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          {mode === "marks" ? "Marks" : "Result"}
        </p>
        <CardTitle>{exam.title}</CardTitle>
        <CardDescription>
          {exam.subject} · {exam.date} · {exam.examType} ·{" "}
          {(exam.batchIds, batches)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Full" value={String(exam.fullMarks)} />
          <Stat label="MCQ" value={String(exam.mcqFullMarks)} />
          <Stat label="Written" value={String(exam.writtenFullMarks)} />
        </div>

        {ranked.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No marks have been entered for this exam yet.
          </p>
        ) : mode === "marks" ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="bg-muted text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Roll</th>
                  <th className="px-3 py-2 font-semibold">Student</th>
                  <th className="px-3 py-2 font-semibold">MCQ</th>
                  <th className="px-3 py-2 font-semibold">Written</th>
                  <th className="px-3 py-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranked.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 tabular-nums">{row.roll}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 tabular-nums">{row.mcq}</td>
                    <td className="px-3 py-2 tabular-nums">{row.written}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {passed}/{ranked.length}
              </span>{" "}
              passed at 40%.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-muted text-xs tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Rank</th>
                    <th className="px-3 py-2 font-semibold">Student</th>
                    <th className="px-3 py-2 font-semibold">Score</th>
                    <th className="px-3 py-2 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ranked.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 tabular-nums">{row.rank}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.roll}
                        </div>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.total}/{exam.fullMarks}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {row.percent.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={row.passed ? "success" : "secondary"}>
                          {row.grade}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="w-full"
            disabled={exam.status === "published"}
            title={
              exam.status === "published"
                ? "Unpublish this exam before editing"
                : undefined
            }
            onClick={() => onEdit(exam)}
          >
            Edit this exam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg tabular-nums">{value}</p>
    </div>
  );
}

export function IdleEditor({
  exams,
  onEdit,
}: {
  exams: ExamRecord[];
  onEdit: (exam: ExamRecord) => void;
}) {
  const drafts = exams.filter((exam) => exam.status === "draft").slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Editor
        </p>
        <CardTitle>Select an exam to edit</CardTitle>
        <CardDescription>
          The form opens on this side with every current value filled in. A save
          writes only the fields you change. Published exams stay locked until
          you unpublish them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Drafts ready to edit
        </p>
        <ul className="space-y-2">
          {drafts.map((exam) => (
            <li key={exam.id}>
              <button
                type="button"
                onClick={() => onEdit(exam)}
                className="flex w-full flex-col items-start gap-0.5 rounded-xl border border-border bg-background px-3 py-3 text-left hover:bg-muted"
              >
                <span className="font-semibold text-foreground">
                  {exam.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {exam.subject} · {exam.date}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
