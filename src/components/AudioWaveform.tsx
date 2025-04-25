import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  timelineItems: any[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  timelineItems, 
  currentTime, 
  totalDuration,
  isPlaying,
  onSeek
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate random waveform data for visualization
  const generateWaveformData = (length: number) => {
    const data = [];
    for (let i = 0; i < length; i++) {
      // Create more realistic waveform with varying amplitudes
      const baseAmplitude = Math.random() * 0.5 + 0.2; // Between 0.2 and 0.7
      
      // Add some patterns to make it look more like speech
      const pattern = Math.sin(i / 20) * 0.3 + Math.sin(i / 10) * 0.1;
      
      // Occasional silence
      const silence = Math.random() > 0.95 ? 0.1 : 1;
      
      data.push(baseAmplitude * pattern * silence);
    }
    return data;
  };
  
  // Draw the waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Set canvas dimensions
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate total samples based on canvas width
    const totalSamples = canvas.width * 2;
    
    // Generate waveform data
    const waveformData = generateWaveformData(totalSamples);
    
    // Draw background
    ctx.fillStyle = '#1e293b'; // dark-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw timeline segments
    let currentX = 0;
    timelineItems.forEach((item, index) => {
      const segmentWidth = (item.duration / totalDuration) * canvas.width;
      
      // Draw segment background with alternating colors
      ctx.fillStyle = index % 2 === 0 ? '#334155' : '#475569'; // dark-700 and dark-600
      ctx.fillRect(currentX, 0, segmentWidth, canvas.height);
      
      // Draw segment label
      ctx.fillStyle = '#f1f5f9'; // dark-100
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`Scene ${index + 1}`, currentX + 5, 12);
      
      // Draw segment divider
      ctx.strokeStyle = '#0f172a'; // dark-900
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, canvas.height);
      ctx.stroke();
      
      currentX += segmentWidth;
    });
    
    // Draw waveform
    const middle = canvas.height / 2;
    const waveHeight = canvas.height * 0.4;
    
    ctx.strokeStyle = '#a78bfa'; // primary-400
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < totalSamples; i += 2) {
      const x = (i / totalSamples) * canvas.width;
      const amplitude = waveformData[i] * waveHeight;
      
      if (i === 0) {
        ctx.moveTo(x, middle + amplitude);
      } else {
        ctx.lineTo(x, middle + amplitude);
      }
    }
    
    for (let i = totalSamples - 1; i >= 0; i -= 2) {
      const x = (i / totalSamples) * canvas.width;
      const amplitude = waveformData[i] * waveHeight;
      ctx.lineTo(x, middle - amplitude);
    }
    
    ctx.closePath();
    ctx.fillStyle = 'rgba(167, 139, 250, 0.3)'; // primary-400 with opacity
    ctx.fill();
    ctx.stroke();
    
    // Draw playhead
    const playheadX = (currentTime / totalDuration) * canvas.width;
    ctx.strokeStyle = '#f43f5e'; // red-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
    
    // Draw playhead handle
    ctx.fillStyle = '#f43f5e'; // red-500
    ctx.beginPath();
    ctx.arc(playheadX, 15, 5, 0, Math.PI * 2);
    ctx.fill();
    
  }, [timelineItems, currentTime, totalDuration, isPlaying]);
  
  // Handle click to seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / canvas.width) * totalDuration;
    
    onSeek(seekTime);
  };
  
  return (
    <div ref={containerRef} className="w-full h-24 bg-dark-800 rounded-lg overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-1 text-xs text-dark-300 bg-dark-900/50">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(totalDuration)}</span>
      </div>
    </div>
  );
};

// Helper function to format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default AudioWaveform;
