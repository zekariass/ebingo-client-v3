// "use client";

// import { createContext, useContext, useEffect, useRef, useState } from "react";

// export type MusicPlayerContextType = {
//   isPlaying: boolean;
//   play: () => void;
//   pause: () => void;
//   toggle: () => void;
//   audioRef: React.RefObject<HTMLAudioElement | null>;
// };

// const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// export function MusicPlayerProvider({
//   children,
//   src,
//   defaultVolume = 0.3,
// }: {
//   children: React.ReactNode;
//   src: string;
//   defaultVolume?: number;
// }) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const play = async () => {
//     try {
//       await audioRef.current?.play();
//       setIsPlaying(true);
//       localStorage.setItem("bgm-enabled", "true");
//     } catch (err) {
//       console.warn("Audio blocked:", err);
//     }
//   };

//   const pause = () => {
//     audioRef.current?.pause();
//     setIsPlaying(false);
//     localStorage.setItem("bgm-enabled", "false");
//   };

//   const toggle = () => (isPlaying ? pause() : play());

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     audio.volume = defaultVolume;

//     // If user previously allowed music
//     if (localStorage.getItem("bgm-enabled") === "true") {
//       play();
//       return;
//     }

//     // Play on first user gesture
//     const handleFirstGesture = () => {
//       play();
//       window.removeEventListener("click", handleFirstGesture);
//       window.removeEventListener("touchstart", handleFirstGesture);
//     };

//     window.addEventListener("click", handleFirstGesture, { once: true });
//     window.addEventListener("touchstart", handleFirstGesture, { once: true });

//     return () => {
//       window.removeEventListener("click", handleFirstGesture);
//       window.removeEventListener("touchstart", handleFirstGesture);
//     };
//   }, [defaultVolume]);

//   return (
//     <MusicPlayerContext.Provider value={{ isPlaying, play, pause, toggle, audioRef }}>
//       {children}
//       <audio ref={audioRef} src={src} loop preload="auto" />
//     </MusicPlayerContext.Provider>
//   );
// }

// export const useMusicPlayer = () => {
//   const ctx = useContext(MusicPlayerContext);
//   if (!ctx) throw new Error("useMusicPlayer must be inside MusicPlayerProvider");
//   return ctx;
// };

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type MusicPlayerContextType = {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({
  children,
  src,
  defaultVolume = 0.1,
}: {
  children: React.ReactNode;
  src: string;
  defaultVolume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);

  // Load saved volume
  useEffect(() => {
    const savedVolume = localStorage.getItem("bgm-volume");
    if (savedVolume && audioRef.current) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      audioRef.current.volume = vol;
    }
  }, []);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
      localStorage.setItem("bgm-enabled", "true");
    } catch (err) {
      console.warn("Audio blocked:", err);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    localStorage.setItem("bgm-enabled", "false");
  };

  const toggle = () => (isPlaying ? pause() : play());

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem("bgm-volume", volume.toString());
  }, [volume]);

  // First-tap play for production
  useEffect(() => {
    if (localStorage.getItem("bgm-enabled") === "true") {
      play(); // try auto-play if user enabled previously
      return;
    }

    const handleFirstGesture = () => {
      play();
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, []);

  return (
    <MusicPlayerContext.Provider value={{ isPlaying, play, pause, toggle, audioRef }}>
      {children}
      <audio ref={audioRef} src={src} loop preload="auto" />
    </MusicPlayerContext.Provider>
  );
}

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be inside MusicPlayerProvider");
  return ctx;
};
