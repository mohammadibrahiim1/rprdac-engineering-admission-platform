import React, { type FC, type ChangeEvent } from 'react';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardSection from '../../common/CardSection';
import FormField from '../../common/FormField';
import SearchableSelect from '../../common/SearchableSelect';
import TextInput from '../../common/TextInput';

export interface MessItem {
  _id?: string;
  name: string;
  [key: string]: unknown;
}

export interface StudentMessData {
  mess?: string | null;
  messReceiptNo?: string | null;
  messServiceCharge?: number | string | null;
  room?: string | null;
  [key: string]: unknown;
}

export interface MessHostelInfoProps {
  student?: StudentMessData | null;
  handleChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
  ) => void;
  messes?: MessItem[];
  loadingMesses?: boolean;
  messSelected?: boolean;
}

export const MessHostelInfo: FC<MessHostelInfoProps> = ({
  student,
  handleChange,
  messes = [],
  loadingMesses = false,
  messSelected = false,
}) => {
  const serviceChargeValue =
    student?.messServiceCharge !== undefined &&
    student?.messServiceCharge !== null
      ? String(student.messServiceCharge)
      : '';

  return (
    <CardSection icon={Home} iconColor="text-amber-500" title="Mess / Hostel">
      <div className="space-y-4">
        <FormField label="Mess / Hostel Name">
          <SearchableSelect
            name="mess"
            value={student?.mess ? String(student.mess) : ''}
            onChange={handleChange}
            options={messes.map((m) => m.name)}
            placeholder="Search mess or hostel..."
            isLoading={loadingMesses}
          />
        </FormField>

        {/* Service charge & Room — only visible when mess is selected */}
        <AnimatePresence>
          {messSelected && (
            <motion.div
              key="mess-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
                <FormField label="Mess Receipt Number" required>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[12.5px] font-bold text-[#9b9a97] pointer-events-none select-none">
                      HSC-
                    </span>
                    <input
                      type="text"
                      name="messReceiptNo"
                      value={
                        student?.messReceiptNo
                          ? String(student.messReceiptNo).replace(/^HSC-/, '')
                          : ''
                      }
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        handleChange({
                          target: {
                            name: 'messReceiptNo',
                            value: `HSC-${value}`,
                          },
                        });
                      }}
                      placeholder="Enter number"
                      required
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-md border border-[#e3e2de] text-[12.5px] text-[#37352f] placeholder-[#9b9a97] bg-white hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20 outline-none transition-all"
                    />
                  </div>
                </FormField>

                <FormField label="Service Charge">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[13px] text-[#9b9a97] pointer-events-none">
                      ৳
                    </span>
                    <input
                      type="number"
                      name="messServiceCharge"
                      value={serviceChargeValue}
                      onChange={handleChange}
                      placeholder="Enter charge"
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-md border border-[#e3e2de] text-[13.5px] text-[#37352f] placeholder-[#9b9a97] bg-white hover:border-[#b5b3aa] hover:bg-[#fafaf9] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/20 outline-none transition-all"
                    />
                  </div>
                </FormField>

                <FormField label="Room Number">
                  <TextInput
                    name="room"
                    value={student?.room ? String(student.room) : ''}
                    onChange={handleChange}
                    placeholder="Enter room number"
                  />
                </FormField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardSection>
  );
};

export default MessHostelInfo;