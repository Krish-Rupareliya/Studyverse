import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Radio,
  Award,
  BookOpen,
  Users,
  Flame,
  Plus,
} from 'lucide-react';

interface FeedViewProps {
  onNavigateProfile: (username: string) => void;
  onNavigateRoom: (roomId: string) => void;
}

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  type: 'milestone' | 'study_buddy' | 'question' | 'general';
  content: string;
  subject: string;
  timestamp: number;
  likes: string[];
  commentsCount: number;
  roomId?: string;
}

export const FeedView: React.FC<FeedViewProps> = ({ onNavigateProfile, onNavigateRoom }) => {
  const { currentUser } = useAuth();
  const { activeRoom } = useApp();

  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post_1',
      authorId: 'user_alex',
      authorName: 'Alex Rivera',
      authorUsername: 'alex_study',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'milestone',
      content: 'Just completed a 5-day study streak and solved all LeetCode graph problem sets for CS61B! 🎉 Huge thanks to the study room crew for keeping the focus up!',
      subject: 'Computer Science',
      timestamp: Date.now() - 1000 * 60 * 45,
      likes: ['user_bella', 'user_marcus'],
      commentsCount: 3,
    },
    {
      id: 'post_2',
      authorId: 'user_bella',
      authorName: 'Bella Chen',
      authorUsername: 'bella_codes',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      type: 'study_buddy',
      content: 'Looking for a study partner preparing for upcoming Data Structures midterms. Working on dynamic programming and recurrence trees in Room "CS61A Algorithms Sprint" right now!',
      subject: 'Computer Science',
      timestamp: Date.now() - 1000 * 60 * 120,
      likes: ['user_alex'],
      commentsCount: 2,
      roomId: 'room_cs61a',
    },
    {
      id: 'post_3',
      authorId: 'user_marcus',
      authorName: 'Marcus Vance',
      authorUsername: 'marcus_med',
      authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      type: 'question',
      content: 'Question for MCAT Biochemistry students: what is your best mnemonic for remembering enzyme kinetics and Michaelis-Menten constant (Km)?',
      subject: 'Pre-Med / MCAT',
      timestamp: Date.now() - 1000 * 60 * 240,
      likes: [],
      commentsCount: 5,
    },
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'milestone' | 'study_buddy' | 'question' | 'general'>('general');
  const [newPostSubject, setNewPostSubject] = useState('Computer Science');
  const [filterType, setFilterType] = useState<string>('all');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;

    const newPost: FeedPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      type: newPostType,
      content: newPostContent.trim(),
      subject: newPostSubject,
      timestamp: Date.now(),
      likes: [],
      commentsCount: 0,
      roomId: activeRoom?.id,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleToggleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likes.includes(currentUser.id);
          const updatedLikes = hasLiked
            ? post.likes.filter((id) => id !== currentUser.id)
            : [...post.likes, currentUser.id];
          return { ...post, likes: updatedLikes };
        }
        return post;
      })
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <div id="feed-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-200">
      {/* Create Post Card */}
      <div className="bg-[#171431] border border-[#26214A] rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#6D28D9]"
          />
          <div>
            <span className="font-bold text-sm text-white block">Share with the Study Community</span>
            <span className="text-[11px] text-[#8E8AAB]">Post study updates, find buddies, or ask questions</span>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What are you studying today? Share a win or find a partner..."
            className="w-full p-3 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] resize-none"
            rows={3}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={newPostType}
                onChange={(e) => setNewPostType(e.target.value as any)}
                className="px-3 py-1.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6] font-medium"
              >
                <option value="general">💬 General Update</option>
                <option value="study_buddy">👥 Study Buddy Wanted</option>
                <option value="milestone">🎉 Milestone / Streak</option>
                <option value="question">❓ Academic Question</option>
              </select>

              <select
                value={newPostSubject}
                onChange={(e) => setNewPostSubject(e.target.value)}
                className="px-3 py-1.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6] font-medium"
              >
                <option>Computer Science</option>
                <option>Pre-Med / MCAT</option>
                <option>Calculus / Math</option>
                <option>Law / Bar Prep</option>
                <option>Physics</option>
                <option>Design / Art</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition ${
            filterType === 'all' ? 'bg-[#6D28D9] text-white font-semibold shadow-xs' : 'bg-[#171431] text-[#8E8AAB] hover:text-white border border-[#26214A]'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterType('study_buddy')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition ${
            filterType === 'study_buddy' ? 'bg-[#6D28D9] text-white font-semibold shadow-xs' : 'bg-[#171431] text-[#8E8AAB] hover:text-white border border-[#26214A]'
          }`}
        >
          Study Buddies Wanted
        </button>
        <button
          onClick={() => setFilterType('milestone')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition ${
            filterType === 'milestone' ? 'bg-[#6D28D9] text-white font-semibold shadow-xs' : 'bg-[#171431] text-[#8E8AAB] hover:text-white border border-[#26214A]'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => setFilterType('question')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition ${
            filterType === 'question' ? 'bg-[#6D28D9] text-white font-semibold shadow-xs' : 'bg-[#171431] text-[#8E8AAB] hover:text-white border border-[#26214A]'
          }`}
        >
          Questions
        </button>
      </div>

      {/* Post Stream */}
      <div className="space-y-4">
        {(filteredPosts || []).map((post) => {
          const isLiked = (post.likes || []).includes(currentUser?.id || '');

          return (
            <div
              key={post.id}
              className="bg-[#171431] border border-[#26214A] rounded-2xl p-5 shadow-xl space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover cursor-pointer ring-1 ring-[#352F64]"
                    onClick={() => onNavigateProfile(post.authorUsername)}
                  />
                  <div>
                    <button
                      onClick={() => onNavigateProfile(post.authorUsername)}
                      className="font-bold text-xs text-white hover:text-[#A78BFA] transition block text-left"
                    >
                      {post.authorName}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-[#8E8AAB]">
                      <span className="text-[#A78BFA] font-medium">@{post.authorUsername}</span>
                      <span>•</span>
                      <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#0D0B1D] text-[#A78BFA] border border-[#2E2856]">
                  {post.subject}
                </span>
              </div>

              {/* Content */}
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Room Callout if attached */}
              {post.roomId && (
                <div className="p-3 rounded-xl bg-[#6D28D9]/20 border border-[#8B5CF6]/40 flex items-center justify-between">
                  <span className="text-xs text-white flex items-center gap-1.5 font-medium">
                    <Radio className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
                    <span>Currently live in study room</span>
                  </span>
                  <button
                    onClick={() => onNavigateRoom(post.roomId!)}
                    className="px-3 py-1 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    Join Room
                  </button>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-[#26214A] flex items-center justify-between text-xs text-[#8E8AAB]">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1.5 transition ${
                    isLiked ? 'text-rose-400 font-semibold' : 'hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes.length} Likes</span>
                </button>

                <div className="flex items-center gap-1.5 text-[#8E8AAB]">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount} Comments</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
