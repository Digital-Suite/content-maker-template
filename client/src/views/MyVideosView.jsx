import React, { useState } from 'react';
import { Play, Trash2, Film, Clock, Download, CheckCircle2, Loader2, Video, AlertTriangle } from 'lucide-react';

const INITIAL_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Lead Generation Strategies',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    duration: '15.2s',
    format: '9:16',
    status: 'ready',
    date: '2 hours ago'
  },
  {
    id: 'vid-2',
    title: 'The Curiosity Hook',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
    duration: '22.5s',
    format: '16:9',
    status: 'ready',
    date: 'Yesterday'
  },
  {
    id: 'vid-3',
    title: 'Behind the Scenes Value',
    thumbnail: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400',
    duration: '18.0s',
    format: '9:16',
    status: 'rendering',
    date: 'Just now'
  }
];

export function MyVideosView() {
  const [videos, setVideos] = useState(INITIAL_VIDEOS);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handlePlay = (video) => {
    if (video.status === 'rendering') {
      alert("This video is still rendering. Please check back in a few minutes.");
      return;
    }
    // Mock play functionality
    alert(`Playing video: ${video.title}`);
  };

  return (
    <div className="h-full flex flex-col bg-bg text-white">
      {/* Header */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border p-6 shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Video size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">My Videos</h1>
              <p className="text-muted text-xs font-medium">Manage and view your compiled content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          
          {/* Storage Warning Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 flex items-start space-x-3">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-yellow-500 font-bold text-sm">Storage Cost Notice</h4>
              <p className="text-yellow-500/80 text-sm mt-1 leading-relaxed">
                Rendered videos are stored directly on your own infrastructure. To minimize your hosting and storage costs, we highly recommend downloading your videos and deleting them from this library when you no longer need them.
              </p>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl bg-surface/50">
              <Film size={48} className="text-[#4b4d58] mb-4" />
              <h3 className="text-xl font-bold mb-2">No videos yet</h3>
              <p className="text-muted">Go to the Content Wizard to create your first video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg group hover:border-border-subtle transition-all flex flex-col">
                  {/* Thumbnail Container */}
                  <div className={`relative bg-bg overflow-hidden ${video.format === '9:16' ? 'aspect-[9/16]' : video.format === '16:9' ? 'aspect-video' : 'aspect-square'}`}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${video.status === 'rendering' ? 'opacity-40 grayscale' : 'opacity-90'}`} 
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      {video.status === 'ready' ? (
                        <div className="bg-primary/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center shadow-lg">
                          <CheckCircle2 size={12} className="mr-1" /> Ready
                        </div>
                      ) : (
                        <div className="bg-yellow-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center shadow-lg">
                          <Loader2 size={12} className="mr-1 animate-spin" /> Rendering
                        </div>
                      )}
                    </div>

                    {/* Format & Duration Badges */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        {video.format}
                      </div>
                      <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold flex items-center px-2 py-1 rounded-md">
                        <Clock size={10} className="mr-1" /> {video.duration}
                      </div>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform shadow-2xl">
                        <Play size={24} className="text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details & Actions */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-white mb-1 truncate" title={video.title}>{video.title}</h3>
                    <p className="text-muted text-xs font-medium mb-4">{video.date}</p>
                    
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                      <button 
                        onClick={() => handlePlay(video)}
                        className="text-sm font-bold text-white flex items-center hover:text-primary transition-colors"
                      >
                        <Play size={14} className="mr-1.5" /> View
                      </button>
                      <div className="flex items-center space-x-3 text-muted">
                        <button className="hover:text-white transition-colors" title="Download">
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="hover:text-red-400 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
