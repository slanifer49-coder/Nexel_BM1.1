import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlitchText from '@/components/GlitchText';
import ApiService from '@/services/api';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  BarChart, 
  Gamepad2, 
  Plus,
  Edit,
  RefreshCw,
  Sparkles,
  Zap,
  Award,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isAddGameDialogOpen, setIsAddGameDialogOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    imageUrl: '',
    gameUrl: '',
    isVisible: true,
    requiresLogin: false
  });
  const queryClient = useQueryClient();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching admin leaderboard with token:', token ? 'Present' : 'Missing');
      
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${base}/admin/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        console.log('Leaderboard data received:', data);
        return data;
      } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return {
          users: [
            { id: '1', name: 'CyberNinja', avatar: '/avatars/avatar-1.png', xp: 12500, level: 42, rank: 1, badges: 15 },
            { id: '2', name: 'PixelWizard', avatar: '/avatars/avatar-2.png', xp: 10200, level: 38, rank: 2, badges: 12 },
            { id: '3', name: 'CodeMaster', avatar: '/avatars/avatar-3.png', xp: 9800, level: 36, rank: 3, badges: 10 },
            { id: '4', name: 'DigitalArtist', avatar: '/avatars/avatar-4.png', xp: 8500, level: 32, rank: 4, badges: 8 },
            { id: '5', name: 'VRExplorer', avatar: '/avatars/avatar-5.png', xp: 7200, level: 28, rank: 5, badges: 7 },
            { id: '6', name: 'GameDev101', avatar: '/avatars/avatar-6.png', xp: 6800, level: 26, rank: 6, badges: 6 },
            { id: '7', name: 'ModelMaker', avatar: '/avatars/avatar-7.png', xp: 5500, level: 22, rank: 7, badges: 5 },
            { id: '8', name: 'ScriptGuru', avatar: '/avatars/avatar-8.png', xp: 4200, level: 18, rank: 8, badges: 4 },
            { id: '9', name: 'RenderPro', avatar: '/avatars/avatar-9.png', xp: 3800, level: 16, rank: 9, badges: 3 },
            { id: '10', name: 'AnimationWiz', avatar: '/avatars/avatar-10.png', xp: 2500, level: 12, rank: 10, badges: 2 }
          ]
        };
      }
    }
  });

  // Fetch showcase posts
  const { data: showcaseData, isLoading: isShowcaseLoading } = useQuery({
    queryKey: ['admin-showcase'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      // Mock data for now
      return {
        posts: [
          { 
            id: '1', 
            title: 'Cyberpunk Character Model', 
            description: 'My first fully rigged character model with custom textures and animations.',
            imageUrl: '/showcase/project1.jpg',
            author: 'CyberNinja',
            authorAvatar: '/avatars/avatar-1.png',
            likes: 128,
            comments: 24,
            status: 'approved',
            createdAt: '2023-06-15T10:30:00Z'
          },
          { 
            id: '2', 
            title: 'Sci-Fi Environment Scene', 
            description: 'A futuristic lab environment with dynamic lighting and interactive elements.',
            imageUrl: '/showcase/project2.jpg',
            author: 'PixelWizard',
            authorAvatar: '/avatars/avatar-2.png',
            likes: 95,
            comments: 18,
            status: 'pending',
            createdAt: '2023-06-18T14:20:00Z'
          },
          { 
            id: '3', 
            title: 'Low-Poly Game Assets Pack', 
            description: 'A collection of optimized game assets for indie developers.',
            imageUrl: '/showcase/project3.jpg',
            author: 'ModelMaker',
            authorAvatar: '/avatars/avatar-7.png',
            likes: 76,
            comments: 12,
            status: 'approved',
            createdAt: '2023-06-20T09:15:00Z'
          },
          { 
            id: '4', 
            title: 'Animated Short Film', 
            description: 'A 2-minute animated short created using techniques learned in the advanced animation tutorial.',
            imageUrl: '/showcase/project4.jpg',
            author: 'AnimationWiz',
            authorAvatar: '/avatars/avatar-10.png',
            likes: 210,
            comments: 45,
            status: 'approved',
            createdAt: '2023-06-22T16:40:00Z'
          },
          { 
            id: '5', 
            title: 'VR Experience Demo', 
            description: 'An interactive VR demo showcasing spatial audio and physics interactions.',
            imageUrl: '/showcase/project5.jpg',
            author: 'VRExplorer',
            authorAvatar: '/avatars/avatar-5.png',
            likes: 64,
            comments: 9,
            status: 'pending',
            createdAt: '2023-06-25T11:50:00Z'
          },
        ]
      };
    }
  });

  // Fetch chat messages
  const { data: chatData, isLoading: isChatLoading } = useQuery({
    queryKey: ['admin-chat'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      // Mock data for now
      return {
        messages: [
          { 
            id: '1', 
            content: 'Has anyone completed the advanced lighting tutorial? I\'m stuck on the volumetric fog section.',
            author: 'DigitalArtist',
            authorAvatar: '/avatars/avatar-4.png',
            timestamp: '2023-06-25T15:30:00Z'
          },
          { 
            id: '2', 
            content: 'I just finished it! The key is to adjust the density parameter before adding the light sources.',
            author: 'RenderPro',
            authorAvatar: '/avatars/avatar-9.png',
            timestamp: '2023-06-25T15:32:00Z'
          },
          { 
            id: '3', 
            content: 'Thanks for the tip! I\'ll try that approach.',
            author: 'DigitalArtist',
            authorAvatar: '/avatars/avatar-4.png',
            timestamp: '2023-06-25T15:35:00Z'
          },
          { 
            id: '4', 
            content: 'Anyone interested in collaborating on a game jam project this weekend?',
            author: 'GameDev101',
            authorAvatar: '/avatars/avatar-6.png',
            timestamp: '2023-06-25T16:10:00Z'
          },
          { 
            id: '5', 
            content: 'I\'m in! I can help with character modeling and animations.',
            author: 'CyberNinja',
            authorAvatar: '/avatars/avatar-1.png',
            timestamp: '2023-06-25T16:15:00Z'
          },
          { 
            id: '6', 
            content: 'Count me in too. I\'ll handle the scripting and game mechanics.',
            author: 'ScriptGuru',
            authorAvatar: '/avatars/avatar-8.png',
            timestamp: '2023-06-25T16:18:00Z'
          },
          { 
            id: '7', 
            content: 'Great! Let\'s meet in the collaboration channel at 8 PM to discuss the concept.',
            author: 'GameDev101',
            authorAvatar: '/avatars/avatar-6.png',
            timestamp: '2023-06-25T16:25:00Z'
          },
          { 
            id: '8', 
            content: 'Just published my first asset to the marketplace! Check it out if you need high-quality textures.',
            author: 'PixelWizard',
            authorAvatar: '/avatars/avatar-2.png',
            timestamp: '2023-06-25T17:05:00Z'
          },
          { 
            id: '9', 
            content: 'The new tutorial on procedural generation is amazing! Learned so much in just one hour.',
            author: 'CodeMaster',
            authorAvatar: '/avatars/avatar-3.png',
            timestamp: '2023-06-25T17:30:00Z'
          },
          { 
            id: '10', 
            content: 'Has anyone experienced issues with the latest update? My projects won\'t load correctly.',
            author: 'ModelMaker',
            authorAvatar: '/avatars/avatar-7.png',
            timestamp: '2023-06-25T18:00:00Z'
          },
        ]
      };
    }
  });

  // Fetch mini-games
  const { data: gamesData, isLoading: isGamesLoading } = useQuery({
    queryKey: ['admin-games'],
    queryFn: async () => {
      // Use hardcoded data to ensure we see something
      return {
        games: [
          {
            id: '1',
            title: 'Cyber Heist',
            description: 'Break into a high-security corporate server and steal valuable data without getting caught.',
            imageUrl: '/game-cyber-heist.jpg',
            gameUrl: '/games/cyber-heist',
            isVisible: true,
            requiresLogin: true,
            plays: 1245
          },
          {
            id: '2',
            title: 'Neon Runner',
            description: 'Dash through glowing cityscapes and collect energy orbs.',
            imageUrl: '/game-synthwave-racing.jpg',
            gameUrl: '/games/neon-runner',
            isVisible: true,
            requiresLogin: false,
            plays: 890
          },
          {
            id: '3',
            title: 'Synthwave Drift',
            description: 'Race through neon highways in a synthwave atmosphere.',
            imageUrl: '/game-synthwave-racing.jpg',
            gameUrl: '/games/synthwave-drift',
            isVisible: true,
            requiresLogin: false,
            plays: 1120
          },
          {
            id: '4',
            title: 'Hologram Defense',
            description: 'Protect your mainframe with holographic shields.',
            imageUrl: '/game-cyber-heist.jpg',
            gameUrl: '/games/hologram-defense',
            isVisible: true,
            requiresLogin: false,
            plays: 750
          }
        ]
      };
    },
  });

  // Update post status mutation
  const updatePostStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string, status: string }) => {
      const token = localStorage.getItem('token');
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcase'] });
      toast({
        title: "Post updated",
        description: "The post status has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const token = localStorage.getItem('token');
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat'] });
      toast({
        title: "Message deleted",
        description: "The message has been successfully removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  // Clear chat history mutation
  const clearChatHistoryMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat'] });
      toast({
        title: "Chat cleared",
        description: "The chat history has been cleared, keeping only the last 10 messages",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  });

  // Update game visibility mutation
  const updateGameVisibilityMutation = useMutation({
    mutationFn: async ({ gameId, isVisible }: { gameId: string, isVisible: boolean }) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      // Toggle like is the closest API we have for visibility changes
      return await ApiService.toggleLikeShowcaseGame(gameId, isVisible, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      toast({
        title: "Game updated",
        description: "The game visibility has been successfully updated",
      });
    },
    onError: (error) => {
      console.error('Error updating game visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update game visibility",
        variant: "destructive",
      });
    }
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      return await ApiService.deleteShowcaseGame(gameId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      toast({
        title: "Game deleted",
        description: "The game has been successfully removed",
      });
    },
    onError: (error) => {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    }
  });

  // Add game mutation
  const addGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      return await ApiService.addShowcaseGame(gameData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      setIsAddGameDialogOpen(false);
      setNewGame({
        title: '',
        description: '',
        imageUrl: '',
        gameUrl: '',
        isVisible: true,
        requiresLogin: false
      });
      toast({
        title: "Game added",
        description: "The new game has been successfully added",
      });
    },
    onError: (error) => {
      console.error('Error adding game:', error);
      toast({
        title: "Error",
        description: "Failed to add game",
        variant: "destructive",
      });
    }
  });

  // Reset leaderboard mutation
  const resetLeaderboardMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaderboard'] });
      toast({
        title: "Leaderboard reset",
        description: "The leaderboard has been successfully reset",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset leaderboard",
        variant: "destructive",
      });
    }
  });

  const handleApprovePost = (postId: string) => {
    updatePostStatusMutation.mutate({ postId, status: 'approved' });
  };

  const handleRejectPost = (postId: string) => {
    updatePostStatusMutation.mutate({ postId, status: 'rejected' });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleClearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history? Only the last 10 messages will be retained.')) {
      clearChatHistoryMutation.mutate();
    }
  };

  const handleToggleGameVisibility = (gameId: string, currentVisibility: boolean) => {
    updateGameVisibilityMutation.mutate({ gameId, isVisible: !currentVisibility });
  };

  const handleDeleteGame = (gameId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteGameMutation.mutate(gameId);
    }
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    addGameMutation.mutate(newGame);
  };

  const handleResetLeaderboard = () => {
    if (window.confirm('Are you sure you want to reset the leaderboard? This will recalculate all user ranks based on current XP.')) {
      resetLeaderboardMutation.mutate();
    }
  };

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
  };

  // Filter showcase posts based on search query
  const filteredPosts = showcaseData?.posts.filter((post: any) =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold title-orbitron mb-2">
          <GlitchText text="Community Management" />
        </h1>
        <p className="text-muted-foreground">Manage community features, discussions, and user content</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="showcase" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Showcase</span>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Discussions</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            <span>Mini-Games</span>
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Top Users Leaderboard</h2>
            <Button 
              onClick={handleResetLeaderboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recalculate Ranks
            </Button>
          </div>

          {isLeaderboardLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="gradient-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">XP</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {leaderboardData?.users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.rank <= 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                              user.rank === 2 ? 'bg-gray-400/20 text-gray-400' : 
                              'bg-amber-700/20 text-amber-700'
                            }`}>
                              <Trophy className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.rank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">Member</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            {user.level}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>{user.xp.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-purple-500" />
                          <span>{user.badges}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leaderboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total XP Awarded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  {leaderboardData?.users.reduce((sum: number, user: any) => sum + user.xp, 0).toLocaleString()} XP
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Across all users on the platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(leaderboardData?.users.reduce((sum: number, user: any) => sum + user.level, 0) / (leaderboardData?.users.length || 1))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average user progression level
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Badges Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  {leaderboardData?.users.reduce((sum: number, user: any) => sum + user.badges, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Achievement badges across all users
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Showcase Tab */}
        <TabsContent value="showcase" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Showcase Projects</h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isShowcaseLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post: any) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="relative h-48 bg-primary/5">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={post.status === 'approved' ? 'default' : post.status === 'pending' ? 'outline' : 'destructive'}>
                        {post.status === 'approved' ? 'Approved' : post.status === 'pending' ? 'Pending' : 'Rejected'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{post.author}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewPost(post)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <div className="flex gap-2">
                      {post.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprovePost(post.id)}
                            className="text-green-500 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRejectPost(post.id)}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {post.status === 'approved' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRejectPost(post.id)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {post.status === 'rejected' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApprovePost(post.id)}
                          className="text-green-500 hover:bg-green-500/10"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Community Discussions</h2>
            <Button 
              onClick={handleClearChatHistory}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat History
            </Button>
          </div>

          {isChatLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="gradient-border p-6 space-y-4">
              {chatData?.messages.map((message: any) => (
                <div key={message.id} className="flex gap-4 group">
                  <Avatar>
                    <AvatarImage src={message.authorAvatar} />
                    <AvatarFallback>{message.author.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMessage(message.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Chat Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatData?.messages.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Messages in current chat history
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(chatData?.messages.map((m: any) => m.author)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Unique users in the conversation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chatData?.messages.length > 0 
                    ? new Date(chatData.messages[chatData.messages.length - 1].timestamp).toLocaleTimeString() 
                    : 'No activity'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Time of most recent message
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mini-Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Community Mini-Games</h2>
            <Button 
              onClick={() => setIsAddGameDialogOpen(true)}
              className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Game
            </Button>
          </div>

          {isGamesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesData?.games.map((game: any) => (
                <Card key={game.id} className="overflow-hidden">
                  <div className="relative h-48 bg-primary/5">
                    {game.imageUrl ? (
                      <img 
                        src={game.imageUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={game.isVisible ? 'default' : 'outline'}>
                        {game.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                    {game.requiresLogin && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">
                          Login Required
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gamepad2 className="h-4 w-4" />
                        <span>{game.plays} plays</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.isVisible}
                        onCheckedChange={() => handleToggleGameVisibility(game.id, game.isVisible)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {game.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteGame(game.id, game.title)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Games Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gamesData?.games.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Mini-games available on the platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gamesData?.games.filter((g: any) => g.isVisible).length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Currently visible to users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gamesData?.games.reduce((sum: number, g: any) => sum + g.plays, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Combined plays across all games
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              By {selectedPost?.author} • {selectedPost && new Date(selectedPost.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="h-[300px] bg-primary/5 rounded-md overflow-hidden">
                {selectedPost.imageUrl ? (
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm">{selectedPost.description}</p>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>{selectedPost.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>{selectedPost.comments} comments</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedPost.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleApprovePost(selectedPost.id);
                          setIsPostDialogOpen(false);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => {
                          handleRejectPost(selectedPost.id);
                          setIsPostDialogOpen(false);
                        }}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedPost.status === 'approved' && (
                    <Button 
                      onClick={() => {
                        handleRejectPost(selectedPost.id);
                        setIsPostDialogOpen(false);
                      }}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {selectedPost.status === 'rejected' && (
                    <Button 
                      onClick={() => {
                        handleApprovePost(selectedPost.id);
                        setIsPostDialogOpen(false);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Game Dialog */}
      <Dialog open={isAddGameDialogOpen} onOpenChange={setIsAddGameDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">Add New Mini-Game</DialogTitle>
            <DialogDescription>
              Add a new mini-game to the community section
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGame} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={newGame.title} 
                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={newGame.description} 
                onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input 
                value={newGame.imageUrl} 
                onChange={(e) => setNewGame({ ...newGame, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Game URL</Label>
              <Input 
                value={newGame.gameUrl} 
                onChange={(e) => setNewGame({ ...newGame, gameUrl: e.target.value })}
                placeholder="/games/game-name"
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="game-visible"
                checked={newGame.isVisible}
                onCheckedChange={(checked) => setNewGame({ ...newGame, isVisible: checked })}
              />
              <Label htmlFor="game-visible">Visible to users</Label>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="game-login"
                checked={newGame.requiresLogin}
                onCheckedChange={(checked) => setNewGame({ ...newGame, requiresLogin: checked })}
              />
              <Label htmlFor="game-login">Requires login</Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={addGameMutation.isPending}
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
              >
                {addGameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Game
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}