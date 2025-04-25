import React, { useState, useRef, useEffect } from 'react';
import { TimelineItem, Image } from '../types';
import { Play, Pause, Download, Share2 } from 'lucide-react';
import AudioWaveform from './AudioWaveform';

interface VideoPreviewProps {
  timelineItems: TimelineItem[];
  images: Image[];
  script: string;
  voiceoverUrl: string | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  timelineItems,
  images,
  script,
  voiceoverUrl
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});
  const playbackTimerRef = useRef<number | null>(null);
  const totalDuration = timelineItems.reduce((acc, item) => acc + item.duration, 0);
  
  const getImageById = (id: string): Image | undefined => {
    return images.find(img => img.id === id);
  };
  
  const currentImage = timelineItems.length > 0 
    ? getImageById(timelineItems[currentImageIndex]?.imageId)
    : null;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  // Reset playback when timeline items change
  useEffect(() => {
    setCurrentImageIndex(0);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Pause all audio elements
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, [timelineItems]);

  // Create audio elements for each scene with voiceover
  useEffect(() => {
    timelineItems.forEach((item, index) => {
      if (item.voiceoverUrl && !audioRefs.current[item.id]) {
        const audio = new Audio(item.voiceoverUrl);
        audio.preload = 'auto';
        audioRefs.current[item.id] = audio;
      }
    });
  }, [timelineItems]);

  const handlePlayPause = () => {
    if (timelineItems.length === 0) return;
    
    if (isPlaying) {
      // Pause playback
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      
      // Pause current audio
      const currentItem = timelineItems[currentImageIndex];
      if (currentItem && currentItem.voiceoverUrl && audioRefs.current[currentItem.id]) {
        audioRefs.current[currentItem.id].pause();
      }
    } else {
      // Start playback
      setIsPlaying(true);
      
      // Start from the beginning if we're at the end
      if (currentImageIndex >= timelineItems.length - 1 && currentTime >= totalDuration - 0.1) {
        setCurrentImageIndex(0);
        setProgress(0);
        setCurrentTime(0);
      }
      
      advancePlayback();
    }
  };

  const advancePlayback = () => {
    if (currentImageIndex >= timelineItems.length) {
      // End of playback
      setIsPlaying(false);
      setCurrentImageIndex(0);
      setProgress(0);
      setCurrentTime(0);
      return;
    }
    
    const currentItem = timelineItems[currentImageIndex];
    if (!currentItem) return;
    
    // Play audio for current scene if available
    if (currentItem.voiceoverUrl && audioRefs.current[currentItem.id]) {
      audioRefs.current[currentItem.id].play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    const itemDuration = currentItem.duration * 1000; // Convert to ms
    
    // Update progress every 50ms
    const progressInterval = 50;
    let elapsedTime = 0;
    
    const updateProgress = () => {
      elapsedTime += progressInterval;
      
      // Calculate overall progress
      const previousDuration = timelineItems
        .slice(0, currentImageIndex)
        .reduce((acc, item) => acc + item.duration, 0);
      
      const currentProgress = previousDuration + (elapsedTime / 1000);
      const progressPercentage = (currentProgress / totalDuration) * 100;
      setProgress(progressPercentage);
      setCurrentTime(currentProgress);
      
      if (elapsedTime < itemDuration) {
        // Continue with current image
        playbackTimerRef.current = window.setTimeout(updateProgress, progressInterval);
      } else {
        // Pause current audio if it's still playing
        if (currentItem.voiceoverUrl && audioRefs.current[currentItem.id]) {
          audioRefs.current[currentItem.id].pause();
          audioRefs.current[currentItem.id].currentTime = 0;
        }
        
        // Move to next image
        setCurrentImageIndex(prevIndex => prevIndex + 1);
        playbackTimerRef.current = window.setTimeout(advancePlayback, 0);
      }
    };
    
    playbackTimerRef.current = window.setTimeout(updateProgress, progressInterval);
  };

  const handleSeek = (seekTime: number) => {
    if (!isPlaying) {
      // Find which scene contains this time
      let accumulatedTime = 0;
      let targetIndex = 0;
      
      for (let i = 0; i < timelineItems.length; i++) {
        const duration = timelineItems[i].duration;
        if (seekTime >= accumulatedTime && seekTime < accumulatedTime + duration) {
          targetIndex = i;
          break;
        }
        accumulatedTime += duration;
      }
      
      // Update state
      setCurrentImageIndex(targetIndex);
      setCurrentTime(seekTime);
      setProgress((seekTime / totalDuration) * 100);
    }
  };

  return (
    <div className="card p-4 h-full">
      <h2 className="text-lg font-semibold text-dark-100 mb-4">Video Preview</h2>
      
      <div className="relative aspect-video bg-dark-950 rounded-lg overflow-hidden mb-4">
        {timelineItems.length > 0 && currentImage ? (
          <>
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-contain"
            />
            
            {/* Caption overlay */}
            {timelineItems[currentImageIndex]?.caption && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="caption-text max-w-[80%]">
                  {timelineItems[currentImageIndex].caption}
                </div>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-800">
              <div 
                className="h-full bg-primary-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-dark-400">
            <p>Add images to the timeline to preview your video</p>
          </div>
        )}
        
        {timelineItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-950/90 to-transparent p-4">
            <p className="text-dark-200 text-sm">
              {currentImageIndex + 1} / {timelineItems.length}
            </p>
          </div>
        )}
      </div>
      
      {/* Audio waveform visualization */}
      {timelineItems.length > 0 && (
        <div className="mb-4">
          <AudioWaveform 
            timelineItems={timelineItems}
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            onSeek={handleSeek}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePlayPause}
          disabled={timelineItems.length === 0}
          className={`flex items-center py-2 px-4 rounded-lg ${
            timelineItems.length === 0
              ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } transition-colors`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </button>
        
        <div className="flex space-x-2">
          <button
            disabled={timelineItems.length === 0 || !script}
            className={`p-2 rounded-lg ${
              timelineItems.length === 0 || !script
                ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                : 'bg-dark-700 hover:bg-dark-600 text-dark-200'
            } transition-colors`}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            disabled={timelineItems.length === 0 || !script}
            className={`p-2 rounded-lg ${
              timelineItems.length === 0 || !script
                ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                : 'bg-dark-700 hover:bg-dark-600 text-dark-200'
            } transition-colors`}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {timelineItems.length > 0 && currentImage && (
        <div className="p-3 bg-dark-700 rounded-lg">
          <h3 className="font-medium mb-1 text-dark-200">Current Scene</h3>
          <p className="text-sm text-dark-300">
            {currentImage.alt} - Duration: {timelineItems[currentImageIndex]?.duration}s
          </p>
        </div>
      )}
      
      {/* Hidden audio elements for voiceovers */}
      {timelineItems.map(item => (
        item.voiceoverUrl ? (
          <audio 
            key={item.id} 
            ref={(el) => {
              if (el) audioRefs.current[item.id] = el;
            }}
            src={item.voiceoverUrl} 
            preload="auto" 
            style={{ display: 'none' }}
          />
        ) : null
      ))}
    </div>
  );
};

export default VideoPreview;
