import React, { useEffect, useState, useCallback } from 'react';
import trainerProfileService from '@/services/trainerProfile.service';
import trainingClipService from '@/services/trainingClip.service';
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/sweetAlerts';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const INITIAL_TRAINER_FORM = {
  name: '', email: '', password: '', dob: '', contact: '',
  specialization: '', bio: '', certifications: '', available_to: ''
};

const getClipUrl = (clipPath) => {
  if (!clipPath) return '';
  if (clipPath.startsWith('http')) return clipPath;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}${clipPath.startsWith('/') ? clipPath : `/${clipPath}`}`;
};

const isVideoClip = (path) => /\.(mp4|webm|ogg|mov|m4v)$/i.test(path || '');

const TrainerManagement = () => {
  const [activeTab, setActiveTab] = useState('trainers');
  const [loading, setLoading] = useState(true);
  
  // --- Trainers State ---
  const [trainers, setTrainers] = useState([]);
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [trainerForm, setTrainerForm] = useState(INITIAL_TRAINER_FORM);
  const [submittingTrainer, setSubmittingTrainer] = useState(false);

  // --- Training Clips State ---
  const [clips, setClips] = useState([]);
  const [isAddingClip, setIsAddingClip] = useState(false);
  const [newClip, setNewClip] = useState({ trainer_id: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [selectedTrainerProfile, setSelectedTrainerProfile] = useState(null);
  const [trainerDetailLoading, setTrainerDetailLoading] = useState(false);
  const [contactTrainer, setContactTrainer] = useState(null);
  const [viewingClip, setViewingClip] = useState(null);

  const matchTrainer = useCallback(
    (trainer, query) =>
      trainer.name.toLowerCase().includes(query) ||
      (trainer.email && trainer.email.toLowerCase().includes(query)) ||
      (trainer.specialization && trainer.specialization.toLowerCase().includes(query)),
    []
  );

  const matchClip = useCallback((clip, query) => {
    const trainer = clip.trainer_id?.user_id?.name?.toLowerCase() || '';
    const description = clip.description?.toLowerCase() || '';
    return trainer.includes(query) || description.includes(query);
  }, []);

  const trainerList = usePaginatedSearch(trainers, matchTrainer);
  const clipList = usePaginatedSearch(clips, matchClip);

  const formatTrainer = (p) => ({
    name: p.user_id?.name || 'Unknown',
    specialization: p.specialization || 'General',
    email: p.user_id?.email || 'N/A',
    contact: p.user_id?.contact || '',
    dob: p.user_id?.dob
      ? new Date(p.user_id.dob).toISOString().split('T')[0]
      : '',
    bio: p.bio || '',
    certifications: Array.isArray(p.certifications) ? p.certifications.join(', ') : '',
    profile_image: p.user_id?.profile_image,
    id: p._id,
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
  });

  const resetTrainerForm = () => {
    setIsAddingTrainer(false);
    setEditingTrainerId(null);
    setTrainerForm(INITIAL_TRAINER_FORM);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'trainers') {
        const res = await trainerProfileService.getAllProfiles({ limit: 500 });
        if (res.status === 'success') {
          setTrainers((res.profiles || []).map(formatTrainer));
        }
      } else {
        const [clipsRes, trainersRes] = await Promise.all([
          trainingClipService.getAllClips({ limit: 500 }),
          trainerProfileService.getAllProfiles({ limit: 500 })
        ]);
        if (clipsRes.status === 'success') setClips(clipsRes.clips || []);
        if (trainersRes.status === 'success') {
          setTrainers((trainersRes.profiles || []).map(formatTrainer));
        }
      }
    } catch (err) {
      console.error("Error fetching trainer data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingTrainer(true);
      const certsArray = trainerForm.certifications
        ? trainerForm.certifications.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      if (editingTrainerId) {
        const payload = {
          name: trainerForm.name,
          email: trainerForm.email,
          contact: trainerForm.contact || null,
          dob: trainerForm.dob || null,
          specialization: trainerForm.specialization,
          bio: trainerForm.bio || '',
          certifications: certsArray,
        };
        if (trainerForm.password) payload.password = trainerForm.password;

        const res = await trainerProfileService.updateProfile(editingTrainerId, payload);
        if (res.status === 'success') {
          showSuccess("Trainer Updated", `${trainerForm.name}'s profile has been saved.`);
          resetTrainerForm();
          fetchData();
        }
      } else {
        const res = await trainerProfileService.registerTrainer({
          ...trainerForm,
          certifications: certsArray
        });

        if (res.status === 'success') {
          showSuccess("Trainer Registered", `${trainerForm.name} is now part of the team.`);
          resetTrainerForm();
          fetchData();
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        (editingTrainerId ? "Failed to update trainer." : "Failed to register trainer.");
      showError("Error", msg);
    } finally {
      setSubmittingTrainer(false);
    }
  };

  const handleEditTrainer = (trainer) => {
    setEditingTrainerId(trainer.id);
    setIsAddingTrainer(true);
    setTrainerForm({
      name: trainer.name || '',
      email: trainer.email === 'N/A' ? '' : (trainer.email || ''),
      password: '',
      dob: trainer.dob || '',
      contact: trainer.contact || '',
      specialization: trainer.specialization || '',
      bio: trainer.bio || '',
      certifications: trainer.certifications || '',
      available_to: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTrainer = async (trainer) => {
    const confirmed = await showConfirm(
      "Remove Trainer?",
      `Are you sure you want to permanently delete ${trainer.name}? Their account and training clips will be removed.`
    );
    if (!confirmed) return;
    try {
      await trainerProfileService.deleteProfile(trainer.id);
      showSuccess("Removed", `${trainer.name} has been removed from the team.`);
      setTrainers((prev) => prev.filter((t) => t.id !== trainer.id));
      if (editingTrainerId === trainer.id) resetTrainerForm();
      if (selectedTrainerProfile?._id === trainer.id) setSelectedTrainerProfile(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete trainer.";
      showError("Delete Failed", msg);
    }
  };

  // --- Clip Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    const isVideo = file.type.startsWith('video/');
    setSelectedFile(file);
    setPreviewIsVideo(isVideo);
    setPreview(URL.createObjectURL(file));
  };

  const handleViewPerformance = async (trainerId) => {
    try {
      setTrainerDetailLoading(true);
      setSelectedTrainerProfile(null);
      const [profileRes, clipsRes] = await Promise.all([
        trainerProfileService.getProfileById(trainerId),
        trainingClipService.getAllClips({ limit: 500 }),
      ]);

      if (profileRes.status === 'success') {
        const trainerClips = (clipsRes.clips || []).filter(
          (clip) => clip.trainer_id?._id === trainerId || clip.trainer_id === trainerId
        );
        setSelectedTrainerProfile({
          ...profileRes.profile,
          clipCount: trainerClips.length,
        });
      }
    } catch {
      showError('Error', 'Failed to load trainer performance details.');
    } finally {
      setTrainerDetailLoading(false);
    }
  };

  const handleContactTrainer = (trainer) => {
    setContactTrainer(trainer);
  };

  const handleAddClip = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showWarning("File Required", "Please select a training clip file to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('trainer_id', newClip.trainer_id);
      formData.append('description', newClip.description);
      formData.append('clip', selectedFile);

      const res = await trainingClipService.createClip(formData);
      if (res.status === 'success') {
        showSuccess("Clip Uploaded", "Training clip has been added successfully.");
        fetchData();
        setIsAddingClip(false);
        setNewClip({ trainer_id: '', description: '' });
        setSelectedFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setPreviewIsVideo(false);
      }
    } catch {
      showError("Upload Failed", "Failed to upload clip. Ensure it's a valid image/video and under size limit.");
    }
  };

  const handleDeleteClip = async (id) => {
    const confirmed = await showConfirm("Delete Clip?", "Are you sure you want to delete this training clip?");
    if (!confirmed) return;
    try {
      await trainingClipService.deleteClip(id);
      showSuccess("Deleted", "Training clip has been removed.");
      setClips(clips.filter(c => c._id !== id));
    } catch (err) {
      showError("Delete Failed", "Failed to delete training clip.");
      console.error("Error deleting clip:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header & Internal Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col md:flex-row flex-1 items-start md:items-center gap-4 w-full">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900 leading-tight">
              Staff Management
            </h3>
            <div className="flex space-x-6 mt-3">
              {["trainers", "clips"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsAddingClip(false);
                    resetTrainerForm();
                  }}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 pb-1 border-b-2 ${
                    activeTab === tab
                      ? "text-purple-600 border-purple-600"
                      : "text-gray-400 border-transparent hover:text-purple-400"
                  }`}
                >
                  {tab === "trainers" ? "TEAM TRAINERS" : "TRAINING CLIPS"}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md w-full md:ml-8">
            <DashboardSearchBar
              value={activeTab === 'trainers' ? trainerList.searchQuery : clipList.searchQuery}
              onChange={activeTab === 'trainers' ? trainerList.setSearchQuery : clipList.setSearchQuery}
              placeholder={activeTab === 'trainers' ? 'Search trainers...' : 'Search clips...'}
              variant="admin"
              className="md:w-full [&_input]:focus:border-purple-600"
            />
          </div>
        </div>

        {activeTab === 'trainers' ? (
          <button 
            onClick={() => {
              if (isAddingTrainer || editingTrainerId) {
                resetTrainerForm();
              } else {
                setIsAddingTrainer(true);
              }
            }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${
              isAddingTrainer || editingTrainerId
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
            }`}
          >
            {isAddingTrainer || editingTrainerId
              ? 'CANCEL'
              : '+ REGISTER NEW TRAINER'}
          </button>
        ) : (
          <button 
            onClick={() => setIsAddingClip(!isAddingClip)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition"
          >
            {isAddingClip ? "CANCEL" : "+ UPLOAD NEW CLIP"}
          </button>
        )}
      </div>

      {activeTab === 'trainers' && isAddingTrainer && (
        <div className="bg-white rounded-3xl border-2 border-purple-50 shadow-2xl overflow-hidden animate-slideUp">
          <div className="bg-purple-600 p-6">
            <h4 className="text-white font-black italic uppercase tracking-widest text-sm">
              {editingTrainerId ? 'Edit Trainer' : 'Trainer Onboarding'}
            </h4>
            <p className="text-purple-100 text-[9px] font-bold uppercase mt-1">
              {editingTrainerId
                ? 'Update account and professional profile details'
                : 'Configure user account and professional profile'}
            </p>
          </div>
          <form onSubmit={handleTrainerSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Account */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest pb-2 border-b border-gray-100">1. Account Details</h5>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                <input required type="text" value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition" placeholder="Alex Rivers" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Email Address</label>
                <input required type="email" value={trainerForm.email} onChange={e => setTrainerForm({...trainerForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition" placeholder="alex@cylonforce.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  {editingTrainerId ? 'New Password (optional)' : 'Login Password'}
                </label>
                <input
                  required={!editingTrainerId}
                  type="password"
                  value={trainerForm.password}
                  onChange={e => setTrainerForm({...trainerForm, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition"
                  placeholder={editingTrainerId ? 'Leave blank to keep current' : '••••••••'}
                  minLength={editingTrainerId ? undefined : 6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">DOB</label>
                  <input type="date" value={trainerForm.dob} onChange={e => setTrainerForm({...trainerForm, dob: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-3 py-3 rounded-xl text-[10px] font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Contact</label>
                  <input type="text" value={trainerForm.contact} onChange={e => setTrainerForm({...trainerForm, contact: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-3 py-3 rounded-xl text-[10px] font-bold outline-none" placeholder="+94 ..." />
                </div>
              </div>
            </div>

            {/* Right: Professional */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest pb-2 border-b border-gray-100">2. Professional Profile</h5>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Area of Specialization</label>
                <input required type="text" value={trainerForm.specialization} onChange={e => setTrainerForm({...trainerForm, specialization: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition" placeholder="CrossFit / Bodybuilding / Yoga" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Professional Bio</label>
                <textarea value={trainerForm.bio} onChange={e => setTrainerForm({...trainerForm, bio: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition h-20 resize-none" placeholder="Experience and training philosophy..." />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Certifications (Comma separated)</label>
                <input type="text" value={trainerForm.certifications} onChange={e => setTrainerForm({...trainerForm, certifications: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition" placeholder="ISSA, NASM, ACE..." />
              </div>
              
              <div className="pt-2">
                <button 
                  disabled={submittingTrainer}
                  type="submit"
                  className="w-full bg-purple-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-600/30 hover:bg-purple-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingTrainer
                    ? (editingTrainerId ? 'SAVING...' : 'ONBOARDING...')
                    : (editingTrainerId ? 'SAVE CHANGES' : 'COMPLETE ONBOARDING')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'trainers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100">
                Loading Trainers List...
              </div>
            ) : trainerList.paginatedItems.length > 0 ? (
              <>
              {trainerList.paginatedItems.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-md transition">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-105 transition overflow-hidden">
                    <span className="relative z-0">{t.name.charAt(0)}</span>
                    {t.profile_image && (
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${t.profile_image}`} 
                        alt={t.name} 
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-blue-900 uppercase">{t.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.specialization}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleEditTrainer(t)}
                    className="bg-purple-50 text-purple-700 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewPerformance(t.id)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContactTrainer(t)}
                    className="bg-gray-100 text-gray-500 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-100 hover:text-purple-700 transition"
                  >
                    Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrainer(t)}
                    className="bg-red-50 text-red-500 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
              <DashboardPagination
                currentPage={trainerList.currentPage}
                totalPages={trainerList.totalPages}
                onPageChange={trainerList.setCurrentPage}
                totalItems={trainerList.totalItems}
                itemsPerPage={trainerList.itemsPerPage}
                className="[&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-purple-600"
              />
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100">
                {trainerList.searchQuery
                  ? `No trainers found matching "${trainerList.searchQuery}"`
                  : "No trainers found in system"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {isAddingClip && (
            <form onSubmit={handleAddClip} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Trainer *</label>
                  <select required value={newClip.trainer_id} onChange={(e) => setNewClip({...newClip, trainer_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition">
                    <option value="">Select Trainer</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <input type="text" value={newClip.description} onChange={(e) => setNewClip({...newClip, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition" placeholder="Muscle buildup tips..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Clip File *</label>
                  <input
                    type="file"
                    required
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleFileChange}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                  />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    MP4, WebM, or MOV video files
                  </p>
                </div>
                <button type="submit" className="bg-green-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg shadow-green-500/20">UPLOAD CLIP</button>
              </div>
              {preview && (
                 <div className="mt-6 border-t border-gray-50 pt-6">
                   <div className="w-full max-w-sm aspect-video rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-200">
                     {previewIsVideo ? (
                       <video src={preview} controls className="w-full h-full object-cover bg-black" />
                     ) : (
                       <img src={preview} alt="Upload Preview" className="w-full h-full object-cover" />
                     )}
                   </div>
                 </div>
              )}
            </form>
          )}

          {loading ? (
             <div className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100">Loading Clips...</div>
          ) : clipList.paginatedItems.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clipList.paginatedItems.map((clip) => (
                <div key={clip._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group flex flex-col">
                  <div className="w-full aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                    {isVideoClip(clip.clip) ? (
                      <video
                        src={getClipUrl(clip.clip)}
                        className="w-full h-full object-cover bg-black"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={getClipUrl(clip.clip)} alt="Clip" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button type="button" onClick={() => handleDeleteClip(clip._id)} className="bg-red-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs hover:bg-red-600 shadow-lg">🗑️</button>
                    </div>
                  </div>
                  <h4 className="font-black text-blue-900 uppercase text-xs truncate">{clip.trainer_id?.user_id?.name || 'Deleted Trainer'}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase mb-auto line-clamp-2">{clip.description || 'No description'}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setViewingClip(clip)}
                      className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition"
                    >
                      Full View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <DashboardPagination
              currentPage={clipList.currentPage}
              totalPages={clipList.totalPages}
              onPageChange={clipList.setCurrentPage}
              totalItems={clipList.totalItems}
              itemsPerPage={clipList.itemsPerPage}
              className="[&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-blue-600"
            />
            </>
          ) : (
            <div className="py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100">
              {clipList.searchQuery ? 'No clips match your search.' : 'No clips found.'}
            </div>
          )}
        </div>
      )}

      {/* Trainer performance drawer */}
      {(selectedTrainerProfile || trainerDetailLoading) && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-gray-200 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-700 to-blue-700 flex justify-between items-start gap-4">
              <div>
                <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Trainer Performance</p>
                <h4 className="text-xl font-black italic uppercase text-white mt-1">
                  {trainerDetailLoading ? 'Loading...' : selectedTrainerProfile?.user_id?.name}
                </h4>
              </div>
              <button type="button" onClick={() => setSelectedTrainerProfile(null)} className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10">✕</button>
            </div>
            {trainerDetailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 text-center">
                    <p className="text-2xl font-black text-purple-700">{selectedTrainerProfile.clipCount || 0}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Training Clips</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                    <p className="text-sm font-black text-blue-700 uppercase">{selectedTrainerProfile.specialization || 'General'}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Specialization</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-blue-900">{selectedTrainerProfile.user_id?.email || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-sm font-bold text-blue-900">{selectedTrainerProfile.user_id?.contact || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedTrainerProfile.bio || 'No bio provided.'}</p>
                  </div>
                  {selectedTrainerProfile.certifications?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTrainerProfile.certifications.map((cert) => (
                        <span key={cert} className="text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
      )}

      {/* Contact trainer modal */}
      {contactTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-3xl p-8 w-full max-w-md border border-gray-200">
            <h4 className="text-lg font-black uppercase text-blue-900 mb-1">Contact Trainer</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{contactTrainer.name}</p>
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-blue-900 mt-1 break-all">{contactTrainer.email}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                <p className="text-sm font-bold text-blue-900 mt-1">{contactTrainer.contact || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`mailto:${contactTrainer.email}`}
                className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition"
              >
                Send Email
              </a>
              {contactTrainer.contact && (
                <a
                  href={`tel:${contactTrainer.contact}`}
                  className="flex-1 text-center bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition"
                >
                  Call
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setContactTrainer(null)}
              className="w-full mt-3 border border-gray-200 text-gray-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Clip full view modal */}
      {viewingClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-3xl p-6 w-full max-w-3xl border border-gray-200">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h4 className="text-lg font-black uppercase text-blue-900">
                  {viewingClip.trainer_id?.user_id?.name || 'Training Clip'}
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {viewingClip.description || 'No description'}
                </p>
              </div>
              <button type="button" onClick={() => setViewingClip(null)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-200">
              {isVideoClip(viewingClip.clip) ? (
                <video
                  key={viewingClip._id}
                  src={getClipUrl(viewingClip.clip)}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img src={getClipUrl(viewingClip.clip)} alt="Training clip" className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;
