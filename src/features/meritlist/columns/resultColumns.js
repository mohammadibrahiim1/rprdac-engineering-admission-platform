import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export const resultColumns = [
  columnHelper.accessor('slNo', {
    id: 'slNo',
    header: 'SL',
  }),

  columnHelper.accessor('rollNo', {
    id: 'rollNo',
    header: 'Roll No',
  }),

  columnHelper.accessor('name', {
    id: 'name',
    header: 'Name',
  }),

  columnHelper.accessor('mcqMarks', {
    id: 'mcqMarks',
    header: 'MCQ Marks',
  }),

  columnHelper.accessor('nonDeptMarks', {
    id: 'nonDeptMarks',
    header: 'Non Dept. Marks',
  }),

  columnHelper.accessor('deptMarks', {
    id: 'deptMarks',
    header: 'Dept. Marks',
  }),

  columnHelper.accessor('obtainedMarks', {
    id: 'obtainedMarks',
    header: 'Obtained Marks',
  }),
];
