import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  videoUrl?: string;
  title?: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src,
  videoUrl,
  title,
  poster,
  onProgress,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  // Use src or videoUrl (priority: src > videoUrl)
  const videoSource = src || videoUrl;

  // Auto-hide controls timer
  useEffect(() => {
    // ✅ FIXED: ReturnType<typeof setTimeout> use kiya browser ke liye
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  if (!videoSource) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Video not available</p>
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      const currentProgress = (currentTime / dur) * 100;
      
      setProgress(currentProgress);
      onProgress?.(currentProgress);

      if (currentTime > maxWatched) {
        setMaxWatched(currentTime);
      }

      if (currentProgress >= 99) {
        onComplete?.();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      
      // Restrict forward seeking (Only allow seeking up to max watched + 5 seconds)
      if (seekTime > maxWatched + 5) {
        videoRef.current.currentTime = maxWatched;
      } else {
        videoRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
      }
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err);
        });
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-lg overflow-hidden group relative aspect-video"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Title Overlay */}
      {title && (
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-sm font-medium">{title}</p>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 bg-gray-700 rounded-full mb-4 cursor-pointer group/slider flex items-center">
          
          {/* Buffered/Watched Track (Gray) */}
          <div 
            className="absolute top-0 left-0 h-full bg-gray-400 rounded-full transition-all duration-200" 
            style={{ width: `${(maxWatched / (duration || 1)) * 100}%` }}
          />
          
          {/* Current Progress (Blue/White) */}
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />

          {/* Slider Thumb */}
          <div 
            className="absolute w-3 h-3 bg-white rounded-full shadow scale-0 group-hover/slider:scale-100 transition-transform -ml-1.5"
            style={{ left: `${progress}%` }}
          />

          {/* Actual Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            
            <button onClick={skipBackward} className="text-white hover:text-blue-400 transition-colors" title="Rewind 10s">
              <RotateCcw className="w-5 h-5" />
            </button>

            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            {/* Time Display */}
            <span className="text-xs text-gray-300 font-mono select-none">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;