import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useDeleteQuestionMutation,
  useGetAllFAQsQuery,
  usePostFAQMutation,
} from '../../../../../redux/features/FAQ/faqApi';
import { MdAdd, MdHelpOutline, MdList, MdSearch } from 'react-icons/md';
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  Loader2,
  Trash2,
} from 'lucide-react';

const FAQ = () => {
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [postFAQ] = usePostFAQMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const { data: faqs, isLoading } = useGetAllFAQsQuery();

  const allFaqs = faqs?.data || [];

  // Search Filter logic
  const filteredFaqs = allFaqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteQuestion(id).unwrap();
        toast.success('Question removed');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await postFAQ(formData).unwrap();
      toast.success('FAQ added successfully');
      setFormData({ question: '', answer: '' });
    } catch (error) {
      toast.error(error.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-sans">
      {/* Header / Breadcrumb */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="px-4 py-8 mx-auto sm:px-6 lg:px-12">
          <nav className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5 transition-colors hover:text-blue-600 cursor-pointer">
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-900">Faq</span>
          </nav>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                FAQ Management
              </h1>
              <p className="text-sm text-slate-500">
                Add and manage frequently asked questions for your users.
              </p>
            </div>

            <div className="relative">
              <MdSearch
                className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm transition-all border border-transparent rounded-md outline-none bg-slate-100 focus:bg-white focus:border-slate-200 md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 py-8 sm:px-6 lg:px-12">
        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT SIDE: FORM (4 Columns) */}
          <div className="sticky lg:col-span-4 top-28">
            <div className="overflow-hidden transition-all bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <MdAdd size={18} />
                  </div>
                  <h2 className="font-semibold tracking-tight text-slate-800">
                    Add New Question
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    The Question
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="Enter short & clear question"
                    className="w-full px-3 py-2 text-sm font-medium transition-all bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    The Answer
                  </label>
                  <textarea
                    name="answer"
                    rows={6}
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    placeholder="Provide a detailed solution..."
                    className="w-full px-3 py-2 text-sm transition-all bg-white border rounded-md outline-none border-slate-200 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900"
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-md shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <MdAdd size={18} />
                  )}
                  {isSubmitting ? 'Publishing...' : 'Publish Question'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: TABLE LIST (8 Columns) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <MdList className="text-slate-400" size={20} />
                  <h3 className="font-semibold text-slate-800">
                    Published Questions
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                  {filteredFaqs.length} Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="border-b bg-slate-50/50 border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-slate-500">
                        Question & Answer
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right uppercase text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      [1, 2, 3, 4].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="w-3/4 h-4 mb-2 rounded bg-slate-100"></div>
                            <div className="w-1/2 h-3 rounded bg-slate-50"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="w-8 h-8 ml-auto rounded bg-slate-100"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredFaqs?.length > 0 ? (
                      <AnimatePresence mode="popLayout">
                        {filteredFaqs?.map((faq) => (
                          <motion.tr
                            layout
                            key={faq._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="transition-colors group hover:bg-slate-50/50"
                          >
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-lg font-semibold leading-tight text-slate-800 font-sans sm:text-xl">
                                  {faq.question}
                                </span>
                                <p className="text-base italic text-slate-500 line-clamp-2 sm:text-lg font-sans">
                                  {faq.answer}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() => handleDelete(faq._id)}
                                className="inline-flex items-center justify-center p-2 transition-all rounded-md opacity-0 text-slate-400 hover:text-red-600 hover:bg-red-50 group-hover:opacity-100"
                                title="Delete FAQ"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <MdHelpOutline
                              className="text-slate-200"
                              size={48}
                            />
                            <p className="font-medium text-slate-400">
                              No results matching your query.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
