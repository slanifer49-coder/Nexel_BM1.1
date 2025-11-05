import { Play, Award, Lock, CheckCircle, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ApiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ProgressData = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  completionPercentage: number;
  badges: { name: string; earned: boolean; icon: string }[];
  tutorialProgress: Record<string, number>; // tutorialId -> percent
};

const LearnHub = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const storageKey = user ? `learnhub:${user._id || user.email}` : undefined;

  // Tutorials from backend
  const { data: tutorialsResp, isLoading: isTutorialsLoading, isFetching: isTutorialsFetching, error: tutorialsError } = useQuery({
    queryKey: ["tutorials", { page: 1, limit: 12 }],
    queryFn: () => ApiService.getTutorials({ page: "1", limit: "12", status: "published" }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fallback cyberpunk-themed mock tutorials when backend returns empty
  const fallbackTutorials = [
    {
      id: 'mock-1',
      title: 'Neon Skyline: Blender Hard-Surface Kitbash',
      description: 'Build a cyberpunk city block with modular hard-surface kitbash workflows and emissive lighting tricks.',
      difficulty: 'Intermediate',
      duration: '2h',
      xp: 180,
    },
    {
      id: 'mock-2',
      title: 'Synthwave Soundscapes: FM + Analog Layers',
      description: 'Design driving basslines and lush pads, then export seamless loops for game engines.',
      difficulty: 'Beginner',
      duration: '1.5h',
      xp: 120,
    },
    {
      id: 'mock-3',
      title: 'Hologram UI in Unreal: Niagara + UMG',
      description: 'Create floating holographic panels, scanline shaders, and reactive particles with Niagara.',
      difficulty: 'Advanced',
      duration: '3h',
      xp: 240,
    },
    {
      id: 'mock-4',
      title: 'Retro CRT Shader: Godot/Unity URP',
      description: 'Implement barrel distortion, bloom, chromatic aberration, and animated scanlines.',
      difficulty: 'Intermediate',
      duration: '2.5h',
      xp: 200,
    },
    {
      id: 'mock-5',
      title: 'Cyber Runner Anim Pack: Idle → Sprint → Vault',
      description: 'Rig and author a clean locomotion set with animation blending and root motion.',
      difficulty: 'Intermediate',
      duration: '2h',
      xp: 170,
    },
    {
      id: 'mock-6',
      title: 'Neon VFX: GPU Particles + Signed Distance Fields',
      description: 'Author glowing trails, impact bursts, and volumetric fog for high-speed scenes.',
      difficulty: 'Advanced',
      duration: '3.5h',
      xp: 260,
    },
  ];

  const apiTutorials = (tutorialsResp?.tutorials || []).map((t: any) => ({
    id: t._id,
    title: t.title,
    description: t.description,
    difficulty: t.category,
    duration: typeof t.duration === 'number' ? `${Math.round(t.duration)}m` : String(t.duration || ''),
    xp: Math.max(80, Math.min(300, Math.round((t.likes || 0) * 2 + (t.views || 0) * 0.1 + 100))),
  }));

  const tutorials = apiTutorials.length > 0 ? apiTutorials : fallbackTutorials;

  // Mocked user progress (replace with real endpoint later)
  const { data: progressData, isLoading: isProgressLoading, error: progressError } = useQuery<ProgressData>({
    queryKey: ["user-progress", user?._id || user?.email || 'guest', token || 'no-token'],
    queryFn: async () => {
      // Simulate a tiny delay
      await new Promise((r) => setTimeout(r, 200));
      // If logged in, try backend first
      if (user && (user as any)._id) {
        try {
          const backend = await ApiService.getProgress((user as any)._id, token || '');
          // basic validation
          if (backend && typeof backend === 'object') return backend as ProgressData;
        } catch (e: any) {
          // Progress fetch failed - using fallback data
        }
      }
      // Fallback to guest mock
      const byId: Record<string, number> = {};
      for (const t of tutorials) {
        const hash = Array.from(t.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        byId[t.id] = (hash % 5) * 20;
      }
      return { level: 12, currentXP: 2450, nextLevelXP: 3000, completionPercentage: 68, badges: [
        { name: "First Steps", earned: true, icon: "🏁" },
        { name: "3D Master", earned: true, icon: "🎨" },
        { name: "Code Warrior", earned: false, icon: "⚔️" },
        { name: "Design Guru", earned: false, icon: "✨" },
        { name: "XP Hunter", earned: false, icon: "🎯" },
        { name: "Perfectionist", earned: true, icon: "💎" }
      ], tutorialProgress: byId } as ProgressData;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Interactive local progression for logged-in users (persisted)
  const persisted = user && storageKey ? (() => {
    try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) as ProgressData : null; } catch { return null; }
  })() : null;

  const [interactiveStats, setInteractiveStats] = user && persisted ? [persisted, (v: ProgressData) => { localStorage.setItem(storageKey!, JSON.stringify(v)); }] as const : [null, (_: ProgressData) => {}] as const;

  const userStats = (interactiveStats || progressData) || {
    level: 0,
    currentXP: 0,
    nextLevelXP: 1,
    completionPercentage: 0,
    badges: [],
    tutorialProgress: {},
  };

  const badges = userStats.badges || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-400";
      case "Intermediate": return "text-yellow-400";
      case "Advanced": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const progressPercentage = (userStats.currentXP / userStats.nextLevelXP) * 100;

  // Tutorial modal state
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const activeTutorial = tutorials.find((t: any) => t.id === activeTutorialId) || null;

  // Load YouTube API
  useEffect(() => {
    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Setup event listener for tutorial completion
    const handleTutorialCompleted = async (event: any) => {
      const { tutorialId } = event.detail;
      if (!user) {
        sonnerToast("Please login first", {
          description: "Login to earn rewards",
          duration: 2000,
        });
        return;
      }
      
      try {
        const response = await ApiService.post('/api/rewards/verify', {
          userId: (user as any)._id,
          type: "tutorial",
          id: tutorialId
        }, token || '');
        
        if (response.success) {
          // Show success toast
          sonnerToast("Tutorial completed!", {
            description: `+${response.xpAwarded} XP earned`,
            duration: 3000,
          });
          
          // Update local progress
          const tutorial = tutorials.find((t: any) => t.id === tutorialId);
          if (tutorial) {
            handleMarkComplete();
          }
        }
      } catch (error) {
        sonnerToast("Error", {
          description: "Failed to verify completion",
          duration: 2000,
        });
      }
    };
    
    window.addEventListener('tutorialCompleted', handleTutorialCompleted as EventListener);
    
    return () => {
      window.removeEventListener('tutorialCompleted', handleTutorialCompleted as EventListener);
    };
  }, [user, token, tutorials]);

  const handleStart = (id: string) => {
    if (!user) {
      sonnerToast("Please login first", {
        description: "Login to start your journey",
        duration: 2000,
      });
      return;
    }
    setActiveTutorialId(id);
  };

  const awardAndPersist = (updated: ProgressData) => {
    if (user && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handleMarkComplete = () => {
    if (!user || !activeTutorial) return;
    const id = activeTutorial.id;
    const prevProgress = userStats.tutorialProgress[id] ?? 0;
    if (prevProgress === 100) return;
    // compute XP gain (use tutorial xp)
    const gain = activeTutorial.xp || 150;
    const totalXP = (userStats.currentXP || 0) + gain;
    const nextLevelXP = 1000 * Math.ceil(Math.max(1, (userStats.level || 1)));
    let level = userStats.level || 1;
    let overflow = totalXP;
    // simple leveling: 1000 XP per level
    while (overflow >= 1000) { level += 1; overflow -= 1000; }
    const completionMap = { ...userStats.tutorialProgress, [id]: 100 } as Record<string, number>;

    // badge unlocks
    const completedCount = Object.values(completionMap).filter(v => v === 100).length;
    const allCompleted = tutorials.every((t: any) => (completionMap[t.id] ?? 0) === 100);
    const badgesSet = new Set((userStats.badges || []).map(b => b.name));
    const ensure = (name: string, icon: string) => { if (!badgesSet.has(name)) badgesSet.add(name); };
    if (completedCount >= 1) ensure("First Steps", "🏁");
    if (completedCount >= 3) ensure("3D Master", "🎨");
    if (level >= 10) ensure("Code Warrior", "⚔️");
    if (completedCount >= 5) ensure("Design Guru", "✨");
    if (totalXP >= 5000) ensure("XP Hunter", "🎯");
    if (allCompleted) ensure("Perfectionist", "💎");
    const newBadges = Array.from(badgesSet).map(name => ({ name, earned: true, icon: (name === 'First Steps' ? '🏁' : name === '3D Master' ? '🎨' : name === 'Code Warrior' ? '⚔️' : name === 'Design Guru' ? '✨' : name === 'XP Hunter' ? '🎯' : '💎') }));

    const updated: ProgressData = {
      level,
      currentXP: overflow,
      nextLevelXP: 1000,
      completionPercentage: Math.round((completedCount / tutorials.length) * 100),
      badges: newBadges,
      tutorialProgress: completionMap,
    };
    awardAndPersist(updated);
    // Debounced backend update
    if (user && (user as any)._id) {
      queueProgressSync((user as any)._id, updated);
    }
    toast({ title: "+" + gain + " XP", description: level > (userStats.level || 1) ? "Level Up!" : "Progress saved", });
    setActiveTutorialId(null);
  };

  // Debounce queue for backend sync
  const syncRef = (window as any).__learnhubSyncRef || { t: 0 };
  (window as any).__learnhubSyncRef = syncRef;
  const queueProgressSync = (userId: string, data: ProgressData) => {
    const fire = async () => {
      try { await ApiService.updateProgress(userId, data, token || ''); } catch (e: any) {
        toast({ variant: 'destructive', title: 'Sync failed', description: 'Could not save progress. It will retry later.' });
      }
    };
    clearTimeout(syncRef.t);
    syncRef.t = window.setTimeout(fire, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-24 pb-16 cyber-grid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold title-orbitron mb-6">
              LearnHub
            </h1>
            <p className="text-xl text-muted-foreground">
              Level up your cyberpunk game development skills
            </p>
          </div>
        </div>
      </section>

      {/* Progress Dashboard */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-orbitron font-bold title-orbitron mb-12 text-center">
            Your Progress
          </h2>
          {progressError && (
            <div className="text-center text-red-500 mb-6">Failed to load progress</div>
          )}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="gradient-border p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="text-4xl font-bold font-orbitron title-orbitron mb-2">
                {isProgressLoading ? "–" : userStats.level}
              </div>
              <div className="text-muted-foreground">Level</div>
            </div>
            
            <div className="gradient-border p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="text-4xl font-bold font-orbitron title-orbitron mb-2">
                {isProgressLoading ? "–" : userStats.currentXP.toLocaleString()}
              </div>
              <div className="text-muted-foreground">XP</div>
            </div>
            
            <div className="gradient-border p-6 text-center hover:glow-primary transition-all duration-300">
              <div className="text-4xl font-bold font-orbitron title-orbitron mb-2">
                {isProgressLoading ? "–" : `${userStats.completionPercentage}%`}
              </div>
              <div className="text-muted-foreground">Completion</div>
            </div>
            
            <div className="gradient-border p-6 hover:glow-primary transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold">Next Level</div>
                <div className="text-muted-foreground text-sm">
                  {isProgressLoading ? "–" : `${userStats.nextLevelXP - userStats.currentXP} XP to go`}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div 
                  className="progress-glow h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {isProgressLoading ? "–" : `${userStats.currentXP} / ${userStats.nextLevelXP} XP`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badge System */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-orbitron font-bold title-orbitron mb-12 text-center">
            Achievement Badges
          </h2>
          {progressError && (
            <div className="text-center text-red-500 mb-6">Failed to load badges</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badges.map((badge, index) => (
              <div 
                key={badge.name}
                className={`gradient-border p-6 text-center hover-scale transition-all duration-300 ${
                  badge.earned ? "hover:glow-primary" : "opacity-50 hover:glow-cyan"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{badge.icon}</div>
                <h3 className="font-semibold mb-2">{badge.name}</h3>
                {badge.earned ? (
                  <CheckCircle className="h-6 w-6 text-primary mx-auto" />
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Library */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-orbitron font-bold title-orbitron mb-12 text-center">
            Tutorial Library
          </h2>
          {tutorialsError && (
            <div className="text-center text-red-500 mb-6">Failed to load tutorials</div>
          )}
          {/* Skeletons during initial load */}
          {isTutorialsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gradient-border rounded-lg overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="h-5 w-3/5 bg-muted/30 rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-muted/20 rounded animate-pulse" />
                    <div className="h-2 w-full bg-muted/20 rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial: any, index: number) => (
              <div 
                key={tutorial.id || tutorial.title}
                id={`tutorial-${tutorial.id}`}
                className={`gradient-border hover:glow-primary hover-scale transition-all duration-300 animate-fade-in-up bg-card rounded-lg h-full flex flex-col ${
                  (userStats.tutorialProgress && userStats.tutorialProgress[tutorial.id] === 100) ? 'verified-tutorial' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-3">
                      <h3 className="text-lg font-bold font-orbitron mb-2 leading-tight">
                        {tutorial.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>
                    </div>
                    
                    <button 
                      className={`w-12 h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center hover:glow-primary hover:scale-110 transition-all duration-300 flex-shrink-0 ${!user ? 'opacity-80' : ''}`}
                      onClick={() => handleStart(tutorial.id)}
                      title={user ? "Open tutorial" : "Login to start your journey"}
                    >
                      <Play className="h-4 w-4 ml-0.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(tutorial.difficulty)} bg-muted/50`}>
                      {tutorial.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-full">
                      {tutorial.duration}
                    </span>
                    <div className="flex items-center gap-1 text-accent text-xs px-2 py-1 bg-muted/50 rounded-full">
                      <Star className="h-3 w-3" />
                      <span className="font-medium">+{tutorial.xp} XP</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{userStats.tutorialProgress[tutorial.id] ?? 0}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="progress-glow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userStats.tutorialProgress[tutorial.id] ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                      className={`w-full px-4 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:glow-primary hover:scale-105 transition-all duration-300 ${!user ? 'opacity-80' : ''}`}
                      onClick={() => handleStart(tutorial.id)}
                      title={user ? undefined : "Login to start your journey"}
                    >
                      {(userStats.tutorialProgress[tutorial.id] ?? 0) === 0 ? "Start Tutorial" : 
                       (userStats.tutorialProgress[tutorial.id] ?? 0) === 100 ? "Review" : "Continue"}
                    </button>
                  </div>
                  
                  {/* Verification Badge */}
                  {userStats.tutorialProgress && userStats.tutorialProgress[tutorial.id] === 100 && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <div className="flex items-center text-xs text-primary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span className="glow-text-primary">✓ Verified Completion</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isTutorialsFetching && !isTutorialsLoading && (
            <div className="h-1 w-full bg-primary/20 mt-6 rounded overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-[loadingbar_1.2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </section>

      {/* Tutorial Modal */}
      <Dialog open={!!activeTutorial} onOpenChange={(open) => !open && setActiveTutorialId(null)}>
        <DialogContent className="sm:max-w-4xl bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">{activeTutorial?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {/* YouTube Player */}
            <div className="relative aspect-video mb-4 gradient-border">
              <div id="youtube-player" className="w-full h-full"></div>
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{videoProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="progress-glow h-2 rounded-full transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{activeTutorial?.description}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(activeTutorial?.difficulty || '')} bg-muted/50`}>{activeTutorial?.difficulty}</span>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-full">{activeTutorial?.duration}</span>
              <span className="text-xs px-2 py-1 bg-muted/50 rounded-full text-accent flex items-center gap-1"><Star className="h-3 w-3" />+{activeTutorial?.xp} XP</span>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveTutorialId(null)}>Close</Button>
              <Button className="bg-gradient-primary hover:glow-primary" onClick={handleMarkComplete} disabled={!user}>Mark as Complete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnHub;