import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Avatar, AvatarFallback, AvatarImage } from './ui-components';
import { User, Camera, Eye, EyeOff, Save } from 'lucide-react';

interface UserProfileProps {
  username: string;
  profileImage: string;
  onProfileImageChange: (newImage: string) => void;
  addAdminLog: (action: string, details: string) => void;
}

export default function UserProfile({ username, profileImage, onProfileImageChange, addAdminLog }: UserProfileProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentPassword = 'SANDI980@a';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onProfileImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Password konfirmasi tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    
    addAdminLog('Password Change', 'Mengubah password admin');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditing(false);
    alert('Password berhasil diubah');
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Info Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImage} alt={username} />
                <AvatarFallback className="text-xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full p-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-400">Klik ikon kamera untuk mengubah foto profil</p>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={username}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-white">Role</Label>
              <Input
                id="role"
                value="Administrator"
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {isEditing ? 'Batal' : 'Ubah Password'}
              </Button>
            </div>
            
            {!isEditing ? (
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  disabled
                  className="bg-gray-50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newPassword" className="text-white">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={!newPassword || !confirmPassword}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Password
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Statistik Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-blue-800">Terakhir Login</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-green-800">Status Account</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Admin</div>
              <div className="text-sm text-purple-800">Level Akses</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}