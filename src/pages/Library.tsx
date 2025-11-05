import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Star, Trash2 } from "lucide-react";
import GlitchText from "@/components/GlitchText";
import { toast } from "@/hooks/use-toast";

export default function Library() {
  const { user } = useAuth();

  // Fetch library items
  const { data: libraryItems, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');
        
        const data = await ApiService.getLibraryItems(token);
        return data.items || [];
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch your library items",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleDownload = async (item: any) => {
    try {
      // Implement download logic
      toast({
        title: "Download Started",
        description: `Downloading ${item.title}...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start download",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (item: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      await ApiService.removeFromLibrary(item.id, token);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      
      toast({
        title: "Removed from Library",
        description: `${item.title} has been removed from your library`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from library",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-4xl font-orbitron font-bold mb-6">
          <GlitchText text="My Library" />
        </h1>
        <div className="text-center py-12">
          <p>Please login to view your library</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-orbitron font-bold mb-6">
        <GlitchText text="My Library" />
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-4 space-y-4 animate-pulse">
              <div className="h-48 bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : !libraryItems?.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your library is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item: any) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    className="w-[calc(50%-0.5rem)]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(item)}
                    className="w-[calc(50%-0.5rem)]"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}