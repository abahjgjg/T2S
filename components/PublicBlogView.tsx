import React, { useEffect, useState } from 'react';
import { PublishedBlueprint, BusinessIdea, Comment } from '../types';
import { ArrowLeft, Calendar, Share2, TrendingUp, Layers, DollarSign, ArrowRight, Heart, Mail, CheckCircle, Copy, Check, MessageSquare, Send, User, Swords, Loader2 } from 'lucide-react';
// Note: All icons are used in this component
import { supabaseService } from '../services/supabaseService';
import { useMetaTags } from '../hooks/useMetaTags';
import { toast } from './ToastNotifications';
import { SafeMarkdown } from './SafeMarkdown';
import { usePreferences } from '../contexts/PreferencesContext';
import { UI_TIMING } from '../constants/uiConfig';
import { getOgImageUrl } from '../constants/appConfig';
import { TEXT_TRUNCATION, DISPLAY_LIMITS } from '../constants/displayLimits';

interface Props {
  id?: string | null;
  data?: PublishedBlueprint;
  onHome: () => void;
}

export const PublicBlogView: React.FC<Props> = ({ id, data: initialData, onHome }) => {
  const { uiText } = usePreferences();
  const [fetchedData, setFetchedData] = useState<PublishedBlueprint | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const data = initialData || fetchedData;

  useEffect(() => {
    if (!initialData && id) {
      setLoading(true);
      supabaseService.fetchBlueprint(id)
        .then(bp => {
          if (bp) {
            setFetchedData(bp);
          } else {
            setError("Blueprint not found");
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, initialData]);

  const { idea, blueprint } = data?.full_data || { idea: {} as any, blueprint: {} as any };
  const [related, setRelated] = useState<BusinessIdea[]>([]);
  const [votes, setVotes] = useState(data?.votes || 0);
  const [hasVotedState, setHasVotedState] = useState(false);
  
  // Newsletter State
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Share State
  const [linkCopied, setLinkCopied] = useState(false);

  // Comment State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Dynamic SEO & Open Graph Tags
  const ogImage = idea?.name ? getOgImageUrl(encodeURIComponent(idea.name)) : '';
  useMetaTags(
    idea?.name ? `${idea.name} | TrendVentures` : 'TrendVentures',
    blueprint?.executiveSummary ? blueprint.executiveSummary.slice(0, TEXT_TRUNCATION.metaDescription) + '...' : 'Business Blueprint',
    ogImage,
    window.location.href
  );

  useEffect(() => {
    if (!data) return;

    setHasVotedState(supabaseService.hasVoted(data.id));
    setVotes(data.votes || 0);

    // Fetch related blueprints
    const fetchRelated = async () => {
      const results = await supabaseService.findBlueprintsByNiche(data.niche);
      // Filter out current idea
      setRelated(results.filter(r => r.id !== data.id).slice(0, DISPLAY_LIMITS.content.relatedLinks));
    };
    fetchRelated();

    // Fetch Comments
    const loadComments = async () => {
      const loadedComments = await supabaseService.fetchComments(data.id);
      setComments(loadedComments);
    };
    loadComments();

  }, [data?.id, data?.niche]); // Only depend on ID/Niche to avoid loops

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Blueprint Not Found</h2>
        <p className="text-slate-600 mb-6">The requested blueprint could not be loaded or does not exist.</p>
        <button onClick={onHome} className="text-emerald-600 font-bold hover:underline">
          Return Home
        </button>
      </div>
    );
  }

  const handleRelatedClick = (id: string) => {
    window.location.href = `/blueprint?id=${id}`;
  };

  const handleVote = async () => {
    if (hasVotedState) return;
    setHasVotedState(true);
    setVotes(v => v + 1);
    await supabaseService.voteBlueprint(data.id);
    toast.success("Thanks for voting!");
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(uiText?.invalidEmail || "Invalid Email");
      return;
    }
    
    setIsSubmitting(true);
    await supabaseService.saveLead(data.id, email, idea.name);
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
    toast.success(uiText?.subscribed || "Subscribed successfully!");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${idea.name} - Business Blueprint`;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this AI-generated business blueprint: ${idea.name}`,
          url: url
        });
        return;
      } catch (err) {
        console.warn('Share failed', err);
      }
    }
    
    // Fallback to clipboard
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.info(uiText?.copied || "Link copied!");
    setTimeout(() => setLinkCopied(false), UI_TIMING.COPY_FEEDBACK_DURATION);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentAuthor.trim()) return;

    setIsPostingComment(true);
    const result = await supabaseService.postComment(data.id, commentAuthor, newComment);
    setIsPostingComment(false);

    if (result) {
      setComments(prev => [result, ...prev]);
      setNewComment('');
      toast.success("Comment posted!");
    } else {
      toast.error("Failed to post comment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Simple Public Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onHome}>
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tighter text-slate-900">
              Trend<span className="text-emerald-600">Ventures</span> AI
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={handleVote}
               disabled={hasVotedState}
               className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold transition-all ${
                 hasVotedState 
                 ? 'bg-red-50 border-red-200 text-red-500' 
                 : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500'
               }`}
             >
               <Heart className={`w-4 h-4 ${hasVotedState ? 'fill-red-500' : ''}`} />
               {votes} <span className="hidden sm:inline">{uiText?.likes || 'Likes'}</span>
             </button>
             
             <button
               onClick={handleShare}
               className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors text-sm font-bold"
             >
               {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
               <span className="hidden sm:inline">{linkCopied ? (uiText?.copied || 'Copied') : (uiText?.share || 'Share')}</span>
             </button>

             <button 
               onClick={onHome}
               className="hidden sm:flex text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors items-center gap-1 ml-2"
             >
               <ArrowLeft className="w-4 h-4" /> Create Yours
             </button>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-12 animate-[fadeIn_0.5s_ease-out]">
        {/* Meta Header */}
        <div className="mb-8 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3">
            <span>{data.niche}</span>
            <span>•</span>
            <span>{idea.type}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
            {idea.name}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-6">
            {blueprint.executiveSummary}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(data.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="px-2 py-0.5 bg-slate-200 rounded-full text-slate-600">
              Generated by AI
            </span>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm uppercase">{uiText?.model || 'Model'}</h3>
            </div>
            <p className="text-lg font-semibold text-slate-900">{idea.monetizationModel}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-sm uppercase">{uiText?.techStack || 'Tech Stack'}</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {blueprint.technicalStack.slice(0, DISPLAY_LIMITS.blueprint.tools).map((t, i) => (
                <span key={i} className="text-sm font-medium text-slate-900">{t}{i < DISPLAY_LIMITS.blueprint.tools - 1 ? ',' : '...'}</span>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-sm uppercase">Revenue Potential</h3>
            </div>
            <p className="text-lg font-semibold text-slate-900">{idea.potentialRevenue}</p>
          </div>
        </div>

        {/* Competitor Analysis (New Section) */}
        {idea.competitors && idea.competitors.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-12">
             <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Swords className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Competitor Landscape</h3>
             </div>
             <p className="text-slate-600 mb-3 text-sm">Key players currently operating in this space:</p>
             <div className="flex flex-wrap gap-2">
               {idea.competitors.map((comp, idx) => (
                 <span key={idx} className="bg-white border border-slate-300 text-slate-700 font-medium px-3 py-1 rounded-full text-sm shadow-sm">
                   {comp}
                 </span>
               ))}
             </div>
          </div>
        )}

        {/* Main Content */}
        <div className="prose prose-lg prose-slate max-w-none">
           <SafeMarkdown 
             content={blueprint.fullContentMarkdown}
             components={{
               h1: ({node, ...props}) => <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900" {...props} />,
               h2: ({node, ...props}) => <h3 className="text-2xl font-bold mt-10 mb-4 text-slate-900" {...props} />,
               h3: ({node, ...props}) => <h4 className="text-xl font-bold mt-8 mb-3 text-slate-900" {...props} />,
               ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6" {...props} />,
               li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
               p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-6" {...props} />,
               strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
               a: ({node, href, ...props}) => {
                 return (
                   <a 
                     href={href}
                     className="text-emerald-600 hover:text-emerald-800 font-bold" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     {...props} 
                    />
                 );
               }
             }}
           />
        </div>

        {/* Lead Capture / Waitlist */}
        <div className="my-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Mail className="w-64 h-64 text-white" />
           </div>
           
           <div className="relative z-10 max-w-xl mx-auto">
             {isSubscribed ? (
               <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
                 <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle className="w-8 h-8 text-emerald-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">{uiText?.subscribed || 'Subscribed!'}</h3>
                 <p className="text-slate-400">We'll notify you about {idea.name} updates.</p>
               </div>
             ) : (
               <>
                 <h3 className="text-2xl font-bold text-white mb-3">{uiText?.waitlistTitle || 'Interested in building this?'}</h3>
                 <p className="text-slate-400 mb-8">{uiText?.waitlistDesc || 'Join the waitlist to get updates on when this business concept launches.'}</p>
                 
                 <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                   <input 
                     type="email" 
                     placeholder={uiText?.emailPlaceholder || 'Enter your email...'}
                     className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                   >
                     {isSubmitting ? '...' : (uiText?.joinWaitlist || 'Join Waitlist')}
                   </button>
                 </form>
               </>
             )}
           </div>
        </div>

        {/* Comment Section */}
        <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-6 h-6 text-slate-400" />
            <h3 className="text-2xl font-bold text-slate-900">{uiText?.comments || 'Comments'} ({comments.length})</h3>
          </div>

          <form onSubmit={handlePostComment} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10">
            <div className="flex flex-col gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{uiText?.namePlaceholder || 'Name'}</label>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    disabled={isPostingComment}
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{uiText?.commentPlaceholder || 'Comment'}</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    disabled={isPostingComment}
                  />
               </div>
               <button
                 type="submit"
                 disabled={!newComment.trim() || !commentAuthor.trim() || isPostingComment}
                 className="self-end bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                 {isPostingComment ? (uiText?.posting || 'Posting...') : (
                   <>
                     <Send className="w-4 h-4" /> {uiText?.postComment || 'Post Comment'}
                   </>
                 )}
               </button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.length === 0 ? (
               <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                 {uiText?.noComments || 'No comments yet. Be the first!'}
               </div>
            ) : (
               comments.map((comment) => (
                 <div key={comment.id} className="flex gap-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{comment.author_name}</span>
                        <span className="text-xs text-slate-400">• {new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

        {/* Related Blueprints */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">More in {data.niche}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(item => (
                <div key={item.id} onClick={() => handleRelatedClick(item.id)} className="group cursor-pointer">
                  <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-lg transition-all h-full flex flex-col">
                    <h4 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">{item.description}</p>
                    <div className="flex items-center text-emerald-600 text-sm font-semibold mt-auto">
                      Read Blueprint <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Inspired by this idea?</h3>
          <p className="text-slate-600 mb-8">Generate your own unique business blueprint using our AI engine.</p>
          <button 
            onClick={onHome}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg shadow-emerald-600/20"
          >
            Start Your Research
          </button>
        </div>
      </article>
    </div>
  );
};