"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  FiCamera,
  FiX,
  FiShare,
  FiClock,
  FiUser,
  FiSun,
  FiMoon,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const schema = {
  commentary:
    "This code generates a photo-sharing page where users can post pictures and see quick emoji reactions from their friends. The page is designed to be bright, cheerful, and phone-friendly.",
  template: "nextjs-developer",
  title: "Photo Feed",
  description:
    "A phone-friendly photo-sharing page with quick emoji reactions.",
  additional_dependencies: [],
  has_additional_dependencies: false,
  install_dependencies_command: "",
  port: 3000,
  file_path: "pages/index.tsx",
};

// TypeScript interfaces
interface Post {
  id: number;
  image: React.ReactNode;
  reactions: Reaction[];
  user: string;
  timestamp: string;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface Language {
  photoFeed: string;
  shareYourMoments: string;
  selectPhoto: string;
  imageTypes: string;
  uploadingPhoto: string;
  sharePhoto: string;
  noPhotosYet: string;
  beFirstToShare: string;
  noReactionsYet: string;
  viewReactions: string;
  hideReactions: string;
  reactionsCount: (count: number) => string;
  selectImageError: string;
  selectPhotoFirst: string;
}

// Language translations
const translations: Record<string, Language> = {
  en: {
    photoFeed: "Photo Feed",
    shareYourMoments: "Share your moments with friends",
    selectPhoto: "Click to select a photo",
    imageTypes: "JPG, PNG or GIF",
    uploadingPhoto: "Uploading...",
    sharePhoto: "Share Photo",
    noPhotosYet: "No photos shared yet",
    beFirstToShare: "Be the first to share!",
    noReactionsYet: "No reactions yet",
    viewReactions: "View reactions",
    hideReactions: "Hide reactions",
    reactionsCount: (count: number) =>
      count === 1 ? "1 reaction" : `${count} reactions`,
    selectImageError: "Please select an image file (JPG, PNG, etc.)",
    selectPhotoFirst: "Please select a photo first",
  },
  tr: {
    photoFeed: "Fotoğraf Akışı",
    shareYourMoments: "Anlarını arkadaşlarınla paylaş",
    selectPhoto: "Fotoğraf seçmek için tıklayın",
    imageTypes: "JPG, PNG veya GIF",
    uploadingPhoto: "Yükleniyor...",
    sharePhoto: "Fotoğraf Paylaş",
    noPhotosYet: "Henüz paylaşılan fotoğraf yok",
    beFirstToShare: "İlk paylaşımı yapan sen ol!",
    noReactionsYet: "Henüz tepki yok",
    viewReactions: "Tepkileri görüntüle",
    hideReactions: "Tepkileri gizle",
    reactionsCount: (count: number) =>
      count === 1 ? "1 tepki" : `${count} tepki`,
    selectImageError: "Lütfen bir resim dosyası seçin (JPG, PNG, vb.)",
    selectPhotoFirst: "Lütfen önce bir fotoğraf seçin",
  },
};

const reactionEmojis: string[] = ["👍", "❤️", "😂", "🤔", "😢"];

// Enhanced color palette
const colors = {
  primary: "#4F46E5", // Indigo-600
  secondary: "#7C3AED", // Violet-600
  accent: "#EC4899", // Pink-500
  light: {
    background: "#F9FAFB", // Gray-50
    card: "#FFFFFF", // White
    text: "#1F2937", // Gray-800
    border: "#E5E7EB", // Gray-200
    input: "#F3F4F6", // Gray-100
  },
  dark: {
    background: "#111827", // Gray-900
    card: "#1F2937", // Gray-800
    text: "#F9FAFB", // Gray-50
    border: "#374151", // Gray-700
    input: "#374151", // Gray-700
  },
  success: "#10B981", // Emerald-500
  warning: "#F59E0B", // Amber-500
  error: "#EF4444", // Red-500
};

const PhotoSharingPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("en");
  const [expandedReactions, setExpandedReactions] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current language translations
  const t = translations[language];

  // Check system preference for dark mode
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Load initial data
  useEffect(() => {
    setPosts([
      {
        id: 1,
        image: (
          <div
            className="w-full h-64 md:h-80 bg-cover bg-center rounded-xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')",
            }}
            role="img"
            aria-label="Mountain valley with river"
          ></div>
        ),
        reactions: [
          { emoji: "👍", users: ["Jamie", "Taylor"] },
          { emoji: "❤️", users: ["Alex"] },
        ],
        user: "Alex",
        timestamp: "10 mins ago",
      },
      {
        id: 2,
        image: (
          <div
            className="w-full h-64 md:h-80 bg-cover bg-center rounded-xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=900&q=80')",
            }}
            role="img"
            aria-label="Sunlight through forest trees"
          ></div>
        ),
        reactions: [
          { emoji: "😂", users: ["Jordan"] },
          { emoji: "🤔", users: ["Morgan", "Casey"] },
        ],
        user: "Sarah",
        timestamp: "25 mins ago",
      },
    ]);
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    setErrorMessage("");

    if (!file) return;

    if (file.type.substring(0, 5) === "image") {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    } else {
      setSelectedImage(null);
      setPreviewUrl("");
      setErrorMessage(t.selectImageError);
    }
  };

  // Handle upload button click
  const handleUploadClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add/remove reaction
  const handleReaction = (postId: number, emoji: string): void => {
    setPosts(
      posts.map((post) => {
        if (post.id !== postId) return post;

        const existingReactionIndex = post.reactions.findIndex(
          (r) => r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          // Check if current user already reacted
          const reactionUsers = [
            ...post.reactions[existingReactionIndex].users,
          ];
          const userIndex = reactionUsers.indexOf("You");

          if (userIndex > -1) {
            // Remove user from this reaction
            reactionUsers.splice(userIndex, 1);

            const updatedReactions = [...post.reactions];

            if (reactionUsers.length === 0) {
              // Remove the entire reaction if no users left
              updatedReactions.splice(existingReactionIndex, 1);
            } else {
              // Update users for this reaction
              updatedReactions[existingReactionIndex] = {
                emoji,
                users: reactionUsers,
              };
            }

            return {
              ...post,
              reactions: updatedReactions,
            };
          } else {
            // Add user to existing reaction
            const updatedReactions = [...post.reactions];
            updatedReactions[existingReactionIndex] = {
              emoji,
              users: [...reactionUsers, "You"],
            };

            return {
              ...post,
              reactions: updatedReactions,
            };
          }
        } else {
          // Create new reaction
          return {
            ...post,
            reactions: [...post.reactions, { emoji, users: ["You"] }],
          };
        }
      })
    );
  };

  // Share new post
  const addNewPost = (): void => {
    if (!selectedImage) {
      setErrorMessage(t.selectPhotoFirst);
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    // Upload simulation
    setTimeout(() => {
      setPosts((prevPosts) => [
        {
          id: Date.now(),
          image: (
            <div
              className="w-full h-64 md:h-80 bg-cover bg-center rounded-xl"
              style={{ backgroundImage: `url('${previewUrl}')` }}
              role="img"
              aria-label="User uploaded image"
            ></div>
          ),
          reactions: [],
          user: "You",
          timestamp: "Just now",
        },
        ...prevPosts,
      ]);

      // Cleanup after upload
      setIsUploading(false);
      setSelectedImage(null);
      setPreviewUrl("");
    }, 1500);
  };

  // Get total reaction count for a post
  const getTotalReactionCount = (reactions: Reaction[]): number => {
    return reactions.reduce((acc, curr) => acc + curr.users.length, 0);
  };

  // Toggle reaction details view
  const toggleReactionDetails = (postId: number) => {
    setExpandedReactions(expandedReactions === postId ? null : postId);
  };

  return (
    <>
      <Head>
        <title>{t.photoFeed}</title>
        <meta name="description" content={t.shareYourMoments} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 to-indigo-900"
            : "bg-gradient-to-br from-indigo-50 to-purple-100"
        } py-6 px-4 sm:py-8`}
      >
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-5 sm:p-6 rounded-2xl shadow-xl transition-colors duration-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div className="flex justify-between items-center mb-2">
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  darkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t.photoFeed}
              </h1>

              <div className="flex items-center space-x-2">
                {/* Language selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-sm rounded-lg p-2 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-indigo-500"
                      : "bg-gray-100 text-gray-800 border-gray-200 focus:ring-indigo-600"
                  } border focus:ring-2 outline-none`}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                </select>

                {/* Theme toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-gray-100 text-indigo-800 hover:bg-gray-200"
                  } transition-colors`}
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <p
              className={`text-center ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } mb-6 text-sm`}
            >
              {t.shareYourMoments}
            </p>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              aria-label="Upload photo"
            />

            {/* Error message display */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-4 p-3 ${
                  darkMode
                    ? "bg-red-900/30 border-l-4 border-red-600 text-red-300"
                    : "bg-red-50 border-l-4 border-red-500 text-red-600"
                } rounded-lg text-sm`}
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Photo selection or preview area */}
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-4 rounded-xl overflow-hidden border-2 shadow-md ${
                  darkMode ? "border-indigo-700" : "border-indigo-200"
                }`}
              >
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Photo preview"
                    className="w-full h-64 sm:h-72 object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl("");
                    }}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-100 transition-all"
                    aria-label="Remove selected photo"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadClick}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleUploadClick();
                  }
                }}
                className={`mb-4 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-44 sm:h-48 cursor-pointer transition-all ${
                  darkMode
                    ? "border-indigo-600 bg-indigo-900/30 hover:bg-indigo-900/50"
                    : "border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                }`}
                role="button"
                tabIndex={0}
                aria-label="Select a photo"
              >
                <FiCamera
                  className={`h-12 w-12 mb-2 ${
                    darkMode ? "text-indigo-400" : "text-indigo-500"
                  }`}
                />
                <p
                  className={`font-medium text-center ${
                    darkMode ? "text-indigo-300" : "text-indigo-600"
                  }`}
                >
                  {t.selectPhoto}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-indigo-400" : "text-indigo-400"
                  }`}
                >
                  {t.imageTypes}
                </p>
              </motion.div>
            )}

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl mb-6 transition-all duration-300 flex items-center justify-center shadow-md ${
                !selectedImage && !isUploading
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              onClick={addNewPost}
              disabled={!selectedImage || isUploading}
              aria-label="Share photo"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  {t.uploadingPhoto}
                </span>
              ) : (
                <span className="flex items-center">
                  <FiShare className="mr-2" /> {t.sharePhoto}
                </span>
              )}
            </motion.button>

            {/* Photo list */}
            {posts.length === 0 ? (
              <div
                className={`text-center py-10 ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                <p>{t.noPhotosYet}</p>
                <p className="text-sm mt-2">{t.beFirstToShare}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={post.id}
                    className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-2 ${
                          darkMode
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                            : "bg-gradient-to-r from-indigo-500 to-violet-500"
                        }`}
                      >
                        {post.user.charAt(0)}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {post.user}
                        </p>
                        <p className="text-gray-400 text-xs flex items-center">
                          <FiClock className="mr-1 h-3 w-3" /> {post.timestamp}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="rounded-xl overflow-hidden mb-3 shadow-md"
                    >
                      {post.image}
                    </motion.div>

                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                      {reactionEmojis.map((emoji) => {
                        const hasReacted = post.reactions.some(
                          (r) => r.emoji === emoji && r.users.includes("You")
                        );

                        return (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            key={emoji}
                            className={`p-2 rounded-full transition-all duration-200 ${
                              hasReacted
                                ? darkMode
                                  ? "bg-indigo-800 shadow-sm"
                                  : "bg-indigo-100 shadow-sm"
                                : darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleReaction(post.id, emoji)}
                            aria-label={`${emoji} reaction`}
                          >
                            <span className="text-lg">{emoji}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {post.reactions.length > 0 && (
                      <div
                        className={`mt-3 rounded-lg p-3 ${
                          darkMode
                            ? "bg-gray-900/50 border border-gray-700"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleReactionDetails(post.id)}
                        >
                          <div className="flex items-center">
                            <div className="flex">
                              {post.reactions
                                .slice(0, 3)
                                .map((reaction, index) => (
                                  <span key={index} className="text-lg mr-1">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              {post.reactions.length > 3 && <span>...</span>}
                            </div>
                            <span
                              className={`ml-2 text-xs ${
                                darkMode ? "text-gray-300" : "text-gray-500"
                              }`}
                            >
                              {t.reactionsCount(
                                getTotalReactionCount(post.reactions)
                              )}
                            </span>
                          </div>
                          <div
                            className={`flex items-center text-xs font-medium ${
                              darkMode ? "text-indigo-300" : "text-indigo-600"
                            }`}
                          >
                            {expandedReactions === post.id ? (
                              <span className="flex items-center">
                                {t.hideReactions}{" "}
                                <FiChevronUp className="ml-1" />
                              </span>
                            ) : (
                              <span className="flex items-center">
                                {t.viewReactions}{" "}
                                <FiChevronDown className="ml-1" />
                              </span>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedReactions === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div
                                className={`mt-3 pt-3 border-t ${
                                  darkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                                }`}
                              >
                                {post.reactions.map((reaction, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start mb-2 last:mb-0"
                                  >
                                    <div className="text-xl mr-3">
                                      {reaction.emoji}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {reaction.users.map((user, userIndex) => (
                                        <span
                                          key={userIndex}
                                          className={`text-xs py-1 px-2 rounded-full ${
                                            user === "You"
                                              ? darkMode
                                                ? "bg-indigo-900 text-indigo-200"
                                                : "bg-indigo-100 text-indigo-800"
                                              : darkMode
                                              ? "bg-gray-700 text-gray-200"
                                              : "bg-gray-200 text-gray-800"
                                          }`}
                                        >
                                          {user}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {post.reactions.length === 0 && (
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-400"
                        } mt-2`}
                      >
                        {t.noReactionsYet}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PhotoSharingPage;
