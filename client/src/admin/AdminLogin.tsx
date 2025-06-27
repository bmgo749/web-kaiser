import React, { useEffect, useState } from 'react';
import {
  Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle
} from './ui-components';
import { Eye, EyeOff } from 'lucide-react';
import socket from '../socket';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);

  useEffect(() => {
    
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaPassed) {
      setError('Harap selesaikan verifikasi captcha terlebih dahulu');
      return;
    }

    const validCredentials = [
      { username: 'Tupolev', password: 'SS01A1010?N*' },
      { username: 'Aldxx', password: 'AD82A0283!P@&' }
    ];

    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValid) {
      socket.connect();
      onLogin(username, password);
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Bintang */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: Math.random() * 2 + 0.5 + 'px',
              height: Math.random() * 2 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 0.8 + 's',
              animationDuration: '0.8s',
              transform: `translateX(${Math.random() * 100}px)`
            }}
          />
        ))}
        {[...Array(50)].map((_, i) => (
          <div
            key={`moving-${i}`}
            className="absolute bg-blue-300 rounded-full animate-pulse-slow"
            style={{
              width: Math.random() * 1 + 0.5 + 'px',
              height: Math.random() * 1 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: -Math.random() * 200 + 'px',
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-gray-900 border-gray-700 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Logo" className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome, Project Kaiserliche Order
          </CardTitle>
          <CardDescription className="text-gray-300">
            Masuk untuk mengakses Admin Panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                  required
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
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
