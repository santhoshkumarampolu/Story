'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FolderOpen, 
  Zap, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Mail,
  Shield,
  ArrowLeft,
  RefreshCw,
  Crown,
  Trash2,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DomainUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  verified: boolean;
  projectCount: number;
}

interface AdminStats {
  users: {
    total: number;
    verified: number;
    unverified: number;
    newLast7Days: number;
    googleAuth: number;
    emailAuth: number;
    topDomains: { domain: string; count: number }[];
    dailySignups: { date: string; count: number }[];
  };
  projects: {
    total: number;
    newLast7Days: number;
    byType: { type: string; count: number }[];
    dailyCreations: { date: string; count: number }[];
  };
  tokens: {
    total: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    totalOperations: number;
    byType: { type: string; tokens: number; count: number }[];
    byModel: { model: string; tokens: number; count: number }[];
  };
  subscriptions: { status: string; count: number }[];
  dialogueTool?: {
    totalGenerations: number;
    withLogin: number;
    withoutLogin: number;
    totalTokens: number;
    uniqueUsers: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingAdmin, setSettingAdmin] = useState(false);
  
  // Domain deletion state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [domainUsers, setDomainUsers] = useState<DomainUser[]>([]);
  const [loadingDomainUsers, setLoadingDomainUsers] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const viewDomainUsers = async (domain: string) => {
    setDomainToDelete(domain);
    setDeleteDialogOpen(true);
    setLoadingDomainUsers(true);
    setDeleteError(null);
    
    try {
      const res = await fetch('/api/admin/users/by-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await res.json();
      if (data.users) {
        setDomainUsers(data.users);
      } else {
        setDeleteError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setDeleteError('Failed to fetch users for this domain');
    } finally {
      setLoadingDomainUsers(false);
    }
  };

  const deleteDomainUsers = async () => {
    if (!domainToDelete) return;
    
    setDeletingDomain(true);
    setDeleteError(null);
    
    try {
      const res = await fetch('/api/admin/users/by-domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToDelete })
      });
      const data = await res.json();
      
      if (data.success) {
        setDeleteDialogOpen(false);
        setDomainToDelete(null);
        setDomainUsers([]);
        // Refresh stats
        fetchStats();
      } else {
        setDeleteError(data.error || 'Failed to delete users');
      }
    } catch (err) {
      setDeleteError('Failed to delete users');
    } finally {
      setDeletingDomain(false);
    }
  };

  const becomeAdmin = async () => {
    setSettingAdmin(true);
    try {
      const res = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the page to load stats
        window.location.reload();
      } else {
        setError(data.error || 'Failed to set admin');
      }
    } catch (err) {
      setError('Failed to set admin status');
    } finally {
      setSettingAdmin(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        if (res.status === 403) {
          setError('Access denied. Admin privileges required.');
          return;
        }
        throw new Error('Failed to fetch stats');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load admin statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative">
          <Header />
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center max-w-md">
              <Shield className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
              <p className="text-white/60 mb-6">{error || "You do not have permission to view this page."}</p>
              
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="relative">
        <Header />
        
        <main className="container max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="h-8 w-8 text-purple-400" />
                  Admin Dashboard
                </h1>
                <p className="text-white/60 mt-1">Platform analytics and statistics</p>
              </div>
            </div>
            <Button 
              onClick={fetchStats} 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {stats && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.users.total)}</p>
                        <p className="text-green-400 text-sm mt-1">
                          +{stats.users.newLast7Days} last 7 days
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Dialogue Tool</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.dialogueTool?.totalGenerations || 0)}</p>
                        <p className="text-indigo-400 text-sm mt-1">
                          {stats.dialogueTool?.withoutLogin} guests
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Projects</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.projects.total)}</p>
                        <p className="text-green-400 text-sm mt-1">
                          +{stats.projects.newLast7Days} last 7 days
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Tokens Used</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.tokens.total)}</p>
                        <p className="text-white/40 text-sm mt-1">
                          {formatNumber(stats.tokens.totalOperations)} operations
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dialogue Tool Deep Dive */}
              {stats.dialogueTool && stats.dialogueTool.totalGenerations > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-400" />
                        Dialogue Tool Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Logged In Users</p>
                            <p className="text-2xl font-bold text-white mt-1">{formatNumber(stats.dialogueTool.withLogin)}</p>
                            <p className="text-xs text-white/30 mt-1">
                              {((stats.dialogueTool.withLogin / stats.dialogueTool.totalGenerations) * 100).toFixed(1)}% of tool
                            </p>
                          </div>
                          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Guest Usage</p>
                            <p className="text-2xl font-bold text-white mt-1">{formatNumber(stats.dialogueTool.withoutLogin)}</p>
                            <p className="text-xs text-white/30 mt-1">
                              {((stats.dialogueTool.withoutLogin / stats.dialogueTool.totalGenerations) * 100).toFixed(1)}% of tool
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                            <span className="text-white/60 text-sm">Unique Logged-in Users</span>
                            <span className="font-bold">{formatNumber(stats.dialogueTool.uniqueUsers)}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                            <span className="text-white/60 text-sm">Total Tokens Consumed</span>
                            <span className="font-bold">{formatNumber(stats.dialogueTool.totalTokens)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Conversion Insight
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-48">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">
                          {((stats.dialogueTool.totalGenerations / stats.tokens.totalOperations) * 100).toFixed(1)}%
                        </p>
                        <p className="text-white/40 text-sm mt-2">
                          Contribution of Dialogue Tool to total AI operations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* User Stats Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auth Methods */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      Authentication Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">Google OAuth</p>
                            <p className="text-white/40 text-sm">Social login</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.users.googleAuth}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Email/Password</p>
                            <p className="text-white/40 text-sm">Traditional login</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.users.emailAuth}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Breakdown */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-400" />
                      Subscription Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.subscriptions.map((sub) => (
                        <div key={sub.status} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              sub.status === 'pro' ? 'bg-yellow-500/20' : 
                              sub.status === 'admin' ? 'bg-purple-500/20' : 'bg-gray-500/20'
                            }`}>
                              <Crown className={`h-5 w-5 ${
                                sub.status === 'pro' ? 'text-yellow-400' : 
                                sub.status === 'admin' ? 'text-purple-400' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-white font-medium capitalize">{sub.status || 'Free'}</p>
                              <p className="text-white/40 text-sm">
                                {((sub.count / stats.users.total) * 100).toFixed(1)}% of users
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-white">{sub.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Domains */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-400" />
                    Top Email Domains
                    <span className="text-white/40 text-sm font-normal ml-2">(Click to manage)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {stats.users.topDomains.map((domain) => (
                      <div 
                        key={domain.domain} 
                        className="p-4 rounded-lg bg-white/5 text-center relative group cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => viewDomainUsers(domain.domain)}
                      >
                        <p className="text-white font-medium truncate">{domain.domain}</p>
                        <p className="text-2xl font-bold text-purple-400 mt-1">{domain.count}</p>
                        <p className="text-white/40 text-sm">
                          {((domain.count / stats.users.total) * 100).toFixed(1)}%
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 text-white/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Projects & Tokens Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects by Type */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-purple-400" />
                      Projects by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.projects.byType.map((project) => (
                        <div key={project.type} className="flex items-center justify-between">
                          <span className="text-white/70 capitalize">{project.type}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(project.count / stats.projects.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-white font-medium w-12 text-right">{project.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Token Usage by Type */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Token Usage by Operation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.tokens.byType.slice(0, 8).map((token) => (
                        <div key={token.type} className="flex items-center justify-between">
                          <span className="text-white/70 capitalize">{token.type.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-white/40 text-sm">{token.count} ops</span>
                            <span className="text-white font-medium">{formatNumber(token.tokens)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Token Usage by Model */}
              {stats.tokens.byModel.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Token Usage by AI Model
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stats.tokens.byModel.map((model) => (
                        <div key={model.model} className="p-4 rounded-lg bg-white/5">
                          <p className="text-white/60 text-sm truncate">{model.model}</p>
                          <p className="text-2xl font-bold text-white mt-1">{formatNumber(model.tokens)}</p>
                          <p className="text-white/40 text-sm">{model.count} operations</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white/60">Verified Users</p>
                        <p className="text-4xl font-bold text-green-400">{stats.users.verified}</p>
                        <p className="text-white/40 text-sm">Email verified accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white/60">Unverified Users</p>
                        <p className="text-4xl font-bold text-red-400">{stats.users.unverified}</p>
                        <p className="text-white/40 text-sm">Pending verification</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Domain Users Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/95 border border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Users from: {domainToDelete}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Review users before deletion. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {loadingDomainUsers ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : deleteError ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {deleteError}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-white/60">
                Found {domainUsers.length} user(s) with this domain
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {domainUsers.map((user) => (
                  <div key={user.id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-white/40 text-sm">
                        {user.name || 'No name'} • {user.projectCount} projects • 
                        {user.verified ? (
                          <span className="text-green-400 ml-1">Verified</span>
                        ) : (
                          <span className="text-red-400 ml-1">Unverified</span>
                        )}
                      </p>
                    </div>
                    <p className="text-white/40 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDomainToDelete(null);
                setDomainUsers([]);
                setDeleteError(null);
              }}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={deleteDomainUsers}
              disabled={deletingDomain || domainUsers.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingDomain ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All ({domainUsers.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
