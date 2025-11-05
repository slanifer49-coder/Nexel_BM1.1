import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiService from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Play, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { parseShowcaseGame } from "@/utils/parseJsonFields";

export default function Showcase() {
  const qc = useQueryClient();
  const { user, token } = useAuth();
  const [active, setActive] = useState<any | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState(false);

  // Use hardcoded data instead of API call
  const isLoading = false;
  const error = false;
  
  // Hardcoded games data with itch.io support
  const games: any[] = [
    {
      _id: '1',
      title: 'Cyber Heist',
      description: 'Break into a high-security corporate server and steal valuable data without getting caught.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTUwMTM4NC84ODAzODA1LnBuZw==/original/u3I%2FWj.png',
      gameUrl: 'https://html-classic.itch.zone/html/5023813/index.html',
      author: 'CyberDev',
      likes: 1245,
      tags: ['action', 'stealth'],
      isIframe: true,
      source: 'itch.io'
    },
    {
      _id: '2',
      title: 'Neon Runner',
      description: 'Dash through glowing cityscapes and collect energy orbs in this cyberpunk endless runner.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTM2NzQzMi83ODU3NDU5LnBuZw==/original/8lPq9u.png',
      gameUrl: 'https://html-classic.itch.zone/html/4765187/index.html',
      author: 'NeonMaster',
      likes: 890,
      tags: ['racing', 'arcade'],
      isIframe: true,
      source: 'itch.io'
    },
    {
      _id: '3',
      title: 'Synthwave Drift',
      description: 'Race through neon highways in a synthwave atmosphere with retro-futuristic style.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTI1NjY3Mi83NDU5MzY1LnBuZw==/original/W%2B1QdA.png',
      gameUrl: 'https://html-classic.itch.zone/html/4502341/index.html',
      author: 'RetroWave',
      likes: 1120,
      tags: ['racing', 'music'],
      isIframe: true,
      source: 'itch.io'
    },
    {
      _id: '4',
      title: 'Hologram Defense',
      description: 'Protect your mainframe with holographic shields in this strategic cyberpunk defense game.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTQyNjU0MS84MTY4OTI0LnBuZw==/original/pYkE5F.png',
      gameUrl: 'https://html-classic.itch.zone/html/5128769/index.html',
      author: 'HoloTech',
      likes: 750,
      tags: ['strategy', 'defense'],
      isIframe: true,
      source: 'itch.io'
    },
    {
      _id: '5',
      title: 'Cyber Glitch',
      description: 'Navigate through digital glitches and corrupted data in this mind-bending puzzle game.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTU4NDI2Mi85MDc0MTQ0LnBuZw==/original/q6jB%2FL.png',
      gameUrl: 'https://html-classic.itch.zone/html/5234871/index.html',
      author: 'GlitchMaster',
      likes: 923,
      tags: ['puzzle', 'cyberpunk'],
      isIframe: true,
      source: 'itch.io'
    },
    {
      _id: '6',
      title: 'Neon Racer',
      description: 'High-speed racing through neon-lit city streets with synthwave soundtrack.',
      thumbnail: 'https://img.itch.zone/aW1hZ2UvMTQ3NjU4OS84NDIzNjM3LnBuZw==/original/XzGhWw.png',
      gameUrl: 'https://html-classic.itch.zone/html/5347612/index.html',
      author: 'SpeedRunner',
      likes: 1456,
      tags: ['racing', 'neon'],
      isIframe: true,
      source: 'itch.io'
    }
  ];

  const likeMut = useMutation({
    mutationFn: ({ id, like }: { id: string; like: boolean }) => ApiService.likeShowcase(id, like, token || undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['showcases'] }),
  });

  const handleLike = (g: any) => {
    if (!user) {
      sonnerToast("Please login first", { description: "Login to interact", duration: 2000 });
      return;
    }
    likeMut.mutate({ id: g._id, like: true });
  };

  const handlePlay = (g: any) => {
    setActive(g);
    setGameLoading(true);
    setGameError(false);
  };

  const handleComplete = () => {
    if (!user) {
      sonnerToast("Login Required", {
        description: "Please login to earn XP rewards",
        action: {
          label: "Login",
          onClick: () => window.location.href = "/auth"
        }
      });
      return;
    }
    // Reward 5 XP (placeholder feedback)
    sonnerToast("+5 XP", { description: "Thanks for playing!", duration: 2000 });
    setActive(null);
    setGameLoading(false);
    setGameError(false);
  };

  const handleGameLoad = () => {
    setGameLoading(false);
    setGameError(false);
  };

  const handleGameError = () => {
    setGameLoading(false);
    setGameError(true);
  };

  const openInNewTab = (gameUrl: string) => {
    window.open(gameUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="gradient-border p-6 animate-fade-in-up">
            <div className="h-[220px] bg-muted/20 rounded mb-4 animate-pulse" />
            <div className="h-6 w-1/3 bg-muted/20 rounded mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-muted/20 rounded mb-4 animate-pulse" />
            <div className="h-10 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !games.length) {
    return <div className="text-center py-10 text-muted-foreground">No showcase games available</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {games.map((g, index) => (
          <div
            key={g._id || index}
            className="group relative overflow-hidden gradient-border hover:glow-primary transition-transform duration-300 animate-fade-in-up hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <div className="relative">
              <img
                src={g.thumbnail}
                alt={g.title}
                className="w-full h-[220px] object-cover rounded-t-[calc(var(--radius))] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
              />
              <div className="absolute inset-0 rounded-t-[calc(var(--radius))] bg-gradient-to-t from-background/70 via-background/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold font-orbitron leading-tight">{g.title}</h3>
                    {g.source === 'itch.io' && (
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-medium">
                        itch.io
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">by {g.author}</p>
                </div>
                <button
                  className="w-12 h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center hover:glow-primary hover:scale-110 transition-all duration-300"
                  onClick={() => handlePlay(g)}
                >
                  <Play className="h-4 w-4 ml-0.5" />
                </button>
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">{g.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(g.tags || []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-primary/15 text-primary rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                    onClick={() => handleLike(g)}
                    title={user ? "Like" : "Login to interact"}
                  >
                    <Heart className="h-5 w-5" />
                    <span>{g.likes || 0}</span>
                  </button>
                </div>
                <Button className="bg-gradient-primary hover:glow-primary" onClick={() => handlePlay(g)}>
                  Play Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => {
        if (!open) {
          setActive(null);
          setGameLoading(false);
          setGameError(false);
        }
      }}>
        <DialogContent className="max-w-4xl bg-background">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-orbitron text-xl">{active?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                {active?.source === 'itch.io' && (
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
                    itch.io Game
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInNewTab(active?.gameUrl)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              by {active?.author} • {active?.tags?.join(', ')}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Game Container */}
            <div className="aspect-video w-full gradient-border overflow-hidden relative">
              {gameLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading game...</p>
                  </div>
                </div>
              )}

              {gameError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <p className="text-red-500 mb-2">Failed to load game</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInNewTab(active?.gameUrl)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}

              {active?.gameUrl && (
                <iframe
                  src={active.gameUrl}
                  title={active.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; gamepad; microphone; camera"
                  onLoad={handleGameLoad}
                  onError={handleGameError}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                />
              )}
            </div>

            {/* Game Instructions */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>How to Play:</strong> Use your keyboard and mouse to interact with the game.
                If the game doesn't load properly, try opening it in a new tab for the best experience.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setActive(null)}>
                Close Game
              </Button>

              <div className="flex gap-3">
                {user ? (
                  <Button className="bg-gradient-primary hover:glow-primary" onClick={handleComplete}>
                    I Completed It (+5 XP)
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      setActive(null);
                      sonnerToast("Login Required", {
                        description: "Please login to earn XP rewards",
                        action: {
                          label: "Login",
                          onClick: () => window.location.href = "/auth"
                        }
                      });
                    }}
                  >
                    Login to Earn XP
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


