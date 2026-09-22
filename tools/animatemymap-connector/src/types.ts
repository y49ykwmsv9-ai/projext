export type CameraMode = "top-down" | "bounce" | "fly-to" | "orbit" | "sweep";

export interface MapClip {
  title?: string;
  location: string;
  durationSeconds?: number;
  camera?: CameraMode;
  highlightedCountries?: string[];
  highlightedRegions?: string[];
  fill?: string;
  border?: string;
  borderWidth?: number;
  arrows?: Array<{ from: string; to: string; label?: string }>;
  labels?: Array<{ text: string; location: string }>;
  narration?: string;
}

export interface MapVideoPlan {
  title: string;
  aspectRatio?: "16:9" | "9:16";
  fps?: 30 | 60;
  resolution?: "720p" | "1080p" | "4k";
  theme?: "dark" | "light" | "satellite" | "custom";
  clips: MapClip[];
}
