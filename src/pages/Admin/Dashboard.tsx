import { useQuery } from '@tanstack/react-query';
import { Users, Package, BookOpen, Trophy, TrendingUp } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  // Clear cache on component mount
  useEffect(() => {
    // Clear React Query cache for admin data
    window.localStorage.removeItem('react-query-admin-stats');
  }, []);

  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('🔑 Fetching admin stats with token:', token ? 'Present' : 'Missing');
      
      const res = await fetch('http://localhost:5000/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Stats response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Stats fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch stats');
      }
      
      const data = await res.json();
      console.log('✅ Stats data received:', data);
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Log for debugging
  if (error) {
    console.error('Dashboard stats error:', error);
  }

  console.log('Dashboard stats received:', stats);
  
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Assets',
      value: stats?.stats?.totalAssets || 0,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Tutorials',
      value: stats?.stats?.totalTutorials || 0,
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Showcases',
      value: stats?.stats?.totalShowcases || 0,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'New Users (7d)',
      value: stats?.stats?.newUsers || 0,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold title-orbitron mb-2">
          <GlitchText text="Admin Dashboard" />
        </h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="gradient-border p-6 hover:glow-primary transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold font-orbitron title-orbitron">
                {isLoading ? '...' : stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Subscription Breakdown */}
      {stats?.stats?.subscriptionBreakdown && stats.stats.subscriptionBreakdown.length > 0 && (
        <div className="gradient-border p-6 mb-8">
          <h2 className="text-2xl font-orbitron font-bold mb-6">Subscription Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.stats.subscriptionBreakdown.map((sub: any) => (
              <div key={sub._id || 'Free'} className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{sub._id || 'Free'}</p>
                <p className="text-2xl font-bold text-primary">{sub.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="gradient-border p-6">
        <h2 className="text-2xl font-orbitron font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-center border border-primary/20 hover:border-primary"
          >
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Manage Users</p>
          </Link>
          <Link
            to="/admin/assets"
            className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-center border border-primary/20 hover:border-primary"
          >
            <Package className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Manage Assets</p>
          </Link>
          <Link
            to="/admin/tutorials"
            className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-center border border-primary/20 hover:border-primary"
          >
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Manage Tutorials</p>
          </Link>
          <Link
            to="/admin/community"
            className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-center border border-primary/20 hover:border-primary"
          >
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Community</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
