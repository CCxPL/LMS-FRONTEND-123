import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  title?: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title,
  poster,
  onProgress,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0); // Track max watched time

  if (!src) {
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const currentProgress = (currentTime / duration) * 100;
      
      setProgress(currentProgress);
      onProgress?.(currentProgress);

      // Prevent forward seeking beyond watched limit
      if (currentTime > maxWatched) {
        setMaxWatched(currentTime);
      }

      // Mark complete if watched 99%
      if (currentProgress >= 99) {
        onComplete?.();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      
      // 🔒 Restrict Forward Seeking
      if (seekTime > maxWatched) {
        videoRef.current.currentTime = maxWatched; // Force back to max watched
      } else {
        videoRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
      }
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden group relative">
      <video 
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()} // Disable right click
        controls={false} // Custom controls only
      >
        <source src={src} type="video/mp4" />
      </video>
      
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        
        {/* Progress Bar Container */}
        <div className="relative w-full h-1 bg-gray-700 rounded-full mb-4 cursor-pointer group/slider">
          
          {/* Buffered/Watched Track (Lighter Gray) */}
          <div 
            className="absolute top-0 left-0 h-full bg-gray-400 rounded-full transition-all duration-200" 
            style={{ width: `${(maxWatched / (videoRef.current?.duration || 1)) * 100}%` }}
          />
          
          {/* Current Progress (White) */}
          <div 
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />

          {/* Slider Thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow scale-0 group-hover/slider:scale-100 transition-transform"
            style={{ left: `${progress}%` }}
          />

          {/* Actual Range Input (Invisible but interactive) */}
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
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            
            <button onClick={skipBackward} className="text-white hover:text-gray-300 transition-colors" title="Rewind 10s">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            {/* Time Display */}
            <span className="text-xs text-gray-300 font-mono">
              {videoRef.current ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(14, 5) : "00:00"} / 
              {videoRef.current ? new Date(videoRef.current.duration * 1000).toISOString().substr(14, 5) : "00:00"}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Title Overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/80 to-transparent pointer-events-none">
          <p className="text-white text-sm font-medium">{title}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;