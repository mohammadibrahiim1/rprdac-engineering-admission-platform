"use client";

import { Filter, Search, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoticeFiltersProps {
  searchTerm: string;
  selectedDate: string;
  selectedAuthor: string;
  uniqueAuthors: string[];
  totalItems: number;
  todayCount: number;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onClearFilters: () => void;
}

export function NoticeFilters({
  searchTerm,
  selectedDate,
  selectedAuthor,
  uniqueAuthors,
  totalItems,
  todayCount,
  onSearchChange,
  onDateChange,
  onAuthorChange,
  onClearFilters,
}: NoticeFiltersProps) {
  const hasFilters = !!(searchTerm || selectedDate || selectedAuthor);

  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notices..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Author */}
        {uniqueAuthors.length > 0 && (
          <div className="space-y-2">
            <Label>Author</Label>
            <Select
              value={selectedAuthor || "all"}
              onValueChange={(v) => onAuthorChange(v === "all" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors
                  .filter((author): author is string => !!author)
                  .map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onClearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Quick Stats
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary">Total</p>
              <p className="text-xl font-bold text-primary">{totalItems}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs font-medium text-emerald-600">Today</p>
              <p className="text-xl font-bold text-emerald-700">{todayCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
