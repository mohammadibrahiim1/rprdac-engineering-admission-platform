import React from "react";
import { motion } from "framer-motion";
import { Database, Trash2, KeyRound, Lock } from "lucide-react";
import { IUser } from "../types/User.types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserTableProps {
  users: IUser[];
  isLoading: boolean;
  isFetching: boolean;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleStatusChange: (id: string, status: string) => void;
  handleDelete: (id: string) => void;
}

const SERVER = import.meta.env.VITE_SERVER_BASE_URL || "";

export const UserTable: React.FC<UserTableProps> = ({
  users = [],
  isLoading,
  isFetching,
  rowSelection,
  setRowSelection,
  handleStatusChange,
  handleDelete,
}) => {
  // Check if all visible users are selected
  const isAllSelected =
    users.length > 0 && users.every((user) => Boolean(rowSelection[user._id]));

  // Check if some (but not all) visible users are selected for indeterminate state
  const isSomeSelected =
    users.some((user) => Boolean(rowSelection[user._id])) && !isAllSelected;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const nextSelection: Record<string, boolean> = { ...rowSelection };
      users.forEach((user) => {
        nextSelection[user._id] = true;
      });
      setRowSelection(nextSelection);
    } else {
      const nextSelection: Record<string, boolean> = { ...rowSelection };
      users.forEach((user) => {
        delete nextSelection[user._id];
      });
      setRowSelection(nextSelection);
    }
  };

  const handleSelectRow = (
    userId: string,
    checked: boolean | "indeterminate",
  ) => {
    setRowSelection((prev) => {
      const updated = { ...prev };
      if (checked === true) {
        updated[userId] = true;
      } else {
        delete updated[userId];
      }
      return updated;
    });
  };

  const getStatusBadgeStyles = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-[#e2f5ea] text-[#0e7043] hover:bg-[#d4eedf]";
      case "pending":
        return "bg-[#fff1d6] text-[#7a4e05] hover:bg-[#fae6be]";
      default:
        return "bg-[#ffe2e2] text-[#ae2e2e] hover:bg-[#fad2d2]";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full bg-white border border-[#37352f]/10 rounded-md overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[850px] w-full border-collapse text-left">
          <TableHeader className="bg-[#f7f6f3]/70 border-b border-[#37352f]/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[48px] px-4 py-3.5">
                <Checkbox
                  checked={
                    isAllSelected
                      ? true
                      : isSomeSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all users"
                  className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 data-[state=indeterminate]:bg-indigo-600 data-[state=indeterminate]:border-indigo-600"
                />
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/50 uppercase tracking-wider">
                User Profile
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/50 uppercase tracking-wider">
                User Type
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/50 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/50 uppercase tracking-wider">
                Role & Department
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/50 uppercase tracking-wider">
                Last Active
              </TableHead>
              <TableHead className="w-[70px] px-4 py-3.5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#37352f]/5">
            {isLoading || isFetching ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-sky-500 rounded-full border-t-transparent"
                    />
                    <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                      Please wait...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <Database className="w-10 h-10 mb-2 text-gray-500" />
                    <p className="text-sm font-medium text-[#37352f]">
                      No members found matching filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelected = Boolean(rowSelection[user._id]);
                const hasAccess =
                  Array.isArray(user?.responsibility) &&
                  user.responsibility.length > 0;

                const avatarSrc = user?.profilePicture
                  ? `${SERVER}${user.profilePicture}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.userName || "User",
                    )}&background=6366F1&color=fff`;

                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    data-state={isSelected ? "selected" : undefined}
                    className="border-b border-[#37352f]/5 hover:bg-[#f7f6f3]/60 data-[state=selected]:bg-indigo-50/40 transition-colors group"
                  >
                    {/* Checkbox */}
                    <TableCell className="px-4 py-3.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(user._id, checked)
                        }
                        aria-label={`Select ${user.userName}`}
                        className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </TableCell>

                    {/* User Profile */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-lg ring-1 ring-black/5 bg-gray-100">
                          <AvatarImage
                            src={avatarSrc}
                            alt={user.userName}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-lg bg-indigo-500 text-white text-xs font-medium">
                            {getInitials(user.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-[#37352f] block truncate capitalize">
                            {user.userName}
                          </span>
                          <span className="text-xs text-gray-400 block truncate lowercase">
                            {user.email || user.phone || "No contact info"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* User Type */}
                    <TableCell className="px-4 py-3.5">
                      <span className="inline-flex items-center text-xs text-sky-600 font-medium capitalize">
                        {user.userType === "staff"
                          ? "employee"
                          : user?.userType || "N/A"}
                      </span>
                    </TableCell>

                    {/* Status Select */}
                    <TableCell className="px-4 py-3.5">
                      <Select
                        value={user.status}
                        onValueChange={(value) =>
                          handleStatusChange(user._id, value)
                        }
                      >
                        <SelectTrigger
                          className={`h-7 w-[115px] text-xs font-bold uppercase border-none shadow-none focus:ring-1 focus:ring-black/10 transition-all ${getStatusBadgeStyles(
                            user.status,
                          )}`}
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="approved"
                            className="text-xs font-semibold text-[#0e7043] uppercase cursor-pointer"
                          >
                            Approved
                          </SelectItem>
                          <SelectItem
                            value="pending"
                            className="text-xs font-semibold text-[#7a4e05] uppercase cursor-pointer"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="rejected"
                            className="text-xs font-semibold text-[#ae2e2e] uppercase cursor-pointer"
                          >
                            Rejected
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Role & Department */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex flex-col items-start">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1.5 capitalize ${
                            hasAccess
                              ? "bg-sky-50 text-sky-700 border border-sky-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {hasAccess ? (
                            <KeyRound className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {hasAccess
                            ? user.role || user.userType || "Access Granted"
                            : "No Access"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 capitalize line-clamp-1 max-w-[200px]">
                          {hasAccess
                            ? user.responsibility
                                ?.map((responsible) => responsible?.panel)
                                .filter(Boolean)
                                .join(", ")
                            : "Restricted Access"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Last Active */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-gray-500">
                        Just now (US-East)
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user._id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete {user.userName}</span>
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
