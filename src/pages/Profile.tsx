import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Trophy, Upload, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GlitchText from "@/components/GlitchText";
import ApiService from "@/services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [nextRankXP, setNextRankXP] = useState(100); // Example threshold

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${base}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      updateUser({ ...user, profileImage: data.imageUrl });

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const xpProgress = ((user?.xp || 0) / nextRankXP) * 100;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-4xl font-orbitron font-bold mb-6">
        <GlitchText text="Profile" />
      </h1>

      {/* Profile Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Avatar and Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile image</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.profileImage} alt={user?.email} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </CardContent>
        </Card>

        {/* XP and Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Progress & Ranking</CardTitle>
            <CardDescription>Your learning journey stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current XP</span>
                <span className="text-primary">{user?.xp || 0} XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level {Math.floor((user?.xp || 0) / 100)}</span>
                <span>{nextRankXP - (user?.xp || 0)} XP to next level</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Global Rank</span>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-bold">#{user?.rank || '--'}</span>
                </div>
              </div>
              
              {user?.nextAhead && (
                <div className="text-sm text-muted-foreground">
                  <span>Next player ahead: </span>
                  <span className="text-primary">{user.nextAhead.name}</span>
                  <span> with </span>
                  <span className="text-primary">{user.nextAhead.xp} XP</span>
                  <span> (+{user.nextAhead.xp - (user?.xp || 0)} XP needed)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Member Since</label>
            <Input value={new Date(user?.createdAt || Date.now()).toLocaleDateString()} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subscription Status</label>
            <Input value={user?.subscription?.plan || 'Free'} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}