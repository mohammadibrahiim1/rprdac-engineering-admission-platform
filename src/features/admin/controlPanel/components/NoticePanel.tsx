"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  X,
  Send,
  Check,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { Notice, ViewMode } from "../types/Notice.types";
import { getTimeAgo } from "@/utils/getTimeAgo";

interface NoticePanelProps {
  viewMode: ViewMode;
  selectedNotice: Notice | null;
  editingNotice: Notice | null;
  isSubmitting: boolean;
  deletingId: string | null;
  onEdit: (notice: Notice) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    tags: string[];
  }) => Promise<void>;
  onCreateMode: () => void;
}

export function NoticePanel({
  viewMode,
  selectedNotice,
  editingNotice,
  isSubmitting,
  deletingId,
  onEdit,
  onDelete,
  onCancel,
  onSubmit,
  onCreateMode,
}: NoticePanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Sync form when entering edit mode
  useEffect(() => {
    if (viewMode === "edit" && editingNotice) {
      setTitle(editingNotice.title);
      setContent(editingNotice.content);
      setTags(editingNotice.tags || []);
    } else if (viewMode === "add") {
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
    }
  }, [viewMode, editingNotice]);

  const characterCount = content.length;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await onSubmit({ title: title.trim(), content: content.trim(), tags });
  };

  // ---------- Empty State ----------
  if (viewMode === "inbox" && !selectedNotice) {
    return (
      <Card className="flex h-full flex-col items-center justify-center border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Megaphone className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Select a Notice</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Choose a notice from the inbox to view details, or create a new
            notice to get started.
          </p>
          <Button onClick={onCreateMode}>
            <Plus className="mr-2 h-4 w-4" />
            Create Notice
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ---------- View Mode ----------
  if (viewMode === "view" && selectedNotice) {
    return (
      <Card className="h-full border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Notice Details</CardTitle>
              <p className="text-xs text-muted-foreground">
                {getTimeAgo(new Date(selectedNotice?.createdAt))}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(selectedNotice)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              disabled={deletingId === selectedNotice._id}
              onClick={() => onDelete(selectedNotice._id)}
              title="Delete"
            >
              {deletingId === selectedNotice._id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold leading-tight">
              {selectedNotice.title}
            </h2>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              বিস্তারিত
            </p>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedNotice.content}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Author
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {selectedNotice.author?.name ||
                    selectedNotice.authorName ||
                    "RPR DUET Admission Care"}
                </span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Role
              </p>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800"
              >
                {selectedNotice.author?.role ||
                  selectedNotice.authorRole ||
                  "Admin"}
              </Badge>
            </div>
          </div>

          {selectedNotice.tags && selectedNotice.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedNotice?.tags?.map((tag: any) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // ---------- Add / Edit Form ----------
  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {viewMode === "edit" ? (
              <Edit2 className="h-5 w-5 text-primary" />
            ) : (
              <Plus className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-base">
              {viewMode === "edit" ? "Edit Notice" : "Create New Notice"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {viewMode === "edit"
                ? "Update the notice details"
                : "Share important information with your community"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title"
              maxLength={100}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">
                Content <span className="text-destructive">*</span>
              </Label>
              <span
                className={cn(
                  "text-xs",
                  characterCount > 450
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {characterCount}/500
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notice content here..."
              rows={6}
              maxLength={500}
              required
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              Tags <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {viewMode === "edit" ? "Updating..." : "Publishing..."}
                </div>
              ) : viewMode === "edit" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Notice
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Notice
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
