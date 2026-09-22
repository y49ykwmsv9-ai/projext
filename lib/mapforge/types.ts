export type CameraMode = "top-down"|"bounce"|"fly-to"|"orbit"|"sweep";
export type LayerKind = "polity"|"route"|"marker"|"label"|"image"|"video"|"model";
export type MapSource = "openfree"|"historical";
export type MapForgeLayer = {
  id:string; kind:LayerKind; label?:string; coordinates?:[number,number][]; point?:[number,number];
  color?:string; opacity?:number; width?:number; url?:string; fromYear?:number; toYear?:number;
  modelScale?:number;
};
export type MapForgeClip = {
  id:string; title:string; year?:number; duration:number; camera:CameraMode;
  center:[number,number]; zoom:number; pitch?:number; bearing?:number;
  layers:MapForgeLayer[]; narration?:string;
  // Optional narrative geography used to keep historical data scoped to the story.
  region?:[number,number,number,number];
};
export type MapForgeCheck = { id:string; label:string; passed:boolean; severity:"error"|"warning"|"info"; detail:string; };\nexport type MapForgeVoice = { provider:"none"|"browser"|"external"; voice?:string; language:"en-US"|"en-GB"|"es-ES"|"fr-FR"|"de-DE"; pace:number; tone:string; };\nexport type MapForgeProject = {
  title:string; prompt:string; mapSource:MapSource; aspectRatio:"16:9"|"9:16";
  fps:30|60; resolution:"720p"|"1080p"|"4k"; theme:"dark"|"light"|"satellite";
  clips:MapForgeClip[]; credits:string[]; voice:MapForgeVoice; checks:MapForgeCheck[];
};