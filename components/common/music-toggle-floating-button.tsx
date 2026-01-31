"use client";

import { MusicPlayerContextType, useMusicPlayer } from "@/lib/contexts/music-player-context";
import { PauseIcon, PlayIcon, Volume2 } from "lucide-react";
import { useState } from "react";

export default function MusicToggleButton() {
  const { isPlaying, toggle, audioRef } = useMusicPlayer() as MusicPlayerContextType;
  const [volume, setVolume] = useState(audioRef.current?.volume ?? 0.1);
  const [sliderVisible, setSliderVisible] = useState(false);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    localStorage.setItem("bgm-volume", v.toString());
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center space-y-2">
      <div className="flex space-x-2 items-center">
        {/* Play/Pause Button */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? (
            // <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            //   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            // </svg>
            <PlayIcon className="w-6 h-6"/>
          ) : (
            // <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            //   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18l15-9L5 3z" />
            // </svg>
            <PauseIcon className="w-6 h-6" />
          )}
        </button>

        {/* Volume Button */}
        <button
          onClick={() => setSliderVisible(!sliderVisible)}
          className="w-8 h-8 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="Adjust Volume"
        >
          {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
          </svg> */}
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Volume Slider */}
      {sliderVisible && (
        <div className="bg-white p-2 rounded shadow-lg flex items-center opacity-0 animate-fade-in mt-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-28 accent-blue-500"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
