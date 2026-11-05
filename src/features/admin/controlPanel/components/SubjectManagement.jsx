import { useState } from 'react';
import { BookOpen, Building } from 'lucide-react';
import Subjects from './Subjects';
import Departments from './Departments';

const SubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'departments'

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="px-5 py-6">
        {/* Header + Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {activeTab === 'subjects'
              ? 'Subject Management'
              : 'Department Management'}
          </h1>
          <p className="mt-1 text-gray-600">
            {activeTab === 'subjects'
              ? 'Manage all subjects and their options'
              : 'Manage academic departments'}
          </p>

          {/* Tabs */}
          <div className="flex p-1 mt-6 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-5 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                activeTab === 'subjects'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Subjects
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-5 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
                activeTab === 'departments'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="w-4 h-4" />
              Departments
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'subjects' ? <Subjects /> : <Departments />}
      </div>
    </div>
  );
};

export default SubjectManagement;
