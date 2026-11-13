"use client";

import {
  Megaphone,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Notice } from "../types/Notice.types";
import { getTimeAgo } from "@/utils/getTimeAgo";

interface NoticeInboxProps {
  notices: Notice[];
  selectedNotice: Notice | null;
  isLoading: boolean;
  error: any;
  totalItems: number;
  page: number;
  totalPages: number;
  onSelectNotice: (notice: Notice) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onCreateFirst: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function NoticeInbox({
  notices,
  selectedNotice,
  isLoading,
  error,
  totalItems,
  page,
  totalPages,
  onSelectNotice,
  onPageChange,
  onRetry,
  onCreateFirst,
  onClearFilters,
  hasActiveFilters,
}: NoticeInboxProps) {
  return (
    <Card className="flex h-full flex-col border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Notice Inbox
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalItems} Notices found
          </p>
        </div>
        {selectedNotice && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => onSelectNotice(selectedNotice)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-[calc(100vh-340px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="text-sm text-destructive">
                {error?.data?.message || "Error loading notices"}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={onRetry}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">No notices found</p>
              {hasActiveFilters ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onClearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onCreateFirst}
                  className="mt-2"
                >
                  Create your first notice
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {notices.map((notice) => (
                <button
                  key={notice._id}
                  type="button"
                  onClick={() => onSelectNotice(notice)}
                  className={cn(
                    "w-full p-4 text-left transition-colors hover:bg-muted/50",
                    selectedNotice?._id === notice._id &&
                      "bg-primary/5 border-r-4 border-primary",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {notice.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {notice.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notice.author?.name || notice.authorName || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(new Date(notice.createdAt))}
                        </span>
                      </div>
                    </div>

                    {notice.tags && notice.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {notice.tags.slice(0, 2).map((tag: any) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => onPageChange(Math.max(page - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(totalPages, 3) }).map((_, idx) => {
                let pageNum: number;
                if (totalPages <= 3) pageNum = idx + 1;
                else if (page === 1) pageNum = idx + 1;
                else if (page === totalPages) pageNum = totalPages - 2 + idx;
                else pageNum = page - 1 + idx;

                return (
                  <Button
                    key={idx}
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === totalPages}
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
