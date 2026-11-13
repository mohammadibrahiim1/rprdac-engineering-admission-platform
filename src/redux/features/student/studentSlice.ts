import {
  StudentFormState,
  StudentSliceState,
  UpdateFieldPayload,
} from '../../../features/dashboards/admin/studentPanel/types/allStudents.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// ────────────────────────────────────────────────
// Async Thunk
// ────────────────────────────────────────────────
export const postStudent = createAsyncThunk<
  any, // Return type
  FormData, // Argument type
  { rejectValue: string } // ThunkAPI config
>('student/postStudent', async (formData, { rejectWithValue }) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await axios.post('/api/students', formData, config);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.response?.data ||
        'Failed to submit student form',
    );
  }
});

// ────────────────────────────────────────────────
// Initial State
// ────────────────────────────────────────────────
const initialStudent: StudentFormState = {
  receiptNo: '',
  name: '',
  nameInBangla: '',
  phone: '',
  studentWhatsAppNum: '',
  studentId: '',
  department: '',
  batch: '',
  oldBatch: '',
  newBatch: '',
  session: '',
  instituteName: '',

  guardianName: '',
  guardianPhone: '',
  relationWithGuardian: '',
  guardianWhatsAppNum: '',

  permanentVillage: '',
  permanentUpozilla: '',
  permanentPostcode: '',
  permanentZilla: '',

  presentVillage: '',
  presentUpozilla: '',
  presentPostcode: '',
  presentZilla: '',
  sameAsPermanent: false,

  mess: '',
  room: '',
  messServiceCharge: 0,
  messServiceChargePaid: 0,

  bloodGroup: '',
  studentPhoto: null,

  sscGroup: '',
  sscBoard: '',
  sscPassingYear: null,
  sscGpa: null,

  diplomaGroup: '',
  diplomaBoard: 'BTEB',
  diplomaPassingYear: null,
  diplomaGpa: null,

  courseFee: 0,
  admissionFee: 0,
  admissionFeePaid: 0,
  dueAmount: 0,

  accountNumber: '',
  transactionId: '',
  paymentMethod: '',

  cgpa: null,
  cgpaDiscount: 0,
  referenceDiscount: 0,
  cashback: 0,
  studentReturnAmount: 0,
  totalAfterDiscount: 0,
  deductMoney: 0,
};

const initialState: StudentSliceState = {
  student: initialStudent,
  loading: false,
  error: null,
};

// ────────────────────────────────────────────────
// Slice
// ────────────────────────────────────────────────
const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    updatedField: (state, action: PayloadAction<UpdateFieldPayload>) => {
      const name = action.payload?.name || action.payload?.key;
      const value = action.payload?.value;

      if (!name) return;

      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        const parentObj = (state.student as any)[parent];
        if (parentObj && typeof parentObj === 'object') {
          parentObj[child] = value;
        }
      } else {
        (state.student as any)[name] = value;
      }
    },

    resetForm: () => initialState,

    setImageUrl: (state, action: PayloadAction<string>) => {
      state.student.imageURL = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(postStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.student = { ...initialStudent, ...action.payload };
      })
      .addCase(postStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { updatedField, resetForm, setImageUrl } = studentSlice.actions;
export default studentSlice.reducer;
