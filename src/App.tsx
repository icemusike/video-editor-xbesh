import React, { useState } from 'react';
import Header from './components/Header';
import ImageLibrary from './components/ImageLibrary';
import Timeline from './components/Timeline';
import ScriptGenerator from './components/ScriptGenerator';
import VideoPreview from './components/VideoPreview';
import { Image, TimelineItem } from './types';
import { sampleImages } from './data/sampleImages';

function App() {
  const [images] = useState<Image[]>(sampleImages);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [script, setScript] = useState<string>('');
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<Image | null>(null);

  const handleAddTimelineItem = (item: TimelineItem) => {
    setTimelineItems(prev => {
      const newItems = [...prev, item];
      
      // Update start times
      let currentStartTime = 0;
      return newItems.map(item => {
        const updatedItem = { ...item, startTime: currentStartTime };
        currentStartTime += item.duration;
        return updatedItem;
      });
    });
  };

  const handleRemoveTimelineItem = (id: string) => {
    setTimelineItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      
      // Update start times
      let currentStartTime = 0;
      return newItems.map(item => {
        const updatedItem = { ...item, startTime: currentStartTime };
        currentStartTime += item.duration;
        return updatedItem;
      });
    });
  };

  const handleUpdateTimelineItem = (updatedItem: TimelineItem) => {
    setTimelineItems(prev => {
      const index = prev.findIndex(item => item.id === updatedItem.id);
      if (index === -1) return prev;
      
      const newItems = [...prev];
      newItems[index] = updatedItem;
      
      // Update start times
      let currentStartTime = 0;
      return newItems.map(item => {
        const updatedItem = { ...item, startTime: currentStartTime };
        currentStartTime += item.duration;
        return updatedItem;
      });
    });
  };

  const handleReorderTimelineItems = (items: TimelineItem[]) => {
    setTimelineItems(items);
  };

  const handleScriptGenerated = (generatedScript: string) => {
    setScript(generatedScript);
    
    // Extract script segments and apply to timeline items
    const scriptLines = generatedScript.split('\n\n');
    
    if (scriptLines.length === timelineItems.length) {
      const updatedItems = timelineItems.map((item, index) => {
        // Extract the actual script content without the scene prefix
        const scriptContent = scriptLines[index].replace(/^\[Scene \d+\]: .*? - /, '');
        return { ...item, script: scriptContent };
      });
      
      setTimelineItems(updatedItems);
    }
  };

  const handleDragStart = (image: Image) => {
    setDraggedImage(image);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <VideoPreview 
              timelineItems={timelineItems}
              images={images}
              script={script}
              voiceoverUrl={voiceoverUrl}
            />
          </div>
          <div>
            <ScriptGenerator 
              timelineItems={timelineItems}
              images={images}
              onScriptGenerated={handleScriptGenerated}
              onUpdateTimelineItem={handleUpdateTimelineItem}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <ImageLibrary 
              images={images}
              onDragStart={handleDragStart}
            />
          </div>
          <div className="lg:col-span-2">
            <Timeline 
              items={timelineItems}
              images={images}
              onAddItem={handleAddTimelineItem}
              onRemoveItem={handleRemoveTimelineItem}
              onUpdateItem={handleUpdateTimelineItem}
              onReorderItems={handleReorderTimelineItems}
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-dark-900 text-dark-400 py-4 border-t border-dark-800">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 VideoAI Creator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
