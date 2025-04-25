export interface Image {
  id: string;
  url: string;
  alt: string;
  duration: number; // in seconds
}

export interface TimelineItem {
  id: string;
  imageId: string;
  startTime: number;
  duration: number;
  caption?: string;
  script?: string;
  voiceoverUrl?: string; // Add voiceover URL for each scene
}

export interface Project {
  id: string;
  name: string;
  timeline: TimelineItem[];
  totalDuration: number;
  script: string;
  voiceoverUrl?: string;
}
