import { useState, useCallback, useMemo, useEffect } from "react";
import { Search, Star, Download, ShoppingCart, Filter, Heart, Lock, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { AssetDetailModal } from "@/components/AssetDetailModal";
import GlitchText from "@/components/GlitchText";
import { useQuery } from "@tanstack/react-query";
import ApiService from "@/services/api";
import { GridLoader } from "react-spinners";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { parseAsset } from "@/utils/parseJsonFields";

interface AssetType {
  id: string;
  name: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnailUrl: string;
  price: number;
  downloadCount: number;
  rating: number;
  tags: string[];
  creator: {
    id: string;
    username: string;
    email: string;
  };
  status: string;
  requiredSubscription: string;
  createdAt: string;
  updatedAt: string;
}

const Assets = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [likedAssets, setLikedAssets] = useState<string[]>([]);
  const [library, setLibrary] = useState<string[]>([]);

  // Load user's library from localStorage
  useEffect(() => {
    if (user) {
      const storageKey = `library:${user.id || user.email}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setLibrary(JSON.parse(saved));
        } catch (e) {
        }
      }
    } else {
      setLibrary([]);
    }
  }, [user]);

  const filters = ["All", "3D Models", "Textures", "Audio", "VFX", "Animations", "Other"];

  // Build query parameters
  const queryParams: Record<string, string> = {};
  if (committedSearch) queryParams.search = committedSearch;
  if (activeFilter !== "All") queryParams.category = activeFilter;
  queryParams.minPrice = priceRange[0].toString();
  queryParams.maxPrice = priceRange[1].toString();

  // Fetch assets from backend
  const { data: assetsResponse, isLoading, isFetching, error } = useQuery({
    queryKey: ['assets', queryParams],
    queryFn: () => ApiService.getAssets(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // cache for longer to avoid refetch churn
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Parse JSON fields from SQLite
  const assets = (assetsResponse?.assets || []).map(parseAsset);

  // Show notification when subscription unlocks new assets
  useEffect(() => {
    if (user && assets.length > 0) {
      const userPlan = user.subscription?.plan || 'Free';
      const planHierarchy = { 'Free': 0, 'Starter': 1, 'Pro': 2, 'Power': 3, 'Ultra': 4 };
      const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
      
      // Count newly unlocked assets
      const unlockedAssets = assets.filter(asset => {
        const requiredPlan = asset.requiredSubscription || 'Free';
        const requiredLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;
        return userPlanLevel >= requiredLevel && !library.includes(String(asset.id));
      });

      // Only show notification if user was just upgraded (check if there's a recent upgrade flag)
      const justUpgraded = sessionStorage.getItem('just_upgraded');
      if (justUpgraded && unlockedAssets.length > 0) {
        sonnerToast.success(`${unlockedAssets.length} new assets unlocked! 🎉`, {
          description: `Your ${userPlan} subscription gives you access to premium assets`,
          duration: 6000
        });
        sessionStorage.removeItem('just_upgraded');
      }
    }
  }, [user, assets, library]);

  // Instant client-side filtering over cached data to reduce perceived latency
  const displayAssets = useMemo(() => {
    const text = committedSearch.trim().toLowerCase();
    return assets.filter((a) => {
      const matchText = !text || a.name.toLowerCase().includes(text) || a.description.toLowerCase().includes(text);
      const matchCategory = activeFilter === "All" || a.category === activeFilter;
      const matchPrice = a.price >= priceRange[0] && a.price <= priceRange[1];
      return matchText && matchCategory && matchPrice;
    });
  }, [assets, committedSearch, activeFilter, priceRange]);

  // Handle liking assets
  const toggleLike = (assetId: string | number) => {
    setLikedAssets(prev => 
      prev.includes(String(assetId)) 
        ? prev.filter(id => id !== String(assetId))
        : [...prev, String(assetId)]
    );
    
    toast({
      title: likedAssets.includes(String(assetId)) ? "Removed from wishlist" : "Added to wishlist",
      description: likedAssets.includes(String(assetId)) 
        ? "The asset has been removed from your wishlist"
        : "The asset has been added to your wishlist",
    });
  };

  // Check if user can unlock asset based on subscription
  const canUnlockAsset = (asset: AssetType): boolean => {
    if (!user) return false;
    const userPlan = user.subscription?.plan || 'Free';
    const requiredPlan = asset.requiredSubscription || 'Free';
    
    const planHierarchy = { 'Free': 0, 'Starter': 1, 'Pro': 2, 'Power': 3, 'Ultra': 4 };
    return (planHierarchy[userPlan as keyof typeof planHierarchy] || 0) >= (planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0);
  };

  // Get button state for an asset
  const getAssetButtonState = (asset: AssetType): { text: string; icon: any; disabled: boolean; action: () => void; variant: string } => {
    // Check if in library
    if (library.includes(String(asset.id))) {
      return {
        text: 'In Library',
        icon: Check,
        disabled: true,
        action: () => {},
        variant: 'secondary'
      };
    }

    // Not logged in
    if (!user) {
      return {
        text: 'Login to Unlock',
        icon: Lock,
        disabled: false,
        action: () => {
          sonnerToast.info('Login required', { description: 'Please login to add assets to your library' });
          navigate('/auth');
        },
        variant: 'default'
      };
    }

    // Free asset - anyone can add
    if (asset.price === 0 || asset.requiredSubscription === 'Free') {
      return {
        text: 'Add to Library',
        icon: Sparkles,
        disabled: false,
        action: () => addToLibrary(asset),
        variant: 'default'
      };
    }

    // Check subscription level
    if (!canUnlockAsset(asset)) {
      const required = asset.requiredSubscription || 'Pro';
      return {
        text: `Upgrade to ${required}`,
        icon: Lock,
        disabled: false,
        action: () => {
          sonnerToast.info(`${required} subscription required`, {
            description: `Upgrade to ${required} to unlock this asset`,
            action: {
              label: 'View Plans',
              onClick: () => navigate('/pricing')
            }
          });
        },
        variant: 'outline'
      };
    }

    // Can unlock
    return {
      text: 'Add to Library',
      icon: Sparkles,
      disabled: false,
      action: () => addToLibrary(asset),
      variant: 'default'
    };
  };

  // Handle adding to library
  const addToLibrary = (asset: AssetType) => {
    if (!user) return;

    const newLibrary = [...library, String(asset.id)];
    setLibrary(newLibrary);

    // Persist to localStorage
    const storageKey = `library:${user.id || user.email}`;
    localStorage.setItem(storageKey, JSON.stringify(newLibrary));

    sonnerToast.success('Added to Library! 🎉', {
      description: `${asset.name} is now in your library`
    });
  };

  const isInitialLoading = isLoading && !assetsResponse?.assets?.length;

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Failed to load assets</h2>
          <p className="text-muted-foreground">Please check your backend connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="pt-24 pb-16 cyber-grid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold title-orbitron mb-6">
              <GlitchText text="Asset Marketplace" />
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Premium cyberpunk assets for your next project
            </p>
            
            {/* Search Bar */}
            <form 
              className="max-w-2xl mx-auto relative mb-8"
              onSubmit={(e) => { e.preventDefault(); setCommittedSearch(searchQuery.trim()); }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(""); } }}
                className="w-full pl-12 pr-28 py-4 bg-card border border-primary/30 rounded-xl text-lg focus:outline-none focus:border-primary focus:glow-primary transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-primary text-white hover:glow-primary transition"
              >
                Search
              </button>
            </form>
            
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-gradient-primary text-white glow-primary"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-primary/20"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Assets Grid Section */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[250px,1fr] gap-8">
            {/* Sidebar Filters */}
            <div className="space-y-8">
              {/* Type Filter */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-orbitron">Asset Type</h3>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeFilter === filter
                          ? "bg-gradient-primary text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

            

              {/* Price Range Filter */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-orbitron">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={setPriceRange}
                    className="my-6"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Grid */}
            <div>
              {/* Loading skeletons (initial load) */}
              {isInitialLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="gradient-border rounded-lg overflow-hidden">
                      <div className="h-48 bg-muted/20 animate-pulse" />
                      <div className="p-6 space-y-3">
                        <div className="h-5 w-3/5 bg-muted/30 rounded animate-pulse" />
                        <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                        <div className="h-4 w-4/5 bg-muted/20 rounded animate-pulse" />
                        <div className="h-10 w-full bg-muted/20 rounded mt-4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid with data (keeps previous while fetching new) */}
              {!isInitialLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayAssets.map((asset, index) => (
                  <div 
                    key={asset.id}
                    className="gradient-border hover:glow-primary hover-scale transition-all duration-300 animate-fade-in-up bg-card rounded-lg overflow-hidden h-full flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative group">
                      <div className="w-full h-48 bg-muted/20 flex items-center justify-center">
                        <img 
                          src={asset.thumbnailUrl || '/cyberpunk-placeholder.svg'} 
                          alt={asset.name}
                          className="w-full h-full object-cover cursor-pointer transition-opacity duration-300"
                          decoding="async"
                          fetchpriority={index < 3 ? 'high' as any : undefined}
                          onClick={() => {
                            setSelectedAsset(asset);
                            setIsDetailModalOpen(true);
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/cyberpunk-placeholder.svg';
                            e.currentTarget.className = 'w-full h-full object-contain cursor-pointer opacity-50';
                          }}
                          onLoad={(e) => {
                            e.currentTarget.className = 'w-full h-full object-cover cursor-pointer';
                          }}
                          loading={index < 3 ? 'eager' : 'lazy'}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button 
                          variant="secondary" 
                          className="hover:glow-primary"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          likedAssets.includes(String(asset.id)) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                        }`}
                        onClick={() => toggleLike(asset.id)}
                      >
                        <Heart className={`h-5 w-5 ${likedAssets.includes(String(asset.id)) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold font-orbitron flex-1 pr-2">
                          {asset.name}
                        </h3>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {asset.category}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                        {asset.description}
                      </p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-accent">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-medium">{asset.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Download className="h-4 w-4" />
                              <span className="text-xs">{asset.downloadCount.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="text-xl font-bold font-orbitron title-orbitron">
                            ${asset.price}
                          </div>
                        </div>
                        
                        {(() => {
                          const buttonState = getAssetButtonState(asset);
                          const Icon = buttonState.icon;
                          return (
                            <Button 
                              className={buttonState.variant === 'default' ? 'w-full bg-gradient-primary hover:glow-primary' : 'w-full'}
                              variant={buttonState.variant as any}
                              onClick={buttonState.action}
                              disabled={buttonState.disabled}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {buttonState.text}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}

              {/* subtle top loader when refetching */}
              {isFetching && !isInitialLoading && (
                <div className="h-1 w-full bg-primary/20 mt-6 rounded overflow-hidden">
                  <div className="h-full w-1/3 bg-primary animate-[loadingbar_1.2s_ease-in-out_infinite]" />
                </div>
              )}
              
              {assets.length === 0 && (
                <div className="text-center py-20">
                  <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-bold font-orbitron mb-2">No assets found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
              
              {assets.length > 0 && (
                <div className="text-center mt-16">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white hover:glow-primary"
                  >
                    Load More Assets
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default Assets;