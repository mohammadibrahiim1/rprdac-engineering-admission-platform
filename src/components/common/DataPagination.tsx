import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number | string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number | string) => void;
  isFetching?: boolean;
  limitOptions?: (number | "all")[];
  className?: string;
  siblingCount?: number;
}

export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
  limitOptions = [5, 10, 20, 50, "all"],
  className,
  siblingCount = 1,
}: DataPaginationProps) {
  if (totalItems === 0) return null;

  const isAll = String(limit).toLowerCase() === "all";
  const numericLimit = isAll ? totalItems : Number(limit) || 10;

  const startItem = (currentPage - 1) * numericLimit + 1;
  const endItem = isAll
    ? totalItems
    : Math.min(currentPage * numericLimit, totalItems);

  const handleLimitChange = (value: string | null) => {
    if (value === null) return;
    onLimitChange(value);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    // Always show first page
    pages.push(1);

    // Left ellipsis
    if (leftSibling > 2) {
      pages.push("ellipsis");
    } else if (leftSibling === 2) {
      pages.push(2);
    }

    // Middle pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Right ellipsis
    if (rightSibling < totalPages - 1) {
      pages.push("ellipsis");
    } else if (rightSibling === totalPages - 1) {
      pages.push(totalPages - 1);
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Left: Results info + Rows per page */}
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
        <p>
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span>{" "}
          results
        </p>

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows per page</span>
          <Select
            value={String(limit)}
            onValueChange={handleLimitChange}
            disabled={isFetching}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {limitOptions.map((option) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {option === "all" ? "All" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Pagination controls */}
      {!isAll && totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1 && !isFetching) {
                    onPageChange(currentPage - 1);
                  }
                }}
                className={cn(
                  currentPage <= 1 || isFetching
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer",
                )}
                aria-disabled={currentPage <= 1 || isFetching}
              />
            </PaginationItem>

            {/* Page numbers */}
            {pageNumbers.map((page, index) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isFetching && page !== currentPage) {
                        onPageChange(page);
                      }
                    }}
                    className={cn(
                      isFetching && "pointer-events-none opacity-50",
                      "cursor-pointer",
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages && !isFetching) {
                    onPageChange(currentPage + 1);
                  }
                }}
                className={cn(
                  currentPage >= totalPages || isFetching
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer",
                )}
                aria-disabled={currentPage >= totalPages || isFetching}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
