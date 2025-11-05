import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Share2, Package, Play, Eye } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AssetViewer } from "./AssetViewer";

interface Asset {
  _id: string;
  name: string;
  price: number;
  downloadCount: number;
  rating: number;
  thumbnailUrl: string;
  category: string;
  description: string;
  detailedDescription?: string;
  fileUrl: string;
  tags: string[];
  creator: {
    _id: string;
    username: string;
    email: string;
  };
  status: string;
  requiredSubscription: string;
  createdAt: string;
  updatedAt: string;
  compatibility?: string[];
  features?: string[];
  fileSize?: string;
  fileType?: string;
  version?: string;
  requirements?: string[];
}

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDetailModal({ asset, isOpen, onClose }: AssetDetailModalProps) {
  if (!asset) return null;

  // Add error handling to prevent crashes
  try {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [tiltDeg, setTiltDeg] = useState(0);
    const [showAssetViewer, setShowAssetViewer] = useState(false);

    const fileTypeLower = (asset.fileType || "").toLowerCase();
    const categoryLower = (asset.category || "").toLowerCase();
    const isAudio = useMemo(() => {
      return categoryLower.includes("audio") || /(mp3|wav|ogg|m4a)$/.test(fileTypeLower);
    }, [categoryLower, fileTypeLower]);
    const isModel3D = useMemo(() => {
      return categoryLower.includes("3d") || /(fbx|obj|gltf|glb|blend)$/.test(fileTypeLower);
    }, [categoryLower, fileTypeLower]);
    const isTexture = useMemo(() => {
      return categoryLower.includes("texture") || /(png|jpg|jpeg|tga|tiff|bmp|webp)$/.test(fileTypeLower);
    }, [categoryLower, fileTypeLower]);

    const handleHoverMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isModel3D) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 2 - 1; // -1 to 1
      setTiltDeg(percent * 12); // ±12deg for subtle 3D tilt
    };

    const handleAudioToggle = async () => {
      if (!audioRef.current) return;
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsAudioPlaying(true);
          // auto pause after 6s preview
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsAudioPlaying(false);
            }
          }, 6000);
        } catch (_) {
          // ignore autoplay rejection
        }
      }
    };

    const handlePreviewClick = () => {
      if (isAudio) {
        void handleAudioToggle();
      } else {
        // Switch to enhanced asset viewer for other file types
        setShowAssetViewer(true);
      }
    };

    const handleCloseAssetViewer = () => {
      setShowAssetViewer(false);
    };
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl bg-background max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron">{asset.name}</DialogTitle>
          </DialogHeader>

          {/* Two-column layout: Image left, details right (stacks on mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Main asset image with hover preview overlay */}
            <div 
              className="relative group"
              onMouseMove={handleHoverMove}
              onMouseLeave={() => setTiltDeg(0)}
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-72 lg:h-96 rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                style={isModel3D ? { transform: `perspective(900px) rotateY(${tiltDeg}deg)` } : undefined}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg pointer-events-none" />
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  className="bg-primary/85 text-primary-foreground border border-primary/40 shadow-glow-primary hover:bg-primary backdrop-blur-sm px-5 py-2"
                  onClick={handlePreviewClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                {isAudio && <audio ref={audioRef} src={asset.fileUrl} preload="metadata" />}
              </div>
              {/* Stats & share on image */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-medium">{asset.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <Download className="h-5 w-5" />
                      <span>{asset.downloadCount.toLocaleString()} downloads</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Description, compatibility, features, requirements, and info */}
            <div className="space-y-6 lg:mt-2">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold font-orbitron">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
                {asset.detailedDescription && (
                  <p className="text-muted-foreground leading-relaxed">{asset.detailedDescription}</p>
                )}
              </div>

              {/* Compatibility */}
              {asset.compatibility && asset.compatibility.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold font-orbitron">Compatibility</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {asset.compatibility.map((software, index) => (
                      <div key={index} className="gradient-border p-3 text-center">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {software}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {asset.features && asset.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold font-orbitron">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {asset.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 gradient-border">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {asset.requirements && asset.requirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold font-orbitron">System Requirements</h3>
                  <div className="space-y-2">
                    {asset.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 gradient-border">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset information only (tags/creator/pricing removed as requested) */}
              <div className="grid grid-cols-1 gap-4">
                <div className="gradient-border p-4 space-y-3">
                  <h3 className="text-lg font-semibold font-orbitron">Asset Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">{asset.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">{asset.fileSize || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Type</span>
                      <span className="font-medium">{asset.fileType || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">{asset.version || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-green-500 border-green-500">{asset.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
    );
  } catch (error) {
    console.error('AssetDetailModal error:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl font-orbitron">Error Loading Asset</DialogTitle>
            <DialogDescription>
              There was an error loading the asset details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}