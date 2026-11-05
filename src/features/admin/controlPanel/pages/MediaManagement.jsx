import React, { useState } from 'react';
import {
  ImagePlus,
  SlidersHorizontal,
  LayoutDashboard,
  ChevronRight,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { useGalleryManager } from '../hooks/useGalleryManager';
import { useSliderManager } from '../hooks/useSliderManager';
import GalleryManagement from '../components/GalleryManagement';
import SliderManagement from '../components/SliderManagement';
import SliderEditModal from '../components/SliderEditModal';
import GalleryEditModal from '../components/GalleryEditModal';

const SliderAndGalleryManagement = ({ data, close }) => {
  const [activeTab, setActiveTab] = useState('gallery');

  const galleryManager = useGalleryManager();
  const sliderManager = useSliderManager({ data, close });

  return (
    <div className="antialiased text-slate-900">
      {/* Stripe + Notion Styled Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="px-5 sm:px-5 lg:px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Notion Style Breadcrumb & Title */}
            <div>
              <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
                <div className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer">
                  <LayoutDashboard size={14} className="text-slate-400" />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={12} className="text-slate-300" />
                <div className="flex items-center gap-1 text-slate-900 font-semibold">
                  <FolderKanban size={14} className="text-indigo-600" />
                  <span>Media Center</span>
                </div>
              </nav>

              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Media Management
                </h1>
              </div>
            </div>

            {/* Tab Controls */}
            <div className="flex p-1 bg-slate-100/80 border border-slate-200/60 rounded-md w-fit">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImagePlus size={14} /> Gallery
              </button>
              <button
                onClick={() => setActiveTab('slider')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'slider'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <SlidersHorizontal size={14} /> Hero Sliders
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="px-5 sm:px-5 lg:px-5 pt-8">
        {activeTab === 'gallery' ? (
          <GalleryManagement manager={galleryManager} />
        ) : (
          <SliderManagement manager={sliderManager} />
        )}
      </main>

      {/* Modals */}
      {sliderManager.editSlider && (
        <SliderEditModal
          data={sliderManager.editSlider}
          close={() => sliderManager.setEditSlider(null)}
        />
      )}

      {galleryManager.editGallery && (
        <GalleryEditModal
          data={galleryManager.editGallery}
          close={() => galleryManager.setEditGallery(null)}
        />
      )}
    </div>
  );
};

export default SliderAndGalleryManagement;
