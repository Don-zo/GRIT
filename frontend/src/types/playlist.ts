export interface PlaylistItem {
  id: string;
  title: string;
  url?: string;
}

export interface PlaylistCardProps {
  title: string;
  items: PlaylistItem[];
}

export interface ProgressBarProps {
  progress: number; // 0 ~ 100
  onChange: (value: number) => void;
}

export interface VolumeBarProps {
  volume: number; // 0 ~ 100
  onChange: (value: number) => void;
}

export interface PlaylistItemsProps {
  items: string[];
  selectedIndex?: number;
}
