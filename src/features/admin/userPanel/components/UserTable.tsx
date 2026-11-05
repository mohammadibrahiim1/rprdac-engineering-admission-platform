import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Database, Trash2, KeyRound, Lock } from 'lucide-react';
import { User } from '../types/user.types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  isFetching: boolean;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleStatusChange: (id: string, status: string) => void;
  handleDelete: (id: string) => void;
}

const SERVER = import.meta.env.VITE_SERVER_BASE_URL || '';

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  isFetching,
  rowSelection,
  setRowSelection,
  handleStatusChange,
  handleDelete,
}) => {
  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300 bg-gray-50 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 bg-gray-50 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'userName',
        header: 'User Profile',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.profilePicture
                    ? `${SERVER}${user?.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${user.userName}&background=6366F1&color=fff`
                }
                alt=""
                className="object-cover bg-gray-100 rounded-lg w-8 h-8 ring-1 ring-black/5"
                onError={(e: any) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user.userName}&background=6366F1&color=fff`;
                }}
              />
              <div>
                <span className="font-semibold text-sm text-[#37352f] block">
                  {user.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {user.email || user.phone}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'userType',
        header: 'User Type',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1.5 text-xs text-sky-600 font-medium">
              <span>
                {user.userType === 'staff' ? 'employee' : user?.userType}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <select
              value={user.status}
              onChange={(e) => handleStatusChange(user._id, e.target.value)}
              className={`text-xs font-bold px-2.5 py-1 rounded-md border-none outline-none cursor-pointer uppercase transition-all
                ${
                  user.status === 'approved'
                    ? 'bg-[#e2f5ea] text-[#0e7043]'
                    : user.status === 'pending'
                      ? 'bg-[#fff1d6] text-[#7a4e05]'
                      : 'bg-[#ffe2e2] text-[#ae2e2e]'
                }`}
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role & Department',
        cell: ({ row }) => {
          const user = row.original;
          // Check kora hocche user-er responsibility ba access ache kina
          const hasAccess =
            user?.responsibility && user.responsibility.length > 0;

          return (
            <div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1.5 ${
                  hasAccess
                    ? 'bg-sky-50 text-sky-700 border border-sky-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}
              >
                {hasAccess ? (
                  <KeyRound className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                {hasAccess
                  ? user.role || user.userType || 'Access Granted'
                  : 'No Access'}
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                {hasAccess
                  ? user?.responsibility
                      ?.map((responsible) => responsible?.panel)
                      .join(', ')
                  : 'Restricted Access'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: () => (
          <span className="text-xs text-gray-500">Just now (US-East)</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="text-right">
            <button
              onClick={() => handleDelete(row.original._id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white  border border-[#37352f]/10 rounded-md capitalize overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[#37352f]/10 bg-[#f7f6f3]/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-xs font-semibold text-[#37352f]/40 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#37352f]/5">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: 'linear',
                      }}
                      className="w-6 h-6 border-2 border-sky-500 rounded-full border-t-transparent"
                    />
                    <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                      Please wait...
                    </span>
                  </div>
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <Database className="w-10 h-10 mb-2 text-gray-500" />
                    <p className="text-sm text-[#37352f]">
                      No members found matching filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#f7f6f3]/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
