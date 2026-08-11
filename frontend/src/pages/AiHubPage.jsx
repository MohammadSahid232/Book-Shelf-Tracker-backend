import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Brain, Flame, Clock, Gauge, Target, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AiHubPage() {
  const { getAuthHeaders, BACKEND_URL } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [addingTitle, setAddingTitle] = useState(null);

  const fetchAiRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${BACKEND_URL}/api/ai/recommend`, {}, { headers });
      setRecommendations(response.data.recommendations || []);
      toast.success('AI recommendations refreshed! 🤖');
    } catch (err) {
      toast.error('Failed to generate AI recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchAiInsights = async () => {
    setLoadingInsights(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BACKEND_URL}/api/ai/insights`, { headers });
      setInsights(response.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchAiRecommendations();
    fetchAiInsights();
  }, []);

  const handleAddAiBook = async (b) => {
    setAddingTitle(b.title);
    try {
      const headers = getAuthHeaders();
      const payload = {
        title: b.title,
        author: b.author,
        genre: b.genre || 'General',
        description: b.reason,
        status: 'want to read',
      };
      await axios.post(`${BACKEND_URL}/api/shelf/add`, payload, { headers });
      toast.success(`"${b.title}" added to your shelf! 📚`);
    } catch (err) {
      toast.error('Failed to add book');
    } finally {
      setAddingTitle(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-8 transition-colors">
      {/* AI Hub Header Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-3 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400" />
            Gemini AI Recommendation Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Recommend Your Next Book</h1>
          <p className="text-purple-200 text-sm mt-1">
            Analyzing your finished books and ratings to recommend the next 3 books you should read.
          </p>
        </div>

        <button
          onClick={fetchAiRecommendations}
          disabled={loadingRecs}
          className="mt-6 sm:mt-0 relative z-10 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center gap-2 text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRecs ? 'animate-spin' : ''}`} />
          Recommend Next Book
        </button>
      </div>

      {/* AI Insights Summary Cards */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reading Habit</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{insights.readingHabit}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reading Streak</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{insights.readingStreak}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. Reading Speed</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{insights.readingSpeed}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggested Goal</p>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{insights.suggestedGoal}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Recommended Next Books
        </h2>

        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-neutral-700">
            <p className="text-sm font-bold">No recommendations generated yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((b, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-800/90 border border-purple-200/60 dark:border-purple-900/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                      {b.genre}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                      {b.confidenceScore}% Match
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    by {b.author}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed bg-slate-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-slate-100 dark:border-neutral-700/50">
                    "{b.reason}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-700/60 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    <span>{b.difficulty}</span> • <span>{b.estimatedReadingTime}</span>
                  </div>

                  <button
                    onClick={() => handleAddAiBook(b)}
                    disabled={addingTitle === b.title}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {addingTitle === b.title ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add to Shelf
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
