'use client';

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement profile update
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="relative">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500">
                  <span className="text-4xl text-purple-500">
                    {session?.user?.name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0">
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full bg-purple-500 hover:bg-purple-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </Button>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Click the button above to change your profile picture
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white/70">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Email Address
            </label>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70">
              {session?.user?.email}
            </div>
            <p className="text-sm text-white/50">
              Email address cannot be changed
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
          >
            Delete Account
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 