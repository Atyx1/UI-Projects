"use client";
import React, { useState, useEffect, useRef } from "react";

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
  
  @keyframes pulse-highlight {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  .active-lyric {
    animation: pulse-highlight 2s infinite;
  }
  
  /* Navbar animations */
  @keyframes navbarFadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .navbar-animate {
    animation: navbarFadeIn 0.5s ease-out forwards;
  }
  
  .nav-link {
    position: relative;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background: linear-gradient(to right, #9B59B6, #F8C0C8);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  .nav-link:hover::after {
    width: 100%;
  }
  
  /* Mobile navigation animations */
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .mobile-nav {
    animation: slideUp 0.3s ease-out forwards;
  }
`;

// Types and Interfaces
interface SongPost {
  id: string;
  title: string;
  lyrics: string;
  generatedAudioUrl: string;
  coverImageUrl: string;
  createdAt: string;
  createdBy: string;
  category: string;
  likes: number;
  favorites: number;
}

interface User {
  id: string;
  username: string;
  profilePictureUrl?: string;
  uploadedSongs: SongPost[];
  favoriteSongIds: string[];
  likedSongIds: string[];
  followers: number;
  following: number;
  memberSince: string;
  bio?: string;
  email?: string;
}

// Categories
const categories = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Indie",
  "Electronic",
  "R&B",
];

// Dummy data
const dummySongs: SongPost[] = [
  {
    id: "1",
    title: "Midnight Serenade",
    lyrics:
      "City lights glimmer through the rain\nJazz notes float on the midnight air\nSaxophone whispers secrets untold\nAs we dance without a care",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 6, 21).toISOString(),
    createdBy: "jazzlover",
    category: "Jazz",
    likes: 24,
    favorites: 11,
  },
  {
    id: "2",
    title: "Electric Dreams",
    lyrics:
      "Neon waves crash through my mind\nSynthesizers painting the night\nPulse and beat, a digital heart\nLost in sound, a new world to start",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1614149162883-504ce4d13909?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 7, 14).toISOString(),
    createdBy: "synthwave",
    category: "Electronic",
    likes: 42,
    favorites: 18,
  },
  {
    id: "3",
    title: "Autumn Acoustic",
    lyrics:
      "Fallen leaves crunch beneath our feet\nAcoustic strumming soft and sweet\nWhispered words between chord changes\nAutumn love that never ages",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 9, 5).toISOString(),
    createdBy: "acousticmelody",
    category: "Indie",
    likes: 37,
    favorites: 22,
  },
  {
    id: "4",
    title: "Concrete Rhythm",
    lyrics:
      "Beats echo through the concrete maze\nMic in hand, words ablaze\nStories from the streets we know\nFlow by flow, we watch it grow",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1546528377-37aa8006d3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 8, 18).toISOString(),
    createdBy: "rhythmpoet",
    category: "Hip-Hop",
    likes: 56,
    favorites: 27,
  },
  {
    id: "5",
    title: "Sunset Boulevard",
    lyrics:
      "Guitar riffs cutting through the night\nStage lights blazing, burning bright\nLeather and denim, voices raised\nRock anthem leaving us amazed",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 5, 27).toISOString(),
    createdBy: "rocklegend",
    category: "Rock",
    likes: 68,
    favorites: 31,
  },
  {
    id: "6",
    title: "Melody Lane",
    lyrics:
      "Summer evening, windows down\nRadio playing our favorite sound\nCatchy chorus we can't resist\nPop melodies twist and twist",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 6, 14).toISOString(),
    createdBy: "popstar",
    category: "Pop",
    likes: 89,
    favorites: 44,
  },
  {
    id: "7",
    title: "Moonlight Sonata Reimagined",
    lyrics:
      "Piano keys tell stories old\nMelodies centuries have told\nEchoes of masters in each note\nClassical dreams on which we float",
    generatedAudioUrl: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    createdAt: new Date(2023, 4, 8).toISOString(),
    createdBy: "classicalfusion",
    category: "Classical",
    likes: 42,
    favorites: 31,
  },
];

const dummyUser: User = {
  id: "1",
  username: "musiclover",
  profilePictureUrl:
    "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  uploadedSongs: [dummySongs[1]],
  favoriteSongIds: ["1", "3", "5"],
  likedSongIds: ["2", "4", "6"],
  followers: 120,
  following: 85,
  memberSince: "March 2024",
  bio: "Music lover and creator. I enjoy sharing my lyrical creations with the world.",
  email: "musiclover@example.com",
};

export default function Home() {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [songs, setSongs] = useState<SongPost[]>(dummySongs);
  const [currentUser, setCurrentUser] = useState<User>({
    ...dummyUser,
    followers: 120,
    following: 85,
    memberSince: "March 2024",
    bio: "Music lover and creator. I enjoy sharing my lyrical creations with the world.",
    email: "musiclover@example.com",
  });
  const [selectedSong, setSelectedSong] = useState<SongPost | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [newProfilePicPreview, setNewProfilePicPreview] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "posts" | "settings"
  >("posts");
  const [songRatings, setSongRatings] = useState<{ [key: string]: number }>({});
  const [showRatingTooltip, setShowRatingTooltip] = useState<string | null>(
    null
  );

  // Modal related states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSong, setModalSong] = useState<SongPost | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(-1);
  const lyricRef = useRef<HTMLDivElement>(null);

  // Form states
  const [newSong, setNewSong] = useState<{
    title: string;
    lyrics: string;
    category: string;
    coverImage: File | null;
  }>({
    title: "",
    lyrics: "",
    category: categories[0],
    coverImage: null,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);

  // Local state for controlled inputs to prevent re-renders
  const [titleInput, setTitleInput] = useState("");
  const [lyricsInput, setLyricsInput] = useState("");
  const [categoryInput, setCategoryInput] = useState(categories[0]);
  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");

  // Load initial values from main state
  useEffect(() => {
    setTitleInput(newSong.title);
    setLyricsInput(newSong.lyrics);
    setCategoryInput(newSong.category);
    setUsernameInput(currentUser.username);
    setBioInput(currentUser.bio || "");
  }, []);

  // Optimized handlers for form inputs - with timeout
  const updateSongDebounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const handleInputChange = (field: keyof typeof newSong, value: string) => {
    // Update local state immediately for responsive UI
    switch (field) {
      case "title":
        setTitleInput(value);
        break;
      case "lyrics":
        setLyricsInput(value);
        break;
      case "category":
        setCategoryInput(value);
        break;
    }

    // Clear existing timeout for this field if any
    if (updateSongDebounceTimeouts.current[field]) {
      clearTimeout(updateSongDebounceTimeouts.current[field]);
    }

    // Create new timeout to update the actual state
    updateSongDebounceTimeouts.current[field] = setTimeout(() => {
      setNewSong((prev) => ({ ...prev, [field]: value }));
    }, 300);
  };

  // Optimized handlers for profile inputs - with timeout
  const updateProfileDebounceTimeouts = useRef<Record<string, NodeJS.Timeout>>(
    {}
  );

  const handleProfileInputChange = (
    field: keyof typeof currentUser,
    value: string
  ) => {
    // Update local state immediately
    switch (field) {
      case "username":
        setUsernameInput(value);
        break;
      case "bio":
        setBioInput(value);
        break;
    }

    // Clear existing timeout for this field if any
    if (updateProfileDebounceTimeouts.current[field]) {
      clearTimeout(updateProfileDebounceTimeouts.current[field]);
    }

    // Create new timeout to update the actual state
    updateProfileDebounceTimeouts.current[field] = setTimeout(() => {
      setCurrentUser((prev) => ({ ...prev, [field]: value }));
    }, 300);
  };

  // Clean up timeouts on component unmount
  useEffect(() => {
    return () => {
      // Clear all song update timeouts
      Object.values(updateSongDebounceTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });

      // Clear all profile update timeouts
      Object.values(updateProfileDebounceTimeouts.current).forEach(
        (timeout) => {
          clearTimeout(timeout);
        }
      );
    };
  }, []);

  // Effect for notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle song likes
  const handleLike = (songId: string) => {
    // Add song to user's liked songs
    const isLiked = currentUser.likedSongIds.includes(songId);

    if (isLiked) {
      // Unlike the song
      setCurrentUser({
        ...currentUser,
        likedSongIds: currentUser.likedSongIds.filter((id) => id !== songId),
      });
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId
            ? { ...song, likes: Math.max(0, song.likes - 1) }
            : song
        )
      );
      showNotification("success", "Song unliked!");
    } else {
      // Like the song
      setCurrentUser({
        ...currentUser,
        likedSongIds: [...currentUser.likedSongIds, songId],
      });
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, likes: song.likes + 1 } : song
        )
      );
      showNotification("success", "Song liked successfully!");
    }
  };

  // Handle song favorites
  const handleFavorite = (songId: string) => {
    if (currentUser.favoriteSongIds.includes(songId)) {
      setCurrentUser({
        ...currentUser,
        favoriteSongIds: currentUser.favoriteSongIds.filter(
          (id) => id !== songId
        ),
      });
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, favorites: song.favorites - 1 } : song
        )
      );
      showNotification("success", "Song removed from favorites!");
    } else {
      setCurrentUser({
        ...currentUser,
        favoriteSongIds: [...currentUser.favoriteSongIds, songId],
      });
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, favorites: song.favorites + 1 } : song
        )
      );
      showNotification("success", "Song added to favorites!");
    }
  };

  // Handle playing song
  const playSong = (song: SongPost) => {
    setSelectedSong(song);

    // Use browser's Text-to-Speech API
    if ("speechSynthesis" in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(song.lyrics);
      utterance.lang = "en-US";
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    } else {
      showNotification("error", "Text-to-Speech not supported in your browser");
    }
  };

  // Handle stop playing
  const stopPlaying = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transfer local state to actual state before submission
    setNewSong((prev) => ({
      ...prev,
      title: titleInput,
      lyrics: lyricsInput,
      category: categoryInput,
    }));

    // Continue with the existing submission logic
    if (!titleInput || !lyricsInput || !categoryInput) {
      showNotification("error", "Please fill all required fields");
      return;
    }

    const coverImageUrl = newSong.coverImage
      ? URL.createObjectURL(newSong.coverImage)
      : "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800";

    const newSongPost: SongPost = {
      id: Date.now().toString(),
      title: newSong.title,
      lyrics: newSong.lyrics,
      generatedAudioUrl: "",
      coverImageUrl,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      category: newSong.category,
      likes: 0,
      favorites: 0,
    };

    // Add song to the list and user's uploaded songs
    setSongs((prevSongs) => [newSongPost, ...prevSongs]);
    setCurrentUser({
      ...currentUser,
      uploadedSongs: [newSongPost, ...currentUser.uploadedSongs],
    });

    // Reset form
    setNewSong({
      title: "",
      lyrics: "",
      category: categories[0],
      coverImage: null,
    });

    // Show success notification
    showNotification("success", "Song uploaded successfully!");

    // Switch to home section to show the new song
    setActiveSection("home");
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSong({ ...newSong, coverImage: e.target.files[0] });
    }
  };

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.lyrics.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle opening the song modal
  const openSongModal = (song: SongPost) => {
    setModalSong(song);
    setModalOpen(true);
    setCurrentLine(-1);
  };

  // Handle closing the song modal
  const closeSongModal = () => {
    if (isPlaying) {
      stopPlaying();
    }
    setModalOpen(false);
    setTimeout(() => {
      setModalSong(null);
    }, 300); // Wait for animation to complete
  };

  // Handle playing song with synchronized lyrics
  const playSongWithLyrics = (song: SongPost) => {
    // Split lyrics into lines
    const lines = song.lyrics.split("\n");
    setSelectedSong(song);

    // Use browser's Text-to-Speech API
    if ("speechSynthesis" in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      setCurrentLine(0);
      setIsPlaying(true);

      const utterance = new SpeechSynthesisUtterance(song.lyrics);
      utterance.lang = "en-US";
      utterance.rate = 0.9; // Slow down slightly for better sync

      // Set up tracking for each word/boundary
      utterance.onboundary = (event) => {
        // Estimate which line we're on based on character position
        const charIndex = event.charIndex;
        let charCount = 0;
        let lineIndex = 0;

        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > charIndex) {
            lineIndex = i;
            break;
          }
        }

        setCurrentLine(lineIndex);

        // Scroll to current line
        if (lyricRef.current) {
          const lineElements = lyricRef.current.querySelectorAll(".lyric-line");
          if (lineElements[lineIndex]) {
            lineElements[lineIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentLine(-1);
      };

      speechSynthesis.speak(utterance);
    } else {
      showNotification("error", "Text-to-Speech not supported in your browser");
    }
  };

  // SongCard Component - update to open modal when clicked
  const SongCard = ({ song }: { song: SongPost }) => {
    const isLiked = currentUser.likedSongIds.includes(song.id);
    const isFavorited = currentUser.favoriteSongIds.includes(song.id);

    return (
      <div
        className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col ${
          darkMode ? "bg-gray-800" : "bg-white"
        } cursor-pointer`}
        onClick={() => openSongModal(song)}
      >
        <div className="relative">
          <img
            src={song.coverImageUrl || "/next.svg"}
            alt={song.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/next.svg";
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent modal from opening
              playSong(song);
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-gradient-to-r from-purple-600 to-pink-400 text-white p-3 rounded-full hover:brightness-110 transition-all shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{song.title}</h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } mb-3`}
            >
              {song.lyrics.length > 150
                ? song.lyrics.substring(0, 150) + "..."
                : song.lyrics}
            </p>
            <div className="mb-3">
              <span
                className="inline-block text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 
                rounded-full px-2 py-1"
              >
                {song.category}
              </span>
            </div>
          </div>

          <div>
            <SongRatings songId={song.id} />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(song.id);
                  }}
                  className={`flex items-center space-x-1 ${
                    isLiked
                      ? "text-indigo-600 dark:text-indigo-400"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  } hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    ></path>
                  </svg>
                  <span>{song.likes}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(song.id);
                  }}
                  className={`flex items-center space-x-1 ${
                    isFavorited
                      ? "text-pink-500 dark:text-pink-400"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  } hover:text-pink-500 dark:hover:text-pink-400`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isFavorited ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                  <span>{song.favorites}</span>
                </button>
              </div>
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {song.createdBy}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navbar Component
  const Navbar = () => {
    const [navbarVisible, setNavbarVisible] = useState(false);

    useEffect(() => {
      // Trigger navbar animation after a short delay
      const timer = setTimeout(() => {
        setNavbarVisible(true);
      }, 100);

      return () => clearTimeout(timer);
    }, []);

    return (
      <nav
        className={`w-full px-4 py-3 ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        } shadow-md fixed top-0 z-10 border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } ${navbarVisible ? "navbar-animate" : "opacity-0"} hidden md:block`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <svg
                className="w-7 h-7 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                ></path>
              </svg>
              <h1 className="text-xl font-bold">LyricCast</h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
              <button
                onClick={() => setActiveSection("home")}
                className={`px-3 py-2 rounded-md transition-all duration-300 flex items-center text-sm nav-link ${
                  activeSection === "home"
                    ? darkMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                      : "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                    : darkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setActiveSection("upload")}
                className={`px-3 py-2 rounded-md transition-all duration-300 flex items-center text-sm nav-link ${
                  activeSection === "upload"
                    ? darkMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                      : "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                    : darkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={`px-3 py-2 rounded-md transition-all duration-300 flex items-center text-sm nav-link ${
                  activeSection === "profile"
                    ? darkMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                      : "bg-gradient-to-r from-purple-600 to-pink-400 text-white"
                    : darkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center space-x-3">
              {/* Only show search on home section */}
              {activeSection === "home" && (
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-40 px-3 py-2 text-sm rounded-full bg-opacity-20 bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    ></path>
                  </svg>
                )}
              </button>

              <button
                onClick={() => setActiveSection("settings")}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 ${
                  activeSection === "settings"
                    ? "text-purple-600 dark:text-pink-400"
                    : ""
                }`}
                aria-label="Settings"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Home Section
  const HomeSection = () => (
    <section className="container mx-auto px-4 py-4">
      {/* Eye-catching Banner */}
      <div className="w-full rounded-xl mb-12 overflow-hidden relative shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 py-16 px-6 md:py-28 md:px-10 relative">
          {/* Subtle Pattern Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-10 
            background-pattern"
          ></div>

          {/* Decorative Elements - Musical Notes */}
          <div className="absolute opacity-10 top-10 right-10 animate-pulse">
            <svg
              className="w-16 h-16 md:w-24 md:h-24"
              fill="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 17.9c0 1.3-1 2.1-2.1 2.1S4.7 19.2 4.7 17.9s1-2.1 2.1-2.1h.1c.4 0 .8.1 1.1.2v-9c0-.5.4-1 1-1s1 .4 1 1v9.8zm5-.1c0 1.3-1 2.2-2.1 2.2-1.2 0-2.1-.9-2.1-2.2s1-2.2 2.1-2.2h.1c.4 0 .8.1 1.1.3V8c0-.6.4-1 1-1h.1c.5 0 .9.4.9 1v9.8zM19 17c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3h.2c.5 0 1 .1 1.4.3V4c0-.6.4-1 1-1s1 .4 1 1v11.6c.2.4.4.9.4 1.4z" />
            </svg>
          </div>
          <div className="absolute opacity-10 bottom-10 left-10">
            <svg
              className="w-20 h-20 md:w-28 md:h-28"
              fill="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              2025 Summer Music Concert
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-indigo-100 font-medium">
              June 27–30, 2025 • Istanbul, Turkey
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Latest Songs</h2>
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSongs.map((song) => (
            <div key={song.id} className="w-full h-full">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl">No songs found matching your search.</p>
        </div>
      )}
    </section>
  );

  // Upload Section
  const UploadSection = () => (
    <section className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Background gradient for the entire section */}
      <div
        className={`${
          darkMode
            ? "bg-gradient-to-b from-gray-800/50 to-gray-900/30"
            : "bg-gradient-to-b from-indigo-50 to-white"
        } p-8 rounded-3xl`}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Enhanced heading with gradient */}
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
            Upload a New Song
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Share your creativity with the world
          </p>

          {/* Glassmorphism form */}
          <form
            onSubmit={handleSubmit}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-2xl backdrop-blur-lg ${
              darkMode
                ? "bg-gray-800/70 text-white border-gray-700/50"
                : "bg-white/60 text-gray-800 border-white/20"
            } transition-all duration-300 border`}
          >
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-opacity-50 
                  bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  transition-all duration-300 hover:scale-105 hover:shadow-md"
                placeholder="Enter song title"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Lyrics</label>
              <textarea
                value={lyricsInput}
                onChange={(e) => handleInputChange("lyrics", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-opacity-50 
                  bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  transition-all duration-300 hover:scale-105 hover:shadow-md"
                placeholder="Enter your lyrics"
                rows={6}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={categoryInput}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-opacity-50 
                  bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  transition-all duration-300 hover:scale-105 hover:shadow-md"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                Cover Image
              </label>
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 
                    dark:hover:bg-gray-600 focus:outline-none transition-all duration-300 
                    hover:scale-105 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Choose Cover Image
                </button>

                {/* File preview */}
                {newSong.coverImage && (
                  <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="text-sm truncate">
                      {newSong.coverImage.name}
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 
                text-white rounded-xl hover:brightness-110 focus:outline-none 
                focus:ring-2 focus:ring-indigo-500 transition-all duration-300 
                hover:scale-105 flex items-center justify-center font-medium text-lg"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              Upload Song
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  // ProfileSection - hide header on mobile
  const ProfileSection = () => (
    <section className="container mx-auto px-4 py-8">
      {/* Profile Header - Hide on mobile */}
      <div
        className={`rounded-2xl shadow-xl p-6 mb-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } hidden md:block`}
      >
        <div className="flex flex-col md:flex-row items-start">
          {/* Profile Picture Section with Upload */}
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden mb-6 md:mb-0 md:mr-8 flex-shrink-0 border-2 border-purple-500 group cursor-pointer mx-auto md:mx-0"
            onClick={() => !isEditingProfile && setIsEditingProfile(true)}
          >
            <img
              src={
                newProfilePicPreview ||
                currentUser.profilePictureUrl ||
                "/next.svg"
              }
              alt={currentUser.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/next.svg";
              }}
            />

            {/* Overlay for edit mode */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={profilePicInputRef}
              onChange={handleProfilePicChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 w-full md:w-auto">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) =>
                      handleProfileInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-opacity-50 
                      bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 
                      focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={bioInput}
                    onChange={(e) =>
                      handleProfileInputChange("bio", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-opacity-50 
                      bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 
                      focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 
                      text-white rounded-lg hover:brightness-110 transition-all 
                      flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={handleCancelProfileEdit}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                      rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">
                  {currentUser.username}
                </h2>
                {currentUser.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {currentUser.bio}
                  </p>
                )}

                {/* Stats display */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex flex-col items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-bold">
                      {currentUser.uploadedSongs.length}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Posts
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-bold">{currentUser.followers}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-bold">{currentUser.following}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Following
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-bold">{31}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Likes
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>Joined: {currentUser.memberSince}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Profile Button (only visible when not editing) */}
        {!isEditingProfile && (
          <div className="flex justify-center md:justify-end mt-6">
            <button
              onClick={() => {
                setIsEditingProfile(true);
                // Focus the file input to allow immediate upload
                setTimeout(() => profilePicInputRef.current?.click(), 100);
              }}
              className="px-4 py-2 border border-purple-500 text-purple-500 rounded-lg
                hover:bg-purple-500 hover:text-white transition-all flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveProfileTab("posts")}
          className={`px-4 py-2 font-medium ${
            activeProfileTab === "posts"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          My Posts
        </button>
        <button
          onClick={() => setActiveProfileTab("settings")}
          className={`px-4 py-2 font-medium ${
            activeProfileTab === "settings"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          Settings
        </button>
      </div>

      {activeProfileTab === "posts" ? (
        <>
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4">My Uploads</h3>
            {currentUser.uploadedSongs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentUser.uploadedSongs.map((song) => (
                  <div key={song.id} className="w-full h-full">
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="inline-block mb-4">
                  <svg
                    className="w-20 h-20 text-gray-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    ></path>
                  </svg>
                </div>
                <p className="text-xl mb-4">No Songs Uploaded Yet</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start sharing your creative lyrics with the world by uploading
                  your first song
                </p>
                <button
                  onClick={() => setActiveSection("upload")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:brightness-110 transition-all"
                >
                  Upload Your First Song
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">My Favorites</h3>
            {currentUser.favoriteSongIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {songs
                  .filter((song) =>
                    currentUser.favoriteSongIds.includes(song.id)
                  )
                  .map((song) => (
                    <div key={song.id} className="w-full h-full">
                      <SongCard song={song} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="inline-block mb-4">
                  <svg
                    className="w-20 h-20 text-gray-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </div>
                <p className="text-xl mb-4">No Favorites Yet</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Explore songs from other users and add them to your favorites
                </p>
                <button
                  onClick={() => setActiveSection("home")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:brightness-110 transition-all"
                >
                  Browse Songs
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full animate-fadeIn">
          <SettingsCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Account Settings</h3>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                v1.0.2
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Email
              </p>
              <p className="font-medium">{currentUser.email}</p>
            </div>

            <button
              className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
              onClick={() =>
                showNotification(
                  "success",
                  "Password reset link sent to your email!"
                )
              }
            >
              Change Password
            </button>
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-bold text-lg mb-4">Appearance</h3>

            <SettingsSwitch
              label="Dark Mode"
              isChecked={darkMode}
              onChange={toggleDarkMode}
              description="Switch between light and dark themes"
            />
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-bold text-lg mb-4">Notifications</h3>

            <SettingsSwitch
              label="Email Notifications"
              isChecked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              description="Receive updates via email"
            />

            <SettingsSwitch
              label="Push Notifications"
              isChecked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
              description="Get notified directly in your browser"
            />
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-bold text-lg mb-4">Privacy</h3>

            <SettingsSwitch
              label="Public Profile"
              isChecked={publicProfile}
              onChange={() => setPublicProfile(!publicProfile)}
              description="Allow others to see your profile"
            />

            <SettingsSwitch
              label="Show Activity"
              isChecked={showActivity}
              onChange={() => setShowActivity(!showActivity)}
              description="Display your likes and comments to others"
            />
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-bold text-lg mb-4">Data</h3>

            <button
              className="w-full py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-2"
              onClick={() =>
                showNotification(
                  "success",
                  "Your data has been exported and sent to your email!"
                )
              }
            >
              Export My Data
            </button>

            <button
              className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  showNotification(
                    "success",
                    "Your account has been scheduled for deletion."
                  );
                }
              }}
            >
              Delete My Account
            </button>
          </SettingsCard>
        </div>
      )}
    </section>
  );

  // Player Section
  const PlayerSection = () =>
    selectedSong && (
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 shadow-lg ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        } md:bottom-0 bottom-16`} // Add extra bottom padding on mobile
      >
        <div className="container mx-auto flex items-center">
          <div className="relative h-16 w-16 mr-4 flex-shrink-0">
            <img
              src={selectedSong.coverImageUrl || "/next.svg"}
              alt={selectedSong.title}
              className="w-full h-full object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/next.svg";
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{selectedSong.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSong.createdBy}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={isPlaying ? stopPlaying : () => playSong(selectedSong)}
              className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              )}
            </button>
            <button
              onClick={() => setSelectedSong(null)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );

  // Footer Component
  const Footer = () => (
    <footer
      className={`w-full py-8 bg-gradient-to-r from-blue-500 to-pink-500 text-white ${
        selectedSong ? "mb-24" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-4">About LyricCast</h3>
            <p className="text-sm text-white/80">
              Create and share your song lyrics with the world. Generate audio
              and customize your music experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("home")}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("upload")}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Upload Song
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("profile")}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  My Profile
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-white/80">
                <svg
                  className="w-4 h-4 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                support@lyriccast.com
              </li>
              <li className="flex items-center text-sm text-white/80">
                <svg
                  className="w-4 h-4 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-sm text-white/80">
                <svg
                  className="w-4 h-4 mr-2 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                Music Avenue 123, Harmonyville
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white/80">
            LyricCast • 2025 © All rights reserved
          </p>
          <p className="text-xs text-white/60 mt-2">
            Built with React & TailwindCSS
          </p>
        </div>
      </div>
    </footer>
  );

  // Notification Component
  const NotificationToast = () =>
    notification && (
      <div
        className={`fixed top-24 right-4 p-4 rounded-md shadow-lg transition-opacity duration-300 z-50 ${
          notification.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        <div className="flex items-center">
          {notification.type === "success" ? (
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      </div>
    );

  // New handler for profile picture change
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for saving profile changes
  const handleSaveProfile = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (newProfilePicPreview) {
        setCurrentUser({
          ...currentUser,
          profilePictureUrl: newProfilePicPreview,
        });
      }

      setIsEditingProfile(false);
      setIsLoading(false);
      setNewProfilePicPreview(null);

      // Show success notification
      showNotification("success", "Profile updated successfully!");
    }, 1500);
  };

  // Handler for canceling profile edit
  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setNewProfilePicPreview(null);
  };

  // Settings toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  // Settings Tab
  const SettingsCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4 transition-all duration-300 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );

  const SettingsSwitch = ({
    label,
    isChecked,
    onChange,
    description,
  }: {
    label: string;
    isChecked: boolean;
    onChange: () => void;
    description?: string;
  }) => (
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <div
        className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
          isChecked ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
        onClick={onChange}
      >
        <span
          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
            isChecked ? "transform translate-x-6" : ""
          }`}
        />
      </div>
    </div>
  );

  // Song rating handler
  const handleRateSong = (songId: string, rating: number) => {
    setSongRatings({
      ...songRatings,
      [songId]: rating,
    });

    // Show notification
    showNotification("success", `Song rated ${rating}/5 stars!`);
  };

  // Star Rating Component
  const SongRatings = ({ songId }: { songId: string }) => {
    const currentRating = songRatings[songId] || 0;

    return (
      <div className="flex items-center mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
          Rate:
        </span>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRateSong(songId, star)}
              onMouseEnter={() => setShowRatingTooltip(`${songId}-${star}`)}
              onMouseLeave={() => setShowRatingTooltip(null)}
              className="relative"
            >
              <svg
                className={`w-4 h-4 ${
                  star <= currentRating
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Rating tooltip */}
              {showRatingTooltip === `${songId}-${star}` && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  {star}
                </div>
              )}
            </button>
          ))}
        </div>
        {currentRating > 0 && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {currentRating}/5
          </span>
        )}
      </div>
    );
  };

  // Settings Section Component
  const SettingsSection = () => (
    <section className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Customize your app experience
        </p>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl ${
          darkMode ? "bg-gray-900/50" : "bg-gray-50/50"
        } backdrop-blur-sm`}
      >
        <SettingsCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Account Settings</h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              v1.0.2
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Email
            </p>
            <p className="font-medium">{currentUser.email}</p>
          </div>

          <button
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            onClick={() =>
              showNotification(
                "success",
                "Password reset link sent to your email!"
              )
            }
          >
            Change Password
          </button>
        </SettingsCard>

        <SettingsCard>
          <h3 className="font-bold text-lg mb-4">Appearance</h3>

          <SettingsSwitch
            label="Dark Mode"
            isChecked={darkMode}
            onChange={toggleDarkMode}
            description="Switch between light and dark themes"
          />
        </SettingsCard>

        <SettingsCard>
          <h3 className="font-bold text-lg mb-4">Notifications</h3>

          <SettingsSwitch
            label="Email Notifications"
            isChecked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            description="Receive updates via email"
          />

          <SettingsSwitch
            label="Push Notifications"
            isChecked={pushNotifications}
            onChange={() => setPushNotifications(!pushNotifications)}
            description="Get notified directly in your browser"
          />
        </SettingsCard>

        <SettingsCard>
          <h3 className="font-bold text-lg mb-4">Privacy</h3>

          <SettingsSwitch
            label="Public Profile"
            isChecked={publicProfile}
            onChange={() => setPublicProfile(!publicProfile)}
            description="Allow others to see your profile"
          />

          <SettingsSwitch
            label="Show Activity"
            isChecked={showActivity}
            onChange={() => setShowActivity(!showActivity)}
            description="Display your likes and comments to others"
          />
        </SettingsCard>

        <SettingsCard className="md:col-span-2">
          <h3 className="font-bold text-lg mb-4">Data</h3>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              className="flex-1 py-2 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              onClick={() =>
                showNotification(
                  "success",
                  "Your data has been exported and sent to your email!"
                )
              }
            >
              Export My Data
            </button>

            <button
              className="flex-1 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  showNotification(
                    "success",
                    "Your account has been scheduled for deletion."
                  );
                }
              }}
            >
              Delete My Account
            </button>
          </div>
        </SettingsCard>
      </div>
    </section>
  );

  // Song Modal Component
  const SongModal = () => {
    if (!modalSong) return null;

    const lyrics = modalSong.lyrics.split("\n");

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          modalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeSongModal}
        ></div>

        {/* Modal Content */}
        <div
          className={`relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 ${
            modalOpen ? "scale-100" : "scale-95"
          }`}
        >
          {/* Cover Image */}
          <div className="relative w-full h-56 md:h-64 overflow-hidden">
            <img
              src={modalSong.coverImageUrl || "/next.svg"}
              alt={modalSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/next.svg";
              }}
            />

            {/* Close Button */}
            <button
              onClick={closeSongModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Song Details */}
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{modalSong.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {modalSong.createdBy}
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-full">
                  {modalSong.category}
                </span>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={() =>
                  isPlaying ? stopPlaying() : playSongWithLyrics(modalSong)
                }
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-400 text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>

            {/* Lyrics with highlighting */}
            <div
              className="mt-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
              ref={lyricRef}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: darkMode
                  ? "#4B5563 #1F2937"
                  : "#D1D5DB #F3F4F6",
              }}
            >
              <h3 className="text-lg font-medium mb-3">Lyrics</h3>
              <div className="space-y-2 pb-4">
                {lyrics.map((line, index) => (
                  <div
                    key={index}
                    className={`lyric-line py-1 px-2 rounded transition-all duration-200 ${
                      currentLine === index
                        ? "bg-gradient-to-r from-purple-600/20 to-pink-400/20 text-lg font-medium text-purple-800 dark:text-purple-300 transform scale-105 origin-left shadow-sm active-lyric"
                        : "text-base"
                    }`}
                  >
                    {line || " "} {/* Show a space for empty lines */}
                  </div>
                ))}
              </div>
            </div>

            {/* Playback Info */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              {isPlaying ? "Playing..." : "Press play to begin"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Bottom Navigation
  const MobileNavigation = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg mobile-nav z-10">
      <div className="flex justify-around py-2">
        <button
          onClick={() => setActiveSection("home")}
          className="flex flex-col items-center p-2 w-20"
        >
          <div
            className={`p-1 rounded-full ${
              activeSection === "home"
                ? "bg-gradient-to-r from-purple-600 to-pink-400"
                : ""
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                activeSection === "home"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            Home
          </span>
        </button>

        <button
          onClick={() => setActiveSection("upload")}
          className="flex flex-col items-center p-2 w-20"
        >
          <div
            className={`p-1 rounded-full ${
              activeSection === "upload"
                ? "bg-gradient-to-r from-purple-600 to-pink-400"
                : ""
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                activeSection === "upload"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            Upload
          </span>
        </button>

        <button
          onClick={() => setActiveSection("profile")}
          className="flex flex-col items-center p-2 w-20"
        >
          <div
            className={`p-1 rounded-full ${
              activeSection === "profile"
                ? "bg-gradient-to-r from-purple-600 to-pink-400"
                : ""
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                activeSection === "profile"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            Profile
          </span>
        </button>

        <button
          onClick={() => setActiveSection("settings")}
          className="flex flex-col items-center p-2 w-20"
        >
          <div
            className={`p-1 rounded-full ${
              activeSection === "settings"
                ? "bg-gradient-to-r from-purple-600 to-pink-400"
                : ""
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                activeSection === "settings"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            Settings
          </span>
        </button>
      </div>

      {/* Extra space for player if active */}
      {selectedSong && <div className="h-24"></div>}
    </div>
  );

  // Update the return statement to include the SettingsSection
  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Add scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <Navbar />

      <main className="flex-grow pt-20 md:pt-36 pb-16 md:pb-0">
        {activeSection === "home" && <HomeSection />}
        {activeSection === "upload" && <UploadSection />}
        {activeSection === "profile" && <ProfileSection />}
        {activeSection === "settings" && <SettingsSection />}
      </main>

      <PlayerSection />
      <Footer />
      <NotificationToast />
      <SongModal />
      <MobileNavigation />
    </div>
  );
}
