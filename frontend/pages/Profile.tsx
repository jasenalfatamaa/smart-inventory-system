
import React, { useState, useRef } from 'react';
import { User as UserIcon, Mail, Shield, Smartphone, MapPin, Calendar, Edit3, Save, X, ChevronDown, Camera } from 'lucide-react';
import { useAuth } from '../context';
import Card from '../components/Card';
import Button from '../components/Button';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    pob: user?.pob || '',
    dob: user?.dob || '',
    avatar: user?.avatar || '',
  });

  const handleSave = async () => {
    if (user) {
      await updateUser({
        ...user,
        ...formData
      });
      setIsEditing(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Not set";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {!isEditing ? (
          <Button variant="secondary" onClick={() => setIsEditing(true)} icon={<Edit3 size={16} className="mr-2" />}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData({ name: user?.name || '', username: user?.username || '', phone: user?.phone || '', pob: user?.pob || '', dob: user?.dob || '', avatar: user?.avatar || '' }); }} icon={<X size={16} className="mr-2" />}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} icon={<Save size={16} className="mr-2" />}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card className="flex flex-col items-center py-12 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
        <div className="relative group">
          <img
            src={isEditing ? formData.avatar : user?.avatar}
            className="w-32 h-32 rounded-3xl ring-4 ring-white shadow-xl object-cover transition-all group-hover:brightness-90"
            alt="User Avatar"
          />

          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-white/90 p-2 rounded-full shadow-lg">
                <Camera size={20} className="text-sky-600" />
              </div>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />

          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-sky-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
            <Shield size={18} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          {isEditing ? (
            <input
              className="text-2xl font-bold text-slate-900 text-center bg-sky-50 rounded-lg px-3 py-1 outline-none border-b-2 border-sky-500 mb-2"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
          )}
          <div>
            <p className="text-sm font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full inline-block">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Account Info</h3>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <UserIcon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Username</p>
              {isEditing ? (
                <input
                  className="w-full text-sm font-medium border-b border-sky-500 bg-transparent py-1 outline-none"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700">@{user?.username}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Mail size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
              <p className="text-sm font-semibold text-slate-700">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Personal Info</h3>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</p>
              {isEditing ? (
                <input
                  className="w-full text-sm font-medium border-b border-sky-500 bg-transparent py-1 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0812345..."
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700">{user?.phone || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Place of Birth</p>
              {isEditing ? (
                <input
                  className="w-full text-sm font-medium border-b border-sky-500 bg-transparent py-1 outline-none"
                  value={formData.pob}
                  onChange={e => setFormData({ ...formData, pob: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700">{user?.pob || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Date of Birth</p>
              {isEditing ? (
                <div className="relative group min-h-[32px] flex items-center border-b border-sky-500/20 group-hover:border-sky-500 transition-colors">
                  <div className="absolute inset-0 flex items-center pointer-events-none z-0">
                    <span className={`text-sm font-medium ${formData.dob ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formatDateDisplay(formData.dob)}
                    </span>
                    <div className="flex-1"></div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    onClick={(e) => {
                      try { (e.target as any).showPicker(); } catch (err) { }
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-700">{formatDateDisplay(user?.dob || '')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
