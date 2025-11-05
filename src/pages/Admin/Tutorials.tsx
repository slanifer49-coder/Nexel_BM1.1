import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlitchText from '@/components/GlitchText';
import { 
  BookOpen, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Loader2, 
  Eye, 
  EyeOff,
  BarChart,
  BookMarked,
  Sparkles,
  Zap
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AdminTutorials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: 'modeling',
    xpReward: 50,
    published: false,
    author: '',
    content: '',
    imageUrl: '',
    estimatedTime: 30,
  });
  const queryClient = useQueryClient();

  // Fetch all tutorials
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-tutorials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/tutorials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tutorials');
      const response = await res.json();
      return { tutorials: response.items || [] };
    }
  });

  // Delete tutorial mutation
  const deleteTutorialMutation = useMutation({
    mutationFn: async (tutorialId: string) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/tutorials/${tutorialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete tutorial');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      toast({
        title: "Tutorial deleted",
        description: "The tutorial has been successfully removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tutorial",
        variant: "destructive",
      });
    }
  });

  // Update tutorial mutation
  const updateTutorialMutation = useMutation({
    mutationFn: async (tutorial: any) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/tutorials/${tutorial.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorial)
      });
      if (!res.ok) throw new Error('Failed to update tutorial');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Tutorial updated",
        description: "The tutorial has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tutorial",
        variant: "destructive",
      });
    }
  });

  // Add tutorial mutation
  const addTutorialMutation = useMutation({
    mutationFn: async (tutorial: any) => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/tutorials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorial)
      });
      if (!res.ok) throw new Error('Failed to add tutorial');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      setIsAddDialogOpen(false);
      setNewTutorial({
        title: '',
        description: '',
        difficulty: 'beginner',
        category: 'modeling',
        xpReward: 50,
        published: false,
        author: '',
        content: '',
        imageUrl: '',
        estimatedTime: 30,
      });
      toast({
        title: "Tutorial added",
        description: "The new tutorial has been successfully added",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tutorial",
        variant: "destructive",
      });
    }
  });

  const handleDeleteTutorial = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteTutorialMutation.mutate(id);
    }
  };

  const handleEditTutorial = (tutorial: any) => {
    setSelectedTutorial(tutorial);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    updateTutorialMutation.mutate(selectedTutorial);
  };

  const handleAddTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    addTutorialMutation.mutate(newTutorial);
  };

  const handleTogglePublish = (tutorial: any) => {
    updateTutorialMutation.mutate({
      ...tutorial,
      published: !tutorial.published
    });
  };

  const handleViewStats = (tutorial: any) => {
    setSelectedTutorial(tutorial);
    setIsStatsDialogOpen(true);
  };

  const tutorials = data?.tutorials || [];
  const filteredTutorials = tutorials.filter((tutorial: any) =>
    tutorial.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.difficulty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'expert':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  // Tutorial stats (mock data for now)
  const getTutorialStats = (tutorialId: string) => {
    return {
      completions: Math.floor(Math.random() * 100),
      averageRating: (3 + Math.random() * 2).toFixed(1),
      totalEnrollments: Math.floor(Math.random() * 200),
      completionRate: Math.floor(Math.random() * 100),
      averageCompletionTime: Math.floor(15 + Math.random() * 45),
    };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-orbitron font-bold title-orbitron mb-2">
            <GlitchText text="Tutorial Management" />
          </h1>
          <p className="text-muted-foreground">Manage tutorials, courses, and learning content</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Tutorial
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search tutorials by title, description or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={searchQuery === '' ? "default" : "outline"} 
            onClick={() => setSearchQuery('')}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={searchQuery === 'beginner' ? "default" : "outline"} 
            onClick={() => setSearchQuery('beginner')}
            size="sm"
          >
            Beginner
          </Button>
          <Button 
            variant={searchQuery === 'intermediate' ? "default" : "outline"} 
            onClick={() => setSearchQuery('intermediate')}
            size="sm"
          >
            Intermediate
          </Button>
          <Button 
            variant={searchQuery === 'advanced' ? "default" : "outline"} 
            onClick={() => setSearchQuery('advanced')}
            size="sm"
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="gradient-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Tutorials</p>
          <p className="text-3xl font-bold text-primary">{tutorials.length}</p>
        </div>
        <div className="gradient-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Published</p>
          <p className="text-3xl font-bold text-primary">
            {tutorials.filter((t: any) => t.published).length}
          </p>
        </div>
        <div className="gradient-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total XP Available</p>
          <p className="text-3xl font-bold text-primary">
            {tutorials.reduce((sum: number, t: any) => sum + (t.xpReward || 0), 0)}
          </p>
        </div>
        <div className="gradient-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Filtered Results</p>
          <p className="text-3xl font-bold text-primary">{filteredTutorials.length}</p>
        </div>
      </div>

      {/* Tutorials Table */}
      <div className="gradient-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="text-center p-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tutorials found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/10 border-b border-primary/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-primary">Tutorial</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-primary">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-primary">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-primary">XP Reward</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-primary">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredTutorials.map((tutorial: any) => (
                  <tr key={tutorial.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <BookMarked className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{tutorial.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {tutorial.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {tutorial.category || 'General'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty || 'Beginner'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{tutorial.xpReward || 0} XP</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tutorial.published}
                          onCheckedChange={() => handleTogglePublish(tutorial)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {tutorial.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewStats(tutorial)}
                          className="text-blue-500 hover:bg-blue-500/10"
                        >
                          <BarChart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTutorial(tutorial)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTutorial(tutorial.id, tutorial.title)}
                          disabled={deleteTutorialMutation.isPending}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Tutorial Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">Edit Tutorial</DialogTitle>
            <DialogDescription>
              Update tutorial details and content
            </DialogDescription>
          </DialogHeader>
          {selectedTutorial && (
            <form onSubmit={handleUpdateTutorial} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={selectedTutorial.title || ''} 
                  onChange={(e) => setSelectedTutorial({ ...selectedTutorial, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={selectedTutorial.description || ''} 
                  onChange={(e) => setSelectedTutorial({ ...selectedTutorial, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    value={selectedTutorial.category || 'modeling'}
                    onChange={(e) => setSelectedTutorial({ ...selectedTutorial, category: e.target.value })}
                  >
                    <option value="modeling">3D Modeling</option>
                    <option value="texturing">Texturing</option>
                    <option value="animation">Animation</option>
                    <option value="scripting">Scripting</option>
                    <option value="game-design">Game Design</option>
                    <option value="vfx">Visual Effects</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    value={selectedTutorial.difficulty || 'beginner'}
                    onChange={(e) => setSelectedTutorial({ ...selectedTutorial, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input 
                    type="number" 
                    value={selectedTutorial.xpReward || 0} 
                    onChange={(e) => setSelectedTutorial({ ...selectedTutorial, xpReward: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Time (minutes)</Label>
                  <Input 
                    type="number" 
                    value={selectedTutorial.estimatedTime || 30} 
                    onChange={(e) => setSelectedTutorial({ ...selectedTutorial, estimatedTime: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input 
                  value={selectedTutorial.author || ''} 
                  onChange={(e) => setSelectedTutorial({ ...selectedTutorial, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input 
                  value={selectedTutorial.imageUrl || ''} 
                  onChange={(e) => setSelectedTutorial({ ...selectedTutorial, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={selectedTutorial.content || ''} 
                  onChange={(e) => setSelectedTutorial({ ...selectedTutorial, content: e.target.value })}
                  rows={6}
                  placeholder="Tutorial content or markdown..."
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="published"
                  checked={selectedTutorial.published || false}
                  onCheckedChange={(checked) => setSelectedTutorial({ ...selectedTutorial, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={updateTutorialMutation.isPending}
                  className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
                >
                  {updateTutorialMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Tutorial Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">Add New Tutorial</DialogTitle>
            <DialogDescription>
              Create a new tutorial for the platform
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTutorial} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={newTutorial.title} 
                onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={newTutorial.description} 
                onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  value={newTutorial.category}
                  onChange={(e) => setNewTutorial({ ...newTutorial, category: e.target.value })}
                >
                  <option value="modeling">3D Modeling</option>
                  <option value="texturing">Texturing</option>
                  <option value="animation">Animation</option>
                  <option value="scripting">Scripting</option>
                  <option value="game-design">Game Design</option>
                  <option value="vfx">Visual Effects</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  value={newTutorial.difficulty}
                  onChange={(e) => setNewTutorial({ ...newTutorial, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input 
                  type="number" 
                  value={newTutorial.xpReward} 
                  onChange={(e) => setNewTutorial({ ...newTutorial, xpReward: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Time (minutes)</Label>
                <Input 
                  type="number" 
                  value={newTutorial.estimatedTime} 
                  onChange={(e) => setNewTutorial({ ...newTutorial, estimatedTime: Number(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input 
                value={newTutorial.author} 
                onChange={(e) => setNewTutorial({ ...newTutorial, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input 
                value={newTutorial.imageUrl} 
                onChange={(e) => setNewTutorial({ ...newTutorial, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={newTutorial.content} 
                onChange={(e) => setNewTutorial({ ...newTutorial, content: e.target.value })}
                rows={6}
                placeholder="Tutorial content or markdown..."
              />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="new-published"
                checked={newTutorial.published}
                onCheckedChange={(checked) => setNewTutorial({ ...newTutorial, published: checked })}
              />
              <Label htmlFor="new-published">Published</Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={addTutorialMutation.isPending}
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
              >
                {addTutorialMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Tutorial
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tutorial Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">Tutorial Statistics</DialogTitle>
            <DialogDescription>
              {selectedTutorial?.title} - Performance Metrics
            </DialogDescription>
          </DialogHeader>
          {selectedTutorial && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="completion">Completion Data</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getTutorialStats(selectedTutorial.id).completions}</div>
                        <p className="text-xs text-muted-foreground">
                          Users who finished this tutorial
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getTutorialStats(selectedTutorial.id).averageRating}/5</div>
                        <p className="text-xs text-muted-foreground">
                          Based on user feedback
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getTutorialStats(selectedTutorial.id).totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                          Users who started this tutorial
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getTutorialStats(selectedTutorial.id).averageCompletionTime} min</div>
                        <p className="text-xs text-muted-foreground">
                          Average time to complete
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="completion" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Completion Rate</CardTitle>
                      <CardDescription>
                        {getTutorialStats(selectedTutorial.id).completionRate}% of users who start this tutorial complete it
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>Progress</div>
                          <div className="font-medium">{getTutorialStats(selectedTutorial.id).completionRate}%</div>
                        </div>
                        <Progress value={getTutorialStats(selectedTutorial.id).completionRate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>XP Earned</CardTitle>
                      <CardDescription>
                        Total XP earned by users from this tutorial
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        {getTutorialStats(selectedTutorial.id).completions * selectedTutorial.xpReward} XP
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {getTutorialStats(selectedTutorial.id).completions} completions × {selectedTutorial.xpReward} XP reward
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsStatsDialogOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
