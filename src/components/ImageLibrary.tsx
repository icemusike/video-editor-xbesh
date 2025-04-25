import React, { useState } from 'react';
import { Image as ImageType } from '../types';
import { Search, Filter, Grid, List } from 'lucide-react';

interface ImageLibraryProps {
  images: ImageType[];
  onDragStart: (image: ImageType) => void;
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({ images, onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredImages = images.filter(image => 
    image.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-100">Image Library</h2>
        <div className="flex space-x-1">
          <button 
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-dark-700 text-primary-400' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button 
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-dark-700 text-primary-400' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full pl-10 pr-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-dark-400" />
        <button className="absolute right-3 top-2.5 text-dark-400 hover:text-dark-200">
          <Filter className="h-5 w-5" />
        </button>
      </div>
      
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-dark-400">
          <p>No images found. Try a different search term.</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 gap-3' 
            : 'flex flex-col space-y-2'
          } 
          overflow-y-auto max-h-[calc(100vh-280px)] pr-1`
        }>
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`
                relative group cursor-grab rounded-lg overflow-hidden border border-dark-700 
                hover:border-primary-500 transition-all
                ${viewMode === 'list' ? 'flex items-center p-2' : ''}
              `}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(image));
                onDragStart(image);
              }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className={`
                  ${viewMode === 'grid' ? 'w-full h-32 object-cover' : 'w-16 h-16 object-cover rounded mr-3'}
                `}
              />
              {viewMode === 'list' && (
                <div className="flex-1">
                  <p className="text-dark-100 font-medium text-sm">{image.alt}</p>
                  <p className="text-dark-400 text-xs">Duration: {image.duration}s</p>
                </div>
              )}
              <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/60 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-primary-600 px-2 py-1 rounded">
                  Drag to timeline
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
