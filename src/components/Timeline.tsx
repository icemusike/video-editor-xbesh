import React, { useState, useRef } from 'react';
import { TimelineItem as TimelineItemType, Image } from '../types';
import { Clock, Trash2, ChevronUp, ChevronDown, Edit, Copy, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface TimelineProps {
  items: TimelineItemType[];
  images: Image[];
  onAddItem: (item: TimelineItemType) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (item: TimelineItemType) => void;
  onReorderItems: (items: TimelineItemType[]) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  items,
  images,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onReorderItems
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const imageData = e.dataTransfer.getData('application/json');
    
    if (imageData) {
      const image = JSON.parse(imageData) as Image;
      const newItem: TimelineItemType = {
        id: `item-${Date.now()}`,
        imageId: image.id,
        startTime: items.reduce((acc, item) => Math.max(acc, item.startTime + item.duration), 0),
        duration: image.duration,
        caption: ''
      };
      
      onAddItem(newItem);
    }
  };

  const getImageById = (id: string): Image | undefined => {
    return images.find(img => img.id === id);
  };

  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndexStr = e.dataTransfer.getData('text/plain');
    if (!dragIndexStr) return;
    
    const dragIndex = parseInt(dragIndexStr);
    if (isNaN(dragIndex) || dragIndex === dropIndex || dragIndex < 0 || dragIndex >= items.length) return;

    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    
    // Remove the dragged item
    newItems.splice(dragIndex, 1);
    
    // Insert at the new position
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Update start times
    let currentStartTime = 0;
    const updatedItems = newItems.map(item => {
      if (!item) return null; // Guard against undefined items
      
      const updatedItem = { ...item, startTime: currentStartTime };
      currentStartTime += item.duration;
      return updatedItem;
    }).filter(Boolean) as TimelineItemType[]; // Filter out any null values
    
    onReorderItems(updatedItems);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update start times
    let currentStartTime = 0;
    const updatedItems = newItems.map(item => {
      const updatedItem = { ...item, startTime: currentStartTime };
      currentStartTime += item.duration;
      return updatedItem;
    });
    
    onReorderItems(updatedItems);
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      onUpdateItem({ ...item, caption });
    }
  };

  const handleEditCaption = (id: string) => {
    setEditingCaptionId(id);
  };

  const handleSaveCaption = () => {
    setEditingCaptionId(null);
  };

  const handlePlayAudio = (id: string) => {
    // Stop any currently playing audio
    if (playingAudioId && audioRefs.current[playingAudioId]) {
      audioRefs.current[playingAudioId].pause();
      audioRefs.current[playingAudioId].currentTime = 0;
    }
    
    // If we're clicking the same audio that's already playing, just stop it
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    
    // Play the selected audio
    if (audioRefs.current[id]) {
      audioRefs.current[id].play()
        .then(() => {
          setPlayingAudioId(id);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
      
      // Set up event listener to clear playing state when audio ends
      audioRefs.current[id].onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

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

  return (
    <div className="card p-4 h-full">
      <h2 className="text-lg font-semibold text-dark-100 mb-4">Timeline</h2>
      
      <div 
        className="border-2 border-dashed border-dark-600 rounded-lg p-4 min-h-[200px] mb-4 bg-dark-800/50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-dark-400">
            <Clock className="h-10 w-10 mb-2" />
            <p>Drag images here to create your video timeline</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {items.map((item, index) => {
              const image = getImageById(item.imageId);
              const isPlaying = playingAudioId === item.id;
              
              // Generate waveform data for this scene
              const waveformData = generateWaveformData(50);
              
              return (
                <div
                  key={item.id}
                  className={`timeline-item flex flex-col p-3 rounded-lg ${
                    dragOverIndex === index ? 'bg-dark-700 border border-primary-500' : 'bg-dark-700 border border-dark-600'
                  } transition-all`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDrop={(e) => handleItemDrop(e, index)}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16 mr-3 rounded overflow-hidden border border-dark-600">
                      {image && (
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-dark-100">{image?.alt || 'Image'}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveItem(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-600'}`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            className={`p-1 rounded ${index === items.length - 1 ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-600'}`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <div className="flex items-center ml-2">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={item.duration}
                              onChange={(e) => {
                                const duration = parseInt(e.target.value) || 1;
                                onUpdateItem({ ...item, duration });
                              }}
                              className="w-14 px-2 py-1 bg-dark-600 border border-dark-500 rounded text-center text-dark-100"
                            />
                            <span className="text-sm text-dark-400 ml-1">sec</span>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-dark-400 hover:text-red-500 hover:bg-dark-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-dark-400 mt-1">
                        Start: {item.startTime}s
                      </div>
                    </div>
                  </div>
                  
                  {/* Caption section */}
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-dark-300">Caption</span>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditCaption(item.id)}
                          className="p-1 text-dark-400 hover:text-primary-400 hover:bg-dark-600 rounded"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          className="p-1 text-dark-400 hover:text-primary-400 hover:bg-dark-600 rounded"
                          onClick={() => {
                            // Copy caption from script if available
                            if (item.script) {
                              handleCaptionChange(item.id, item.script);
                            }
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {editingCaptionId === item.id ? (
                      <div className="mt-1">
                        <textarea
                          value={item.caption || ''}
                          onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-dark-100 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          rows={2}
                          placeholder="Enter caption text..."
                        />
                        <div className="flex justify-end mt-1">
                          <button
                            onClick={handleSaveCaption}
                            className="px-2 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dark-300 bg-dark-600 rounded p-2 min-h-[2.5rem]">
                        {item.caption || 'No caption added yet. Click edit to add one.'}
                      </p>
                    )}
                  </div>
                  
                  {/* Voiceover section */}
                  {item.caption && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-dark-300">Voiceover</span>
                        <button
                          onClick={() => handlePlayAudio(item.id)}
                          disabled={!item.voiceoverUrl}
                          className={`p-1 rounded ${!item.voiceoverUrl ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-primary-400 hover:bg-dark-600'}`}
                        >
                          {isPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      
                      {item.voiceoverUrl ? (
                        <div className="relative h-8 bg-dark-600 rounded overflow-hidden">
                          {/* Waveform visualization */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center h-4 space-x-0.5 px-2">
                              {waveformData.map((amplitude, i) => (
                                <div
                                  key={i}
                                  className={`w-0.5 ${isPlaying ? 'bg-primary-400' : 'bg-dark-400'}`}
                                  style={{ height: `${amplitude * 100}%`, maxHeight: '100%' }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Hidden audio element */}
                          <audio
                            ref={(el) => {
                              if (el) audioRefs.current[item.id] = el;
                            }}
                            src={item.voiceoverUrl}
                            preload="auto"
                            style={{ display: 'none' }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-8 bg-dark-600 rounded text-dark-400 text-xs">
                          <Volume2 className="h-3 w-3 mr-1" />
                          Generate voiceover to preview
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-dark-300">
          Total Duration: {items.reduce((acc, item) => acc + item.duration, 0)} seconds
        </div>
        <div className="text-sm text-dark-300">
          {items.length} {items.length === 1 ? 'scene' : 'scenes'}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
