import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UserData {
  full_name: string;
  email: string;
  phone: string;
  profile_pic: string | null;
  profile_pic_hash: string | null;
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserData>({
    full_name: '',
    email: '',
    phone: '',
    profile_pic: null,
    profile_pic_hash: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppingFile, setCroppingFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, phone, profile_pic, profile_pic_hash')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data) {
        setUserData(data);
      }
      setLoading(false);
    }

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update password. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleprofile_pictureClick = () => {
    fileInputRef.current?.click();
  };

  // Step 1: When user selects a file, show crop modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setShowCropModal(true);
      setCroppingFile(file);
      setCrop({ unit: '%', width: 50, aspect: 1 }); // reset crop
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Crop image and upload
  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current || !croppingFile) return;

    setUploading(true);
    setMessage(null);

    // Create cropped image blob
    const croppedBlob = await getCroppedImg(
      imgRef.current,
      completedCrop,
      croppingFile.type
    );
    if (!croppedBlob) {
      setUploading(false);
      setShowCropModal(false);
      setMessage({ type: 'error', text: 'Failed to crop the image.' });
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Delete the old profile picture if it exists
      if (userData.profile_pic) {
        // Extract the file path from the URL
        const url = new URL(userData.profile_pic);
        const pathParts = url.pathname.split('/');

        // Find the profile_pics folder and filename in the path
        const pathIndex = pathParts.findIndex(
          (part) => part === 'profile_pics'
        );
        if (pathIndex !== -1 && pathIndex < pathParts.length - 1) {
          const filePath = `profile_pics/${pathParts[pathIndex + 1]}`;

          // Delete the old file
          const { error: deleteError } = await supabase.storage
            .from('advisor-connect')
            .remove([filePath]);

          if (deleteError) {
            console.warn('Error deleting old profile picture:', deleteError);
            // Continue with upload even if delete fails
          }
        }
      }

      const fileExt = croppingFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Convert blob to File for upload
      const croppedFile = new File([croppedBlob], fileName, {
        type: croppingFile.type,
      });

      const { error: uploadError } = await supabase.storage
        .from('advisor-connect')
        .upload(`profile_pics/${filePath}`, croppedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('advisor-connect')
        .getPublicUrl(`profile_pics/${filePath}`);

      const imageHash = Math.random().toString(36).substring(2);
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_pic: urlData.publicUrl,
          profile_pic_hash: imageHash,
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setUserData({
        ...userData,
        profile_pic: urlData.publicUrl,
        profile_pic_hash: imageHash,
      });

      setMessage({
        type: 'success',
        text: 'Profile picture updated successfully!',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({
        type: 'error',
        text: 'Failed to upload profile picture. Please try again.',
      });
    } finally {
      setUploading(false);
      setShowCropModal(false);
      setSelectedImage(null);
      setCroppingFile(null);
      setCompletedCrop(null);
    }
  };

  // Helper: get cropped image as Blob
  async function getCroppedImg(
    image: HTMLImageElement,
    crop: Crop,
    fileType: string
  ): Promise<Blob | null> {
    if (!crop.width || !crop.height) return null;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas is empty'));
        },
        fileType,
        1
      );
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Crop your profile picture
            </h3>
            <div>
              {selectedImage && (
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  onComplete={setCompletedCrop}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    style={{ maxHeight: 300, maxWidth: '100%' }}
                    onLoad={() => setCrop({ ...crop })} // Fix crop box on load
                  />
                </ReactCrop>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedImage(null);
                  setCroppingFile(null);
                  setCompletedCrop(null);
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={handleCropAndUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100"
              onClick={handleprofile_pictureClick}
              style={{ cursor: 'pointer' }}
            >
              {userData.profile_pic ? (
                <img
                  src={`${userData.profile_pic}?hash=${userData.profile_pic_hash}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 focus:outline-none"
              onClick={handleprofile_pictureClick}
              disabled={uploading}
            >
              {uploading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={userData.full_name}
              onChange={(e) =>
                setUserData({ ...userData, full_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={userData.email}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={userData.phone || ''}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
