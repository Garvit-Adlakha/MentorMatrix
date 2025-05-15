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
      className="bg-card rounded-xl shadow-2xl border border-primary/10 backdrop-blur-sm p-6 md:p-8 space-y-6 max-w-4xl mx-auto relative"
    >
      {isLoading && (
        <div className="absolute inset-0 backdrop-blur-lg bg-neutral-900/50 rounded-xl flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <Loader className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Saving your changes...</p>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-center text-primary mb-6">Edit Your Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="md:col-span-1 flex flex-col items-center space-y-4">
          <div className="relative group">
            <img
              src={avatarPreview || "https://res.cloudinary.com/garvitadlakha08/image/upload/v1745998142/b2nsmmeoqfyenykzeaiu.png"}
              alt="Avatar Preview"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary/30 shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <label
              htmlFor="avatar"
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300"
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
          <p className="text-xs text-muted-foreground text-center">Click image to change avatar</p>
        </div>

        {/* Details Section */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-muted-foreground">
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
              className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-muted-foreground">
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
              className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-center text-sm font-medium text-muted-foreground">
              <IconBriefcase size={16} className="mr-2 text-primary" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-muted-foreground">
              <IconSchool size={16} className="mr-2 text-primary" />
              University
            </label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Your university name"
              className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-muted-foreground">
              <IconBook size={16} className="mr-2 text-primary" />
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Your department"
              className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>

          {formData.role === 'student' && (
            <>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-muted-foreground">
                  <IconId size={16} className="mr-2 text-primary" />
                  Roll Number
                </label>
                <input
                  type="text"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleChange}
                  placeholder="Your roll number"
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-muted-foreground">
                  <IconCalendar size={16} className="mr-2 text-primary" />
                  Year of Study
                </label>
                <input
                  type="text"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Year"
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-muted-foreground">
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
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-muted-foreground">
                  <IconSparkles size={16} className="mr-2 text-primary" />
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Python"
                  className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
            </>
          )}

          {formData.role === 'mentor' && (
            <div className="sm:col-span-2 space-y-2">
              <label className="flex items-center text-sm font-medium text-muted-foreground">
                <IconSparkles size={16} className="mr-2 text-primary" />
                Areas of Expertise
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                placeholder="e.g., Web Development, AI, Project Management"
                className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
              <p className="text-xs text-muted-foreground">Separate areas with commas</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200 flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconX size={16} className="mr-2 group-hover:rotate-90 transition-transform duration-200"/>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
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