import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconUser, IconMail, IconBriefcase, IconSchool, IconBook, IconSparkles, IconUpload, IconX, IconDeviceFloppy, IconId, IconCalendar } from '../ui/Icons';
import { motion } from 'motion/react';
import Loader from '../ui/Loader';

const ProfileEditing = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        bio: initialData.bio || '',
        university: initialData.university || '',
        department: initialData.department || '',
        roll_no: initialData.roll_no || '',
        yearOfStudy: initialData.yearOfStudy || '',
        cgpa: initialData.cgpa || '',
        skills: initialData.skills ? initialData.skills.join(', ') : '',
        expertise: initialData.expertise ? initialData.expertise.join(', ') : '',
        role: initialData.role || 'student',
      });
      setAvatarPreview(initialData.avatar?.url || null);
      setIsInitialLoading(false);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSave = { ...formData };
      if (dataToSave.skills && typeof dataToSave.skills === 'string') {
        dataToSave.skills = dataToSave.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      }
      if (dataToSave.expertise && typeof dataToSave.expertise === 'string') {
        dataToSave.expertise = dataToSave.expertise.split(',').map(exp => exp.trim()).filter(exp => exp);
      }
      if (avatarFile) {
        dataToSave.avatar = avatarFile;
      }
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="relative mx-auto max-w-5xl overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.45)] backdrop-blur-[18px] md:p-8"
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[18px] bg-slate-950/60 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-3">
            <Loader className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Saving your changes...</p>
          </div>
        </div>
      )}
      
      <h2 className="mb-6 text-center text-2xl font-bold text-orange-400 md:text-[1.6rem]">Edit Your Profile</h2>
      
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4 md:col-span-1">
          <div className="relative group">
            <img
              src={avatarPreview || "https://res.cloudinary.com/garvitadlakha08/image/upload/v1745998142/b2nsmmeoqfyenykzeaiu.png"}
              alt="Avatar Preview"
              className="h-32 w-32 rounded-full border-4 border-orange-500/30 object-cover shadow-[0_14px_26px_rgba(0,0,0,0.4)] md:h-36 md:w-36"
            />
            <label
              htmlFor="avatar"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <IconUpload size={30} className="text-white transform transition-transform duration-300 group-hover:scale-110" />
            </label>
          </div>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-center text-xs text-white/50">Click image to change avatar</p>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-4 md:col-span-2 sm:grid-cols-2 md:gap-5">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-white/70">
              <IconUser size={16} className="mr-2 text-primary" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-white/70">
              <IconMail size={16} className="mr-2 text-primary" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-center text-sm font-semibold text-white/70">
              <IconBriefcase size={16} className="mr-2 text-primary" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-white/70">
              <IconSchool size={16} className="mr-2 text-primary" />
              University
            </label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Your university name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-white/70">
              <IconBook size={16} className="mr-2 text-primary" />
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Your department"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>

          {formData.role === 'student' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-white/70">
                  <IconId size={16} className="mr-2 text-primary" />
                  Roll Number
                </label>
                <input
                  type="text"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleChange}
                  placeholder="Your roll number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-white/70">
                  <IconCalendar size={16} className="mr-2 text-primary" />
                  Year of Study
                </label>
                <input
                  type="text"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Year"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-white/70">
                  <IconSparkles size={16} className="mr-2 text-primary" />
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="Your CGPA"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-white/70">
                  <IconSparkles size={16} className="mr-2 text-primary" />
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Python"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
                />
                <p className="text-xs text-white/50">Separate skills with commas</p>
              </div>
            </>
          )}

          {formData.role === 'mentor' && (
            <div className="sm:col-span-2 space-y-2">
              <label className="flex items-center text-sm font-semibold text-white/70">
                <IconSparkles size={16} className="mr-2 text-primary" />
                Areas of Expertise
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                placeholder="e.g., Web Development, AI, Project Management"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15"
              />
              <p className="text-xs text-white/50">Separate areas with commas</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex items-center rounded-xl bg-white/6 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10"
        >
          <IconX size={16} className="mr-2 group-hover:rotate-90 transition-transform duration-200"/>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,107,0,0.25)] transition hover:from-orange-600 hover:to-orange-700"
        >
          <IconDeviceFloppy size={16} className="mr-2 group-hover:animate-pulse"/>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </motion.form>
  );
};

ProfileEditing.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    university: PropTypes.string,
    department: PropTypes.string,
    roll_no: PropTypes.string,
    yearOfStudy: PropTypes.string,
    cgpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    skills: PropTypes.arrayOf(PropTypes.string),
    expertise: PropTypes.arrayOf(PropTypes.string),
    role: PropTypes.string,
    avatar: PropTypes.shape({
      url: PropTypes.string,
    }),
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProfileEditing;