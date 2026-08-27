import React, { useCallback, useEffect, useState } from 'react';
import trainingClipService from '@/services/trainingClip.service';
import Swal from 'sweetalert2';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const TrainerClips = () => {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const matchClip = useCallback((clip, query) => {
    const desc = clip.description?.toLowerCase() || '';
    const date = new Date(clip.createdAt).toLocaleDateString().toLowerCase();
    return desc.includes(query) || date.includes(query);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedClips,
    totalItems,
    itemsPerPage,
    filteredItems,
  } = usePaginatedSearch(clips, matchClip);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const res = await trainingClipService.getMyClips();
      if (res.status === 'success') {
        setClips(res.clips || []);
      }
    } catch (err) {
      console.error("Error loading trainer clips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a video file.' });
      return;
    }

    const formData = new FormData();
    formData.append('clip', videoFile);
    formData.append('description', description);

    try {
      setUploading(true);
      await trainingClipService.createClip(formData);
      Swal.fire({ icon: 'success', title: 'Uploaded', text: 'Video clip uploaded successfully!' });
      setDescription('');
      setVideoFile(null);
      setModalOpen(false);
      fetchClips();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.response?.data?.message || 'Error uploading file.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This video will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    });

    if (result.isConfirmed) {
      try {
        await trainingClipService.deleteClip(id);
        Swal.fire('Deleted!', 'Video clip has been deleted.', 'success');
        fetchClips();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete clip.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Training <span className="text-red-600">Video Clips</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {totalItems} clips uploaded
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clips..."
          />
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest px-5 py-3 rounded-xl uppercase transition-all shadow-lg shadow-red-600/20 whitespace-nowrap"
          >
            Upload Video Clip +
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
          Loading videos...
        </div>
      ) : clips.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No training videos uploaded. Upload .mp4 tutorials to guide your clients.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No clips match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedClips.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-red-600 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-800 bg-black relative">
                    <video
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${item.clip}`}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-300 leading-relaxed uppercase">
                      {item.description || 'No Description'}
                    </p>
                    <span className="text-[8px] font-black text-gray-600 tracking-widest uppercase mt-2 block">
                      Published: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="w-full border border-gray-800 text-gray-500 hover:border-red-600 hover:text-red-500 text-[9px] font-black tracking-widest py-3 rounded-xl uppercase transition-all mt-6"
                >
                  Delete Clip
                </button>
              </div>
            ))}
          </div>

          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 max-w-md w-full z-10 space-y-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
              Upload Exercise Clip
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Select Video File (.mp4 / video)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 focus:outline-none focus:border-red-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Description / Exercise Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ENTER DESCRIPTION OR INSTRUCTIONAL DETAILS..."
                  rows="3"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-red-600 transition-all placeholder-gray-600 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest py-3.5 rounded-xl uppercase transition-all shadow-xl shadow-red-600/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading Video File...' : 'Upload Clip'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClips;
