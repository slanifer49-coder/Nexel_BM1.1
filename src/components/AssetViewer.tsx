import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react';
import { Howl } from 'howler';

// Import the libraries (some might need special handling)
// @ts-ignore - model-viewer might not have perfect TypeScript definitions
import '@google/model-viewer';
import ReactPlayer from 'react-player';

interface AssetViewerProps {
  asset: {
    name: string;
    fileUrl: string;
    thumbnailUrl: string;
    category: string;
    fileType: string;
  };
  className?: string;
}

export function AssetViewer({ asset, className = '' }: AssetViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<Howl | null>(null);
  const videoRef = useRef<ReactPlayer | null>(null);

  const categoryLower = (asset.category || '').toLowerCase();
  const fileTypeLower = (asset.fileType || '').toLowerCase();

  // Determine asset type
  const getAssetType = () => {
    if (categoryLower.includes('model') || categoryLower.includes('3d') ||
        /\.(obj|fbx|glb|gltf|blend|dae|abc)$/i.test(fileTypeLower)) {
      return '3d-model';
    }
    if (categoryLower.includes('audio') || /\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i.test(fileTypeLower)) {
      return 'audio';
    }
    if (categoryLower.includes('video') || /\.(mp4|avi|mov|mkv|webm|flv|wmv)$/i.test(fileTypeLower)) {
      return 'video';
    }
    if (categoryLower.includes('texture') || categoryLower.includes('image') ||
        /\.(png|jpg|jpeg|webp|tga|tiff|bmp|hdr|exr)$/i.test(fileTypeLower)) {
      return 'texture';
    }
    if (categoryLower.includes('vfx') || /\.(glsl|hlsl|cg|fx|vfx|particle)$/i.test(fileTypeLower)) {
      return 'vfx';
    }
    if (categoryLower.includes('animation') || /\.(fbx|gltf|glb|bvh|anim|ani)$/i.test(fileTypeLower)) {
      return 'animation';
    }
    return 'unknown';
  };

  const assetType = getAssetType();

  // Initialize audio player
  useEffect(() => {
    if (assetType === 'audio') {
      audioRef.current = new Howl({
        src: [asset.fileUrl],
        html5: true,
        onload: () => setIsLoading(false),
        onloaderror: () => setError('Failed to load audio'),
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onend: () => setIsPlaying(false),
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.unload();
      }
    };
  }, [asset.fileUrl, assetType]);

  const handleAudioToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume(newVolume);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.mute(newMuted);
    }
  };

  // Render different asset types
  const renderAssetViewer = () => {
    switch (assetType) {
      case '3d-model':
        return (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading 3D model...</p>
                </div>
              </div>
            )}
            <model-viewer
              src={asset.fileUrl}
              ios-src={asset.fileUrl}
              alt={asset.name}
              ar
              camera-controls
              auto-rotate
              auto-play
              class="w-full h-full"
              style={{ width: '100%', height: '100%', background: 'transparent' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setError('Failed to load 3D model')}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <Volume2 className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">Audio Preview</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="flex items-center gap-2"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleAudioToggle}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.7)}
                  className="flex items-center gap-2"
                >
                  {Math.round(volume * 100)}%
                </Button>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading video...</p>
                </div>
              </div>
            )}
            <ReactPlayer
              ref={videoRef}
              url={asset.fileUrl}
              playing={isPlaying}
              volume={volume}
              muted={isMuted}
              controls={true}
              width="100%"
              height="100%"
              onReady={() => setIsLoading(false)}
              onError={() => setError('Failed to load video')}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="rounded-lg"
            />
          </div>
        );

      case 'texture':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={asset.fileUrl}
              alt={asset.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => setError('Failed to load image')}
            />
          </div>
        );

      case 'animation':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>
                <p className="text-muted-foreground text-sm">Animation File</p>
                <Badge variant="outline" className="mt-2">
                  {asset.fileType?.toUpperCase() || 'ANIM'}
                </Badge>
              </div>
              <Button
                onClick={() => window.open(asset.fileUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                View Animation
              </Button>
            </div>
          </div>
        );

      case 'vfx':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/10 to-pink/10 rounded-lg">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">VFX</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>
                <p className="text-muted-foreground text-sm">Visual Effects Shader</p>
                <Badge variant="outline" className="mt-2">
                  {asset.fileType?.toUpperCase() || 'GLSL'}
                </Badge>
              </div>
              <Button
                onClick={() => window.open(asset.fileUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                View Shader Code
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>
                <p className="text-muted-foreground text-sm">Preview not available</p>
                <Badge variant="outline" className="mt-2">
                  {asset.fileType?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
              <Button
                onClick={() => window.open(asset.fileUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Download/View File
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-20 rounded-lg">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <Button
              size="sm"
              onClick={() => window.open(asset.fileUrl, '_blank')}
              variant="outline"
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      )}

      {renderAssetViewer()}
    </div>
  );
}