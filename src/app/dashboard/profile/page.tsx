'use client';

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Sparkles, 
  DollarSign, 
  FileText, 
  Activity,
  Settings,
  Shield,
  Trash2,
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionUpgrade } from "@/components/SubscriptionUpgrade";

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    subscriptionStatus: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  };
  subscription: {
    status: string;
    isPro: boolean;
    limits: {
      tokens: number;
      images: number;
    };
    currentUsage: {
      tokens: number;
      images: number;
    };
    remaining: {
      tokens: number;
      images: number;
    };
    usagePercentage: {
      tokens: number;
      images: number;
    };
  };
  statistics: {
    totalProjects: number;
    totalTokenOperations: number;
    totalTokensUsed: number;
    totalCost: number;
    monthlyTokensUsed: number;
    monthlyCost: number;
  };
  recentActivity: {
    projects: Array<{
      id: string;
      title: string;
      type: string;
      language: string;
      updatedAt: string;
      _count: {
        scenes: number;
        characters: number;
      };
    }>;
    tokenUsage: Array<{
      id: string;
      type: string;
      tokens: number;
      cost: number;
      operationName: string;
      createdAt: string;
      project: {
        id: string;
        title: string;
      };
    }>;
  };
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setName(data.user.name || "");
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfileData();
    }
  }, [session, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfileData(prev => prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : null);
        
        // Update session
        await update();
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfileData(prev => prev ? { 
          ...prev, 
          user: { ...prev.user, image: result.imageUrl } 
        } : null);
        
        // Update session
        await update();
        
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Refresh profile data
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'script': return <FileText className="h-4 w-4" />;
      case 'storyboard': return <Activity className="h-4 w-4" />;
      case 'idea': return <Sparkles className="h-4 w-4" />;
      case 'character_generation': return <User className="h-4 w-4" />;
      case 'scenes': return <FileText className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-gray-400 mt-1">Manage your account and view usage statistics</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-md border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Usage & Limits
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      {profileData.user.image ? (
                        <img
                          src={profileData.user.image}
                          alt={profileData.user.name || "Profile"}
                          className="w-24 h-24 rounded-full border-4 border-purple-500 object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500">
                          <span className="text-2xl text-purple-500">
                            {profileData.user.name?.[0] || "U"}
                          </span>
                        </div>
                      )}
                      <Button
                        size="icon"
                        onClick={triggerFileInput}
                        disabled={uploadingImage}
                        className="absolute bottom-0 right-0 rounded-full bg-purple-500 hover:bg-purple-600"
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{profileData.user.name || "User"}</h3>
                      <p className="text-gray-400">{profileData.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click the camera icon to upload a new photo
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Member since</span>
                      <span className="text-sm">{formatDate(profileData.user.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Account type</span>
                      <Badge variant={profileData.subscription.isPro ? "default" : "secondary"}>
                        {profileData.subscription.isPro ? "Pro" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Card */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>Subscription</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge 
                      variant={profileData.subscription.isPro ? "default" : "secondary"}
                      className="text-lg px-4 py-2"
                    >
                      {profileData.subscription.isPro ? "Pro Plan" : "Free Plan"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Token Usage</span>
                        <span>{profileData.subscription.currentUsage.tokens.toLocaleString()} / {profileData.subscription.limits.tokens.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={profileData.subscription.usagePercentage.tokens} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Image Usage</span>
                        <span>{profileData.subscription.currentUsage.images} / {profileData.subscription.limits.images}</span>
                      </div>
                      <Progress 
                        value={profileData.subscription.usagePercentage.images} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {!profileData.subscription.isPro && (
                    <Button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{profileData.statistics.totalProjects}</div>
                      <div className="text-sm text-gray-400">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{profileData.statistics.totalTokenOperations}</div>
                      <div className="text-sm text-gray-400">AI Operations</div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Total tokens used</span>
                      <span className="text-sm">{profileData.statistics.totalTokensUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Total cost</span>
                      <span className="text-sm">{formatCurrency(profileData.statistics.totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">This month</span>
                      <span className="text-sm">{formatCurrency(profileData.statistics.monthlyCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage & Limits Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Usage Details */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Token Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Usage</span>
                        <span>{profileData.subscription.currentUsage.tokens.toLocaleString()} / {profileData.subscription.limits.tokens.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={profileData.subscription.usagePercentage.tokens} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{profileData.subscription.remaining.tokens.toLocaleString()} tokens remaining</span>
                        <span>{profileData.subscription.usagePercentage.tokens}% used</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">This month</span>
                      <span className="text-sm">{profileData.statistics.monthlyTokensUsed.toLocaleString()} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Monthly cost</span>
                      <span className="text-sm">{formatCurrency(profileData.statistics.monthlyCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Total lifetime</span>
                      <span className="text-sm">{profileData.statistics.totalTokensUsed.toLocaleString()} tokens</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Usage Details */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Image Generation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Usage</span>
                        <span>{profileData.subscription.currentUsage.images} / {profileData.subscription.limits.images}</span>
                      </div>
                      <Progress 
                        value={profileData.subscription.usagePercentage.images} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{profileData.subscription.remaining.images} images remaining</span>
                        <span>{profileData.subscription.usagePercentage.images}% used</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Image generation coming soon!</p>
                    <Badge variant="outline" className="text-xs">
                      Feature Preview
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Recent Projects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData.recentActivity.projects.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.recentActivity.projects.map((project) => (
                        <Link key={project.id} href={`/editor/${project.id}`}>
                          <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{project.title}</h4>
                                <p className="text-sm text-gray-400">{project.type} • {project.language}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">{formatDate(project.updatedAt)}</p>
                                <p className="text-xs text-gray-400">
                                  {project._count.scenes} scenes, {project._count.characters} characters
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No projects yet</p>
                      <Link href="/dashboard/projects/new">
                        <Button className="mt-4">Create Your First Project</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Token Usage */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Recent AI Operations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData.recentActivity.tokenUsage.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.recentActivity.tokenUsage.map((usage) => (
                        <div key={usage.id} className="p-3 rounded-lg bg-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getOperationIcon(usage.type)}
                              <div>
                                <p className="text-sm font-medium">{usage.operationName || usage.type}</p>
                                <p className="text-xs text-gray-400">{usage.project.title}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{usage.tokens.toLocaleString()} tokens</p>
                              <p className="text-xs text-gray-400">{formatCurrency(usage.cost)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No AI operations yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Profile Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        value={profileData.user.email}
                        disabled
                        className="bg-white/5 border-white/10 text-white/50"
                      />
                      <p className="text-xs text-gray-400">Email address cannot be changed</p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={updating || !name.trim()}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Management */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Account Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    
                    <Button variant="outline" className="w-full border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10">
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    
                    <Button variant="outline" className="w-full border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Need help?</p>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscription Upgrade Modal */}
      {showUpgradeModal && (
        <SubscriptionUpgrade
          currentPlan={profileData.subscription.isPro ? 'pro' : 'free'}
          onUpgrade={handleUpgradeSuccess}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
} 