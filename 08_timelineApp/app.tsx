"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";

// Add inline Tailwind configuration for dark mode
// This ensures dark mode works with the Tailwind CDN
if (typeof window !== "undefined") {
  // @ts-expect-error - Window.tailwind property doesn't exist in the TypeScript types
  window.tailwind = window.tailwind || {};
  // @ts-expect-error - Window.tailwind.config property doesn't exist in the TypeScript types
  window.tailwind.config = {
    darkMode: "class",
  };
}

// Toast notification interfaces
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

// Define interfaces for our data types
interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

interface CurrentUser extends User {
  coverImage: string;
  bio: string;
  location: string;
  birthdate: string;
  joinDate: string;
  following: number;
  followers: number;
  website?: string;
}

interface Hashtag {
  id: string;
  name: string;
}

interface Post {
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  user: User;
  hashtags: Hashtag[];
  isLiked?: boolean;
  isCommented?: boolean;
  isShared?: boolean;
  isMuted?: boolean;
}

// Mock data for demonstration
// Mock current user data
const mockCurrentUser: CurrentUser = {
  id: "1",
  name: "Jane Doe",
  avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  username: "janedoe",
  coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
  bio: "UX designer, coffee enthusiast, and tech lover. Building the future one pixel at a time.",
  location: "San Francisco, CA",
  birthdate: "May 15, 1992",
  joinDate: "January 2020",
  following: 243,
  followers: 892,
  website: "https://janedoe.design",
};

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    username: "janedoe",
  },
  {
    id: "2",
    name: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    username: "johnsmith",
  },
  {
    id: "3",
    name: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    username: "alexj",
  },
  {
    id: "4",
    name: "Sam Wilson",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    username: "samw",
  },
  {
    id: "5",
    name: "Emily Parker",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    username: "emilyp",
  },
];

const mockHashtags: Hashtag[] = [
  { id: "1", name: "tech" },
  { id: "2", name: "programming" },
  { id: "3", name: "design" },
  { id: "4", name: "webdev" },
  { id: "5", name: "ux" },
  { id: "6", name: "ai" },
  { id: "7", name: "innovation" },
  { id: "8", name: "nextjs" },
  { id: "9", name: "tailwind" },
  { id: "10", name: "claymorphism" },
];

const sampleContents = [
  "Just discovered a great new framework for web development! What are your favorite tools these days?",
  "Working on a new design system for our product. Claymorphism is definitely the way to go in 2023!",
  "AI is transforming the way we build products. Have you tried integrating AI into your workflow yet?",
  "The future of tech is all about innovation and sustainability. Let's build solutions that last.",
  "UX is not just about how it looks, but how it works. What's your UX philosophy?",
  "Remote work has changed everything for tech teams. How is your company adapting?",
  "Just launched our new platform after months of hard work! Check it out and let me know what you think.",
  "Learning new frameworks and libraries every day. The tech world never stops evolving.",
];

const generateMockPosts = (): Post[] => {
  const posts: Post[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const randomHashtagCount = Math.floor(Math.random() * 3) + 1;
    const randomHashtags: Hashtag[] = [];
    const randomContentIndex = Math.floor(
      Math.random() * sampleContents.length
    );

    while (randomHashtags.length < randomHashtagCount) {
      const randomHashtag =
        mockHashtags[Math.floor(Math.random() * mockHashtags.length)];
      if (!randomHashtags.find((h) => h.id === randomHashtag.id)) {
        randomHashtags.push(randomHashtag);
      }
    }

    posts.push({
      id: `post-${i}`,
      content: sampleContents[randomContentIndex],
      timestamp: new Date(
        now.getTime() -
          Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000 -
          Math.floor(Math.random() * 24) * 60 * 60 * 1000
      ),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20),
      user: randomUser,
      hashtags: randomHashtags,
      isLiked: false,
      isCommented: false,
      isShared: false,
    });
  }

  return posts;
};

type SortOption = "latest" | "popular" | "personalized";
type ProfileTabOption = "posts" | "likes" | "shares";

// Toast component for notifications
const Toast = ({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) => {
  const { id, message, type } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  let bgColor = "bg-teal-500";
  const textColor = "text-white";
  let icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  if (type === "error") {
    bgColor = "bg-red-500";
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (type === "info") {
    bgColor = "bg-blue-500";
    icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <div
      className={`flex items-center p-4 mb-3 rounded-lg shadow-lg ${bgColor} ${textColor} opacity-95 transform transition-all duration-300 ease-out`}
      style={{
        borderRadius: "12px",
        boxShadow:
          "6px 6px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex-shrink-0 mr-3">{icon}</div>
      <div className="flex-grow">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

// ToastContainer component for managing multiple toasts
const ToastContainer = ({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) => {
  return (
    <div className="fixed top-5 right-5 z-[100] w-80">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Reusable PostCard component
const PostCard = ({
  post,
  handleLikePost,
  handleCommentPost,
  handleSharePost,
  followedHashtags,
  mutedHashtags,
  handleFollowHashtag,
  handleMuteHashtag,
  activeDropdown,
  toggleDropdown,
  formatTimestamp,
  // New props for post options dropdown
  activePostMenu,
  togglePostMenu,
  handleMutePost,
  handleMuteUser,
  handleFollowUser,
  handleBlockUser,
  handleReportPost,
  handleViewEngagement,
  followedUsers,
  mutedUsers,
  blockedUsers,
  // Post editing props
  editingPostId,
  editPostContent,
  handleEditPost,
  handleDeletePost,
  handleSavePostEdit,
  handleCancelPostEdit,
  setEditPostContent,
  currentUserId = "1", // Default to user ID 1
}: {
  post: Post;
  handleLikePost: (postId: string) => void;
  handleCommentPost: (postId: string) => void;
  handleSharePost: (postId: string) => void;
  followedHashtags: string[];
  mutedHashtags: string[];
  handleFollowHashtag: (hashtagId: string, e: React.MouseEvent) => void;
  handleMuteHashtag: (hashtagId: string, e: React.MouseEvent) => void;
  activeDropdown: string | null;
  toggleDropdown: (hashtagId: string, e: React.MouseEvent) => void;
  formatTimestamp: (date: Date | string) => string;
  // Post options dropdown props
  activePostMenu: string | null;
  togglePostMenu: (postId: string, e: React.MouseEvent) => void;
  handleMutePost: (postId: string, e: React.MouseEvent) => void;
  handleMuteUser: (userId: string, e: React.MouseEvent) => void;
  handleFollowUser: (userId: string, e: React.MouseEvent) => void;
  handleBlockUser: (userId: string, e: React.MouseEvent) => void;
  handleReportPost: (postId: string, e: React.MouseEvent) => void;
  handleViewEngagement: (post: Post, e: React.MouseEvent) => void;
  followedUsers: string[];
  mutedUsers: string[];
  blockedUsers: string[];
  // Post editing props
  editingPostId: string | null;
  editPostContent: string;
  handleEditPost: (postId: string, e: React.MouseEvent) => void;
  handleDeletePost: (postId: string, e: React.MouseEvent) => void;
  handleSavePostEdit: (postId: string) => void;
  handleCancelPostEdit: () => void;
  setEditPostContent: React.Dispatch<React.SetStateAction<string>>;
  currentUserId?: string; // Optional so we can use default value
}) => {
  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 p-6 md:p-8 transition-colors duration-300 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.05),_-12px_-12px_24px_rgba(255,255,255,0.9)] dark:hover:shadow-xl"
      style={{
        borderRadius: "30px",
        boxShadow:
          "8px 8px 16px rgba(0,0,0,0.05), -8px -8px 16px rgba(255,255,255,0.8)",
        border: "3px solid rgba(255,255,255,0.7)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div
            className="p-1.5 rounded-full"
            style={{
              background: "linear-gradient(145deg, #ffffff, #e6e6e6)",
              boxShadow:
                "4px 4px 8px rgba(0,0,0,0.05), -4px -4px 8px rgba(255,255,255,0.9)",
            }}
          >
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-16 h-16 rounded-full border-2 border-teal-100"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-center md:text-left">
              <h2 className="font-bold text-xl text-gray-800 dark:text-white">
                {post.user.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-200 text-sm">
                @{post.user.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="mt-2 md:mt-0 text-center md:text-right px-3 py-1 rounded-full text-gray-500 dark:text-gray-100 text-sm"
                style={{
                  background:
                    "var(--tw-prose-background, linear-gradient(145deg, #f3f9ff, #e6f0f5))",
                  boxShadow:
                    "var(--tw-prose-shadow, inset 2px 2px 5px rgba(0,0,0,0.03), inset -2px -2px 5px rgba(255,255,255,0.8))",
                }}
              >
                {formatTimestamp(post.timestamp)}
              </div>

              {/* Post Options Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={(e) => togglePostMenu(post.id, e)}
                  className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-teal-50 transition-all duration-300"
                  aria-label="Post options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Post Options Dropdown Menu */}
                {activePostMenu === post.id && (
                  <div
                    className="absolute top-full right-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
                    style={{
                      borderRadius: "16px",
                      boxShadow:
                        "6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)",
                      border: "2px solid rgba(255,255,255,0.7)",
                      width: "200px",
                    }}
                  >
                    {/* Show different options based on whether the post belongs to the current user */}
                    {post.user.id === currentUserId ? (
                      /* Options for own posts - clean text-only UI */
                      <>
                        {/* Edit Post Option */}
                        <button
                          onClick={(e) => handleEditPost(post.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-teal-50 text-gray-700 w-full text-left font-medium"
                        >
                          Edit Post
                        </button>

                        {/* Delete Post Option */}
                        <button
                          onClick={(e) => handleDeletePost(post.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-red-50 text-gray-700 w-full text-left font-medium"
                        >
                          Delete Post
                        </button>

                        {/* View Engagement Option */}
                        <button
                          onClick={(e) => handleViewEngagement(post, e)}
                          className="px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-100 w-full text-left font-medium"
                        >
                          View Engagement
                        </button>

                        {/* Continue Reading Option - Only show for posts with content longer than 300 chars */}
                        {post.content.length > 300 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(post.content); // Simple implementation - in a real app this would expand the post
                              togglePostMenu(post.id, e); // Close the menu
                            }}
                            className="px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 w-full text-left font-medium"
                          >
                            Continue Reading
                          </button>
                        )}
                      </>
                    ) : (
                      /* Options for other users' posts */
                      <>
                        <button
                          onClick={(e) => handleMutePost(post.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-red-50 text-gray-700 w-full text-left flex items-center"
                        >
                          {post.isMuted ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-teal-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Unmute Post</span>
                            </>
                          ) : (
                            <span>Mute Post</span>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleMuteUser(post.user.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-red-50 text-gray-700 w-full text-left flex items-center"
                        >
                          {mutedUsers.includes(post.user.id) ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-teal-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Unmute User</span>
                            </>
                          ) : (
                            <span>Mute User</span>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleFollowUser(post.user.id, e)}
                          className={`px-4 py-2.5 text-sm w-full text-left flex items-center ${
                            followedUsers.includes(post.user.id)
                              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                              : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                          }`}
                        >
                          {followedUsers.includes(post.user.id) ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-teal-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Unfollow User</span>
                            </>
                          ) : (
                            <span>Follow User</span>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleBlockUser(post.user.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 w-full text-left flex items-center"
                        >
                          {blockedUsers.includes(post.user.id) ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-red-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Unblock User</span>
                            </>
                          ) : (
                            <span>Block User</span>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleReportPost(post.id, e)}
                          className="px-4 py-2.5 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 w-full text-left"
                        >
                          Report Post
                        </button>
                        <button
                          onClick={(e) => handleViewEngagement(post, e)}
                          className="px-4 py-2.5 text-sm hover:bg-blue-50 text-blue-600 w-full text-left"
                        >
                          View Engagement
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Show edit form if this post is being edited */}
          {editingPostId === post.id ? (
            <div className="mt-4">
              <textarea
                className="w-full p-3 border border-teal-200 rounded-xl text-gray-700 text-lg leading-relaxed"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={4}
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                  borderRadius: "16px",
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelPostEdit}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePostEdit(post.id)}
                  className="px-4 py-2 text-sm text-white bg-teal-500 rounded-lg hover:bg-teal-600"
                  disabled={!editPostContent.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-700 dark:text-gray-100 text-lg leading-relaxed">
              {post.content}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags.map((hashtag) => (
              <div key={hashtag.id} className="relative">
                <div
                  onClick={(e) => toggleDropdown(hashtag.id, e)}
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                    followedHashtags.includes(hashtag.id)
                      ? "bg-teal-500 text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"
                      : mutedHashtags.includes(hashtag.id)
                      ? "bg-gray-200 text-gray-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]"
                      : "bg-teal-100 text-teal-700 hover:bg-teal-200 shadow-[2px_2px_4px_rgba(0,0,0,0.05),_-2px_-2px_4px_rgba(255,255,255,0.9)]"
                  }`}
                  style={{ borderRadius: "18px" }}
                >
                  #{hashtag.name}
                </div>
                {activeDropdown === hashtag.id && (
                  <div
                    className="absolute top-full left-0 mt-2 z-10 bg-white rounded-xl overflow-hidden"
                    style={{
                      borderRadius: "16px",
                      boxShadow:
                        "6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)",
                      border: "2px solid rgba(255,255,255,0.7)",
                    }}
                  >
                    <button
                      onClick={(e) => handleFollowHashtag(hashtag.id, e)}
                      className="px-4 py-2.5 text-sm hover:bg-teal-50 text-teal-700 w-full text-left font-medium"
                    >
                      {followedHashtags.includes(hashtag.id)
                        ? "✓ Following"
                        : "Follow"}
                    </button>
                    <button
                      onClick={(e) => handleMuteHashtag(hashtag.id, e)}
                      className="px-4 py-2.5 text-sm hover:bg-red-50 text-gray-700 w-full text-left font-medium"
                    >
                      {mutedHashtags.includes(hashtag.id) ? "✓ Muted" : "Mute"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-8 text-gray-500 justify-center md:justify-start">
            <button
              onClick={() => handleLikePost(post.id)}
              className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                post.isLiked
                  ? "text-red-500 bg-red-50"
                  : "hover:text-teal-600 hover:bg-teal-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.likes}</span>
            </button>
            <button
              onClick={() => handleCommentPost(post.id)}
              className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                post.isCommented
                  ? "text-blue-500 bg-blue-50"
                  : "hover:text-teal-600 hover:bg-teal-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.comments}</span>
            </button>
            <button
              onClick={() => handleSharePost(post.id)}
              className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                post.isShared
                  ? "text-green-500 bg-green-50"
                  : "hover:text-teal-600 hover:bg-teal-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile component
const Profile = ({
  currentUser: initialUser,
  posts,
  handleLikePost,
  handleCommentPost,
  handleSharePost,
  followedHashtags,
  mutedHashtags,
  handleFollowHashtag,
  handleMuteHashtag,
  activeDropdown,
  toggleDropdown,
  formatTimestamp,
  handleCreatePost,
  onTabChange,
}: {
  currentUser: CurrentUser;
  posts: Post[];
  handleLikePost: (postId: string) => void;
  handleCommentPost: (postId: string) => void;
  handleSharePost: (postId: string) => void;
  followedHashtags: string[];
  mutedHashtags: string[];
  handleFollowHashtag: (hashtagId: string, e: React.MouseEvent) => void;
  handleMuteHashtag: (hashtagId: string, e: React.MouseEvent) => void;
  activeDropdown: string | null;
  toggleDropdown: (hashtagId: string, e: React.MouseEvent) => void;
  formatTimestamp: (date: Date) => string;
  handleCreatePost?: (post: Post) => void;
  onTabChange?: (tab: string) => void;
  // Post editing props needed for PostCard
  editingPostId?: string | null;
  editPostContent?: string;
  handleEditPost?: (postId: string, e: React.MouseEvent) => void;
  handleDeletePost?: (postId: string, e: React.MouseEvent) => void;
  handleSavePostEdit?: (postId: string) => void;
  handleCancelPostEdit?: () => void;
  setEditPostContent?: React.Dispatch<React.SetStateAction<string>>;
  activePostMenu?: string | null;
  togglePostMenu?: (postId: string, e: React.MouseEvent) => void;
  handleMutePost?: (postId: string, e: React.MouseEvent) => void;
  handleMuteUser?: (userId: string, e: React.MouseEvent) => void;
  handleFollowUser?: (userId: string, e: React.MouseEvent) => void;
  handleBlockUser?: (userId: string, e: React.MouseEvent) => void;
  handleReportPost?: (postId: string, e: React.MouseEvent) => void;
  handleViewEngagement?: (post: Post, e: React.MouseEvent) => void;
  followedUsers?: string[];
}) => {
  // Get saved user data from localStorage if available
  const [currentUser, setCurrentUser] = useState<CurrentUser>(initialUser);
  const [profileTab, setProfileTab] = useState<ProfileTabOption>("posts");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [tempCover, setTempCover] = useState<string | null>(null);

  // Local state for post menu (to avoid dependency on the prop which might be undefined)
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);

  // Reset edited user when current user changes
  useEffect(() => {
    setEditedUser(currentUser);
  }, [currentUser]);

  // State for new post creation
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostHashtags, setNewPostHashtags] = useState("");

  // Create a new post
  const createPost = () => {
    if (newPostContent.trim() === "") return;

    // Parse hashtags
    const hashtags: Hashtag[] = [];
    const hashtagMatches = newPostHashtags.match(/#[\w]+/g) || [];

    hashtagMatches.forEach((tag, index) => {
      hashtags.push({
        id: `new-${Date.now()}-${index}`,
        name: tag.substring(1), // Remove the # symbol
      });
    });

    // Create new post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content: newPostContent,
      timestamp: new Date(), // Store as Date object
      likes: 0,
      comments: 0,
      shares: 0,
      user: currentUser,
      hashtags,
      isLiked: false,
      isCommented: false,
      isShared: false,
    };

    // Add post to local storage and state
    const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]");
    savedPosts.unshift(newPost);
    localStorage.setItem("userPosts", JSON.stringify(savedPosts));

    // Update posts state in parent component if the handler exists
    if (handleCreatePost) {
      handleCreatePost(newPost);
    }

    // Clear form
    setNewPostContent("");
    setNewPostHashtags("");
  };

  // Filter posts based on the selected tab
  const filteredPosts = React.useMemo(() => {
    switch (profileTab) {
      case "posts":
        return posts.filter((post) => post.user.id === currentUser.id);
      case "likes":
        return posts.filter((post) => post.isLiked);
      case "shares":
        return posts.filter((post) => post.isShared);
      default:
        return [];
    }
  }, [posts, profileTab, currentUser.id]);

  // Handle file input for avatar and cover image
  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === "avatar") {
          setTempAvatar(result);
          setEditedUser({ ...editedUser, avatar: result });
        } else {
          setTempCover(result);
          setEditedUser({ ...editedUser, coverImage: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  // Save profile changes
  const saveProfileChanges = () => {
    // Save profile changes to localStorage
    localStorage.setItem("currentUser", JSON.stringify(editedUser));

    // Update the current user with edited data
    setCurrentUser(editedUser);

    // Update user info in all posts by this user
    try {
      // Update posts in localStorage
      const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]");
      const updatedPosts = savedPosts.map((post: Post) => {
        if (post.user.id === editedUser.id) {
          return {
            ...post,
            user: {
              id: editedUser.id,
              name: editedUser.name,
              username: editedUser.username,
              avatar: editedUser.avatar,
            },
          };
        }
        return post;
      });
      localStorage.setItem("userPosts", JSON.stringify(updatedPosts));

      // If handleCreatePost callback exists, use it to update the global posts state
      if (handleCreatePost) {
        // We're reusing handleCreatePost as a way to signal to the parent to refresh posts
        // In a real app, we would have a dedicated updatePosts callback
        handleCreatePost({ ...updatedPosts[0], timestamp: new Date() });
      }

      // Profile was updated successfully - the changes will reflect in all posts
      // In a real app, we would use a proper state management solution like Redux
      // or React Context, but for this demo we'll use a simpler approach

      // Add a simple toast directly if the onTabChange exists (indicating we're in an App)
      if (onTabChange) {
        // Create a temporary toast element to show the notification
        const toastId = `profile-update-${Date.now()}`;
        const tempToast = document.createElement("div");
        tempToast.id = toastId;
        tempToast.className =
          "fixed top-5 right-5 z-[100] bg-teal-500 text-white px-4 py-3 rounded-lg shadow-lg";
        tempToast.innerHTML = "Profile updated successfully!";
        document.body.appendChild(tempToast);

        // Remove the toast after 3 seconds
        setTimeout(() => {
          const toastElement = document.getElementById(toastId);
          if (toastElement) {
            toastElement.classList.add(
              "opacity-0",
              "transition-opacity",
              "duration-500"
            );
            setTimeout(() => toastElement.remove(), 500);
          }
        }, 3000);
      }
    } catch (e) {
      console.error("Failed to update user info in posts:", e);
    }

    // Exit edit mode
    setIsEditMode(false);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditedUser(currentUser); // Reset to current user data
    setTempAvatar(null);
    setTempCover(null);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      {/* Cover Banner with Profile Avatar */}
      <div className="relative rounded-2xl overflow-visible mb-24 md:mb-20 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div className="w-full h-48 md:h-64 relative">
          <img
            src={
              isEditMode
                ? tempCover || editedUser.coverImage
                : currentUser.coverImage
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isEditMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <label className="cursor-pointer bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, "cover")}
                />
              </label>
            </div>
          )}
        </div>

        {/* Profile Avatar - Elevated positioning */}
        <div className="absolute left-6 md:left-8 transform -translate-y-1/2 z-20">
          <div className="p-2 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <div className="relative overflow-hidden rounded-full border-4 border-white ring-4 ring-white/30">
              <img
                src={
                  isEditMode
                    ? tempAvatar || editedUser.avatar
                    : currentUser.avatar
                }
                alt={currentUser.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
              />
              {isEditMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity hover:bg-opacity-50">
                  <label className="cursor-pointer bg-white rounded-full p-3 shadow-lg hover:scale-105 transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileInput(e, "avatar")}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      {!isEditMode ? (
        <div className="mb-8 pl-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentUser.name}
              </h1>
              <p className="text-gray-500">@{currentUser.username}</p>
            </div>
            <button
              onClick={() => setIsEditMode(true)}
              className="px-6 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <p className="mt-4 text-gray-700">
            {currentUser.bio}
            {currentUser.website && (
              <a
                href={currentUser.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-teal-600 hover:underline"
              >
                {currentUser.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{currentUser.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Born {currentUser.birthdate}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Joined {currentUser.joinDate}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="font-medium">
              <span className="text-gray-900">{currentUser.following}</span>{" "}
              <span className="text-gray-500">Following</span>
            </div>
            <div className="font-medium">
              <span className="text-gray-900">{currentUser.followers}</span>{" "}
              <span className="text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.05),_-4px_-4px_10px_rgba(255,255,255,0.8)]">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={editedUser.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editedUser.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={editedUser.website || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="text"
                name="birthdate"
                value={editedUser.birthdate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfileChanges}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {(["posts", "likes", "shares"] as ProfileTabOption[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                profileTab === tab
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-teal-500 hover:border-teal-300"
              } transition-colors duration-200`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* New Post Creation Area (only shown on user's own profile) */}
      {profileTab === "posts" && currentUser.id === "1" && !isEditMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-xl mb-6 transition-colors duration-300">
          <div className="flex items-start space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-grow">
              <textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none min-h-[100px]"
              />
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Add hashtags (e.g., #tech #design)"
                  value={newPostHashtags}
                  onChange={(e) => setNewPostHashtags(e.target.value)}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-100 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={createPost}
                  disabled={newPostContent.trim() === ""}
                  className={`px-5 py-2 rounded-full font-medium transition-all ${
                    newPostContent.trim() === ""
                      ? "bg-gray-200 text-gray-400"
                      : "bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Feed */}
      <div className="space-y-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            // In the Profile view, use a simplified version of the PostCard without all the post options
            <div
              key={post.id}
              className="bg-white p-6 md:p-8 transition-all duration-300 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.05),_-12px_-12px_24px_rgba(255,255,255,0.9)]"
              style={{
                borderRadius: "30px",
                boxShadow:
                  "8px 8px 16px rgba(0,0,0,0.05), -8px -8px 16px rgba(255,255,255,0.8)",
                border: "3px solid rgba(255,255,255,0.7)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div
                    className="p-1.5 rounded-full"
                    style={{
                      background: "linear-gradient(145deg, #ffffff, #e6e6e6)",
                      boxShadow:
                        "4px 4px 8px rgba(0,0,0,0.05), -4px -4px 8px rgba(255,255,255,0.9)",
                    }}
                  >
                    <img
                      src={post.user.avatar}
                      alt={`${post.user.name}'s avatar`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-center md:text-left">
                      <h2 className="font-bold text-xl text-gray-800">
                        {post.user.name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        @{post.user.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="mt-2 md:mt-0 text-center md:text-right px-3 py-1 rounded-full text-gray-400 text-sm"
                        style={{
                          background:
                            "linear-gradient(145deg, #f3f9ff, #e6f0f5)",
                          boxShadow:
                            "inset 2px 2px 5px rgba(0,0,0,0.03), inset -2px -2px 5px rgba(255,255,255,0.8)",
                        }}
                      >
                        {formatTimestamp(post.timestamp)}
                      </div>
                      {/* Post options button (3-dot menu) for all posts */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActivePostMenu(
                              post.id === activePostMenu ? null : post.id
                            )
                          }
                          className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-teal-50 transition-all duration-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>

                        {/* Post Options Dropdown Menu */}
                        {activePostMenu === post.id && (
                          <div
                            className="absolute top-full right-0 mt-2 z-20 bg-white rounded-xl overflow-hidden"
                            style={{
                              borderRadius: "16px",
                              boxShadow:
                                "6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)",
                              border: "2px solid rgba(255,255,255,0.7)",
                              width: "200px",
                            }}
                          >
                            {/* User's own post options */}
                            {post.user.id === currentUser.id ? (
                              <>
                                {/* Go to edit (home view) option */}
                                <button
                                  onClick={() => {
                                    if (onTabChange) {
                                      onTabChange("home"); // Switch to home where full editing is available
                                      setActivePostMenu(null);
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 text-teal-600 flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Edit Post
                                </button>

                                {/* View Engagement Option */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Show engagement stats in a toast via a manual approach
                                    const toastId = `engagement-${Date.now()}`;
                                    const tempToast =
                                      document.createElement("div");
                                    tempToast.id = toastId;
                                    tempToast.className =
                                      "fixed top-5 right-5 z-[100] bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg";
                                    tempToast.innerHTML = `Post Engagement: ${post.likes} likes, ${post.comments} comments, ${post.shares} shares`;
                                    document.body.appendChild(tempToast);

                                    // Remove the toast after 3 seconds
                                    setTimeout(() => {
                                      const toastElement =
                                        document.getElementById(toastId);
                                      if (toastElement) {
                                        toastElement.classList.add(
                                          "opacity-0",
                                          "transition-opacity",
                                          "duration-500"
                                        );
                                        setTimeout(
                                          () => toastElement.remove(),
                                          500
                                        );
                                      }
                                    }, 3000);

                                    setActivePostMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 text-teal-600 flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                  </svg>
                                  View Engagement
                                </button>
                              </>
                            ) : (
                              /* Other users' post options */
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Show engagement stats in a toast via a manual approach
                                  const toastId = `engagement-${Date.now()}`;
                                  const tempToast =
                                    document.createElement("div");
                                  tempToast.id = toastId;
                                  tempToast.className =
                                    "fixed top-5 right-5 z-[100] bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg";
                                  tempToast.innerHTML = `Post Engagement: ${post.likes} likes, ${post.comments} comments, ${post.shares} shares`;
                                  document.body.appendChild(tempToast);

                                  // Remove the toast after 3 seconds
                                  setTimeout(() => {
                                    const toastElement =
                                      document.getElementById(toastId);
                                    if (toastElement) {
                                      toastElement.classList.add(
                                        "opacity-0",
                                        "transition-opacity",
                                        "duration-500"
                                      );
                                      setTimeout(
                                        () => toastElement.remove(),
                                        500
                                      );
                                    }
                                  }, 3000);

                                  setActivePostMenu(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 text-teal-600 flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-2"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                                View Engagement
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                    {post.content}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.hashtags.map((hashtag) => (
                      <div key={hashtag.id} className="relative">
                        <div
                          onClick={(e) => toggleDropdown(hashtag.id, e)}
                          className={`inline-block px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                            followedHashtags.includes(hashtag.id)
                              ? "bg-teal-500 text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"
                              : mutedHashtags.includes(hashtag.id)
                              ? "bg-gray-200 text-gray-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]"
                              : "bg-teal-100 text-teal-700 hover:bg-teal-200 shadow-[2px_2px_4px_rgba(0,0,0,0.05),_-2px_-2px_4px_rgba(255,255,255,0.9)]"
                          }`}
                          style={{ borderRadius: "18px" }}
                        >
                          #{hashtag.name}
                        </div>
                        {activeDropdown === hashtag.id && (
                          <div
                            className="absolute top-full left-0 mt-2 z-10 bg-white rounded-xl overflow-hidden"
                            style={{
                              borderRadius: "16px",
                              boxShadow:
                                "6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)",
                              border: "2px solid rgba(255,255,255,0.7)",
                            }}
                          >
                            <button
                              onClick={(e) =>
                                handleFollowHashtag(hashtag.id, e)
                              }
                              className="px-4 py-2.5 text-sm hover:bg-teal-50 text-teal-700 w-full text-left font-medium"
                            >
                              {followedHashtags.includes(hashtag.id)
                                ? "✓ Following"
                                : "Follow"}
                            </button>
                            <button
                              onClick={(e) => handleMuteHashtag(hashtag.id, e)}
                              className="px-4 py-2.5 text-sm hover:bg-red-50 text-gray-700 w-full text-left font-medium"
                            >
                              {mutedHashtags.includes(hashtag.id)
                                ? "✓ Muted"
                                : "Mute"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-8 text-gray-500 justify-center md:justify-start">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                        post.isLiked
                          ? "text-red-500 bg-red-50"
                          : "hover:text-teal-600 hover:bg-teal-50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleCommentPost(post.id)}
                      className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                        post.isCommented
                          ? "text-blue-500 bg-blue-50"
                          : "hover:text-teal-600 hover:bg-teal-50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handleSharePost(post.id)}
                      className={`flex items-center gap-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                        post.isShared
                          ? "text-green-500 bg-green-50"
                          : "hover:text-teal-600 hover:bg-teal-50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] border-2 border-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-xl font-medium text-gray-600 mb-2">
              You haven&apos;t{" "}
              {profileTab === "posts"
                ? "posted"
                : profileTab === "likes"
                ? "liked"
                : "shared"}{" "}
              anything yet.
            </p>
            <p className="text-gray-500 mb-6">
              {profileTab === "posts"
                ? "Share your thoughts and build your presence."
                : profileTab === "likes"
                ? "Engage with content you enjoy by liking posts."
                : "Share interesting content with your network."}
            </p>
            {profileTab === "posts" && currentUser.id === "1" && (
              <button
                onClick={() =>
                  window.scrollTo({
                    top:
                      document
                        .querySelector(
                          'textarea[placeholder="What&apos;s on your mind?"]'
                        )
                        ?.getBoundingClientRect().top || 0,
                    behavior: "smooth",
                  })
                }
                className="px-5 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 shadow-md hover:shadow-lg transition-all inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleTabChange = (tabName: string) => {
    onTabChange(tabName);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b-2 border-teal-50 dark:border-gray-800 shadow-md rounded-b-2xl transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / App Title */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              SocialSphere
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <button
              onClick={() => handleTabChange("home")}
              className={`px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === "home"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 dark:border-teal-400"
                  : "text-gray-500 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-300"
              }`}
              aria-current={activeTab === "home" ? "page" : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 dark:border-teal-400"
                  : "text-gray-500 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-300"
              }`}
              aria-current={activeTab === "profile" ? "page" : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 dark:border-teal-400"
                  : "text-gray-500 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-300"
              }`}
              aria-current={activeTab === "settings" ? "page" : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-teal-600 hover:text-teal-700 hover:bg-teal-50 focus:outline-none"
            >
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${
                  isMobileMenuOpen ? "transform rotate-90" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 shadow-inner rounded-b-xl">
          <button
            onClick={() => {
              handleTabChange("home");
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
              activeTab === "home"
                ? "text-teal-600 bg-teal-50"
                : "text-gray-500 hover:text-teal-500 hover:bg-teal-50"
            }`}
            aria-current={activeTab === "home" ? "page" : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
          <button
            onClick={() => {
              handleTabChange("profile");
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
              activeTab === "profile"
                ? "text-teal-600 bg-teal-50"
                : "text-gray-500 hover:text-teal-500 hover:bg-teal-50"
            }`}
            aria-current={activeTab === "profile" ? "page" : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </button>
          <button
            onClick={() => {
              handleTabChange("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
              activeTab === "settings"
                ? "text-teal-600 bg-teal-50"
                : "text-gray-500 hover:text-teal-500 hover:bg-teal-50"
            }`}
            aria-current={activeTab === "settings" ? "page" : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </nav>
  );
};

const Timeline = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [followedHashtags, setFollowedHashtags] = useState<string[]>([]);
  const [mutedHashtags, setMutedHashtags] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [visiblePosts, setVisiblePosts] = useState<number>(12);

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State for current user (assuming ID '1' for mockCurrentUser)
  const currentUserId = "1"; // Default to mock user ID

  // New state variables for post options
  const [mutedPosts, setMutedPosts] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");

  // State for storing the user data loaded from localStorage
  const [savedUserData, setSavedUserData] = useState<CurrentUser | null>(null);

  // Theme and accessibility settings
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState<"small" | "default" | "large">(
    "default"
  );

  // Handler for creating new posts
  const handleCreatePost = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle theme toggle with direct DOM manipulation
  const toggleTheme = () => {
    // Get current state directly from DOM to ensure we're in sync
    const isDarkMode = document.documentElement.classList.contains("dark");
    const newTheme = isDarkMode ? "light" : "dark";

    console.log(
      "Toggling theme from",
      isDarkMode ? "dark" : "light",
      "to",
      newTheme
    );

    // Directly apply the change to the DOM
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update React state to match DOM
    setTheme(newTheme);

    // Save to localStorage
    localStorage.setItem("theme", newTheme);

    // Show toast notification
    addToast(`Theme changed to ${newTheme} mode`, "info");
  };

  // Handle font size change
  const changeFontSize = (size: "small" | "default" | "large") => {
    setFontSize(size);
    // Show toast notification
    addToast(`Font size changed to ${size}`, "info");
  };

  // Handle unmuting a user
  const handleUnmuteUser = (userId: string) => {
    setMutedUsers((prev) => prev.filter((id) => id !== userId));
    localStorage.setItem(
      "mutedUsers",
      JSON.stringify(mutedUsers.filter((id) => id !== userId))
    );
    // Show toast notification
    addToast("User has been unmuted", "success");
  };

  // Handle unblocking a user
  const handleUnblockUser = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    localStorage.setItem(
      "blockedUsers",
      JSON.stringify(blockedUsers.filter((id) => id !== userId))
    );
    // Show toast notification
    addToast("User has been unblocked", "success");
  };

  // Reset all settings to default
  const resetSettings = () => {
    // Check system preference for theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
    setFontSize("default");

    // Confirm before reset
    const confirmReset = window.confirm(
      "This will reset all your settings including unmuting and unblocking all users. Continue?"
    );
    if (confirmReset) {
      setMutedUsers([]);
      setBlockedUsers([]);
      localStorage.removeItem("mutedUsers");
      localStorage.removeItem("blockedUsers");
      localStorage.removeItem("fontSize");
      localStorage.removeItem("theme");

      // Show toast notification
      addToast("All settings have been reset to default", "info");
    }
  };

  // Load theme settings and preference on first render
  useEffect(() => {
    try {
      // Load theme preference
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);

        // Apply theme class to document element
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Check system preference if no saved preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setTheme(prefersDark ? "dark" : "light");

        // Apply system preference to document element
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }

      // Load font size preference
      const savedFontSize = localStorage.getItem("fontSize");
      if (
        savedFontSize === "small" ||
        savedFontSize === "default" ||
        savedFontSize === "large"
      ) {
        setFontSize(savedFontSize as "small" | "default" | "large");
      }

      // Load muted/blocked user preferences
      const savedMutedUsers = JSON.parse(
        localStorage.getItem("mutedUsers") || "[]"
      );
      const savedBlockedUsers = JSON.parse(
        localStorage.getItem("blockedUsers") || "[]"
      );
      setMutedUsers(savedMutedUsers);
      setBlockedUsers(savedBlockedUsers);
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
  }, []);

  // Load saved theme or detect system preference on initial render
  useEffect(() => {
    // Check if theme was previously saved
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Theme is now directly manipulated in the toggleTheme function
  // This effect ensures initial theme is set on load
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme =
      storedTheme === "dark" || (!storedTheme && prefersDark)
        ? ("dark" as const)
        : ("light" as const);

    console.log(
      "Initial theme from localStorage or system preference:",
      initialTheme
    );

    // Apply theme to DOM directly
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update state to match DOM
    setTheme(initialTheme);
  }, []); // Only run once on mount

  // Save font size when it changes
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);

    // Apply font size class to body
    const bodyElement = document.body;
    bodyElement.classList.remove("text-sm", "text-base", "text-lg");

    if (fontSize === "small") {
      bodyElement.classList.add("text-sm");
    } else if (fontSize === "large") {
      bodyElement.classList.add("text-lg");
    } else {
      bodyElement.classList.add("text-base");
    }
  }, [fontSize]);

  // Load posts, saved hashtag preferences, and user data from localStorage on component mount
  useEffect(() => {
    // Generate mock posts
    const generatedPosts = generateMockPosts();

    // Check for user-created posts in localStorage
    try {
      const userPosts = JSON.parse(localStorage.getItem("userPosts") || "[]");
      // Merge user posts with generated posts
      const allPosts = [...userPosts, ...generatedPosts];
      setPosts(allPosts);
    } catch (e) {
      console.error("Failed to load user posts:", e);
      setPosts(generatedPosts);
    }

    // Load saved interaction state from localStorage
    const savedInteractions = localStorage.getItem("postInteractions");
    if (savedInteractions) {
      try {
        const interactions = JSON.parse(savedInteractions);
        setPosts((prevPosts) =>
          prevPosts.map((post) => ({
            ...post,
            isLiked: interactions[post.id]?.isLiked || false,
            isCommented: interactions[post.id]?.isCommented || false,
            isShared: interactions[post.id]?.isShared || false,
            likes: interactions[post.id]?.isLiked ? post.likes + 1 : post.likes,
            comments: interactions[post.id]?.isCommented
              ? post.comments + 1
              : post.comments,
            shares: interactions[post.id]?.isShared
              ? post.shares + 1
              : post.shares,
          }))
        );
      } catch (e) {
        console.error("Failed to parse saved interactions:", e);
      }
    }

    // Load saved hashtag preferences from localStorage
    const savedHashtags = localStorage.getItem("hashtagPreferences");
    if (savedHashtags) {
      try {
        const { followed, muted } = JSON.parse(savedHashtags);
        setFollowedHashtags(followed || []);
        setMutedHashtags(muted || []);
      } catch (e) {
        console.error("Failed to parse saved hashtag preferences:", e);
      }
    }

    // Load saved user data from localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setSavedUserData(parsedUser);
      } catch (e) {
        console.error("Failed to parse saved user data:", e);
      }
    }
  }, []);

  // Save interaction state to localStorage
  useEffect(() => {
    if (posts.length === 0) return;

    const interactions = posts.reduce((acc, post) => {
      acc[post.id] = {
        isLiked: post.isLiked || false,
        isCommented: post.isCommented || false,
        isShared: post.isShared || false,
      };
      return acc;
    }, {} as Record<string, { isLiked: boolean; isCommented: boolean; isShared: boolean }>);

    localStorage.setItem("postInteractions", JSON.stringify(interactions));
  }, [posts]);

  // Save hashtag preferences to localStorage
  useEffect(() => {
    localStorage.setItem("followedHashtags", JSON.stringify(followedHashtags));
  }, [followedHashtags]);

  useEffect(() => {
    localStorage.setItem("mutedHashtags", JSON.stringify(mutedHashtags));
  }, [mutedHashtags]);

  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleCommentPost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsCommented = !post.isCommented;
          return {
            ...post,
            isCommented: newIsCommented,
            comments: newIsCommented ? post.comments + 1 : post.comments - 1,
          };
        }
        return post;
      })
    );
  };

  const handleSharePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsShared = !post.isShared;
          return {
            ...post,
            isShared: newIsShared,
            shares: newIsShared ? post.shares + 1 : post.shares - 1,
          };
        }
        return post;
      })
    );
  };

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 8);
  };

  // Post Options Menu Handlers
  const togglePostMenu = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePostMenu(activePostMenu === postId ? null : postId);
    // Close hashtag dropdown if open
    if (activeDropdown) setActiveDropdown(null);
  };

  const handleMutePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedPosts((prev) => [...prev, postId]);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isMuted: true } : post
      )
    );
    // Save to localStorage
    const savedMutedPosts = JSON.parse(
      localStorage.getItem("mutedPosts") || "[]"
    );
    localStorage.setItem(
      "mutedPosts",
      JSON.stringify([...savedMutedPosts, postId])
    );
    // Close menu
    setActivePostMenu(null);
  };

  const handleMuteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find user info for toast message
    const userPost = posts.find((post) => post.user.id === userId);
    if (!userPost) return;

    // Toggle mute status
    if (mutedUsers.includes(userId)) {
      // Unmute user
      const updatedMutedUsers = mutedUsers.filter((id) => id !== userId);
      setMutedUsers(updatedMutedUsers);
      localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
      addToast(`@${userPost.user.username} has been unmuted`, "success");
    } else {
      // Mute user
      const updatedMutedUsers = [...mutedUsers, userId];
      setMutedUsers(updatedMutedUsers);
      localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
      addToast(`@${userPost.user.username} has been muted`, "success");
    }

    // Close menu
    setActivePostMenu(null);
  };

  const handleFollowUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find user info for toast message
    const userPost = posts.find((post) => post.user.id === userId);
    if (!userPost) return;

    // Toggle follow status
    if (followedUsers.includes(userId)) {
      // Unfollow user
      const updatedFollowedUsers = followedUsers.filter((id) => id !== userId);
      setFollowedUsers(updatedFollowedUsers);
      localStorage.setItem(
        "followedUsers",
        JSON.stringify(updatedFollowedUsers)
      );
      addToast(`Unfollowed @${userPost.user.username}`, "info");
    } else {
      // Follow user
      const updatedFollowedUsers = [...followedUsers, userId];
      setFollowedUsers(updatedFollowedUsers);
      localStorage.setItem(
        "followedUsers",
        JSON.stringify(updatedFollowedUsers)
      );
      addToast(`Now following @${userPost.user.username}`, "success");
    }

    // Close menu
    setActivePostMenu(null);
  };

  const handleBlockUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find user info for toast message
    const userPost = posts.find((post) => post.user.id === userId);
    if (!userPost) return;

    // Toggle block status
    if (blockedUsers.includes(userId)) {
      // Unblock user
      const updatedBlockedUsers = blockedUsers.filter((id) => id !== userId);
      setBlockedUsers(updatedBlockedUsers);
      localStorage.setItem("blockedUsers", JSON.stringify(updatedBlockedUsers));
      addToast(`@${userPost.user.username} has been unblocked`, "success");
    } else {
      // Block user
      const updatedBlockedUsers = [...blockedUsers, userId];
      setBlockedUsers(updatedBlockedUsers);
      localStorage.setItem("blockedUsers", JSON.stringify(updatedBlockedUsers));

      // Also automatically mute the user when blocked
      if (!mutedUsers.includes(userId)) {
        const updatedMutedUsers = [...mutedUsers, userId];
        setMutedUsers(updatedMutedUsers);
        localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
      }

      addToast(`@${userPost.user.username} has been blocked`, "error");
    }

    // Close menu
    setActivePostMenu(null);
  };

  const handleReportPost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Post ${postId} reported`);
    // In a real app, this would send a report to the server
    addToast(
      "Post has been reported. Thank you for helping keep our community safe.",
      "info"
    );
    // Close menu
    setActivePostMenu(null);
  };

  const handleViewEngagement = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    // Show engagement stats in a toast
    addToast(
      `Post Engagement: ${post.likes} likes, ${post.comments} comments, ${post.shares} shares`,
      "info"
    );
    // Close menu
    setActivePostMenu(null);
  };

  // New handlers for user's own posts
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState<string>("");

  const handleEditPost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the post to edit
    const postToEdit = posts.find((post) => post.id === postId);
    if (postToEdit) {
      setEditPostContent(postToEdit.content);
      setEditingPostId(postId);
    }
    // Close menu
    setActivePostMenu(null);
  };

  const handleSavePostEdit = (postId: string) => {
    // Update the post in state
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, content: editPostContent } : post
      )
    );

    // Update in localStorage
    try {
      const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]");
      const updatedPosts = savedPosts.map((post: Post) =>
        post.id === postId ? { ...post, content: editPostContent } : post
      );
      localStorage.setItem("userPosts", JSON.stringify(updatedPosts));
    } catch (e) {
      console.error("Failed to update post in localStorage:", e);
    }

    // Reset editing state
    setEditingPostId(null);
    setEditPostContent("");
    addToast(`Post edited successfully`, "success");
  };

  const handleCancelPostEdit = () => {
    setEditingPostId(null);
    setEditPostContent("");
    addToast(`Post editing cancelled`, "success");
  };

  const handleDeletePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      // Remove the post from state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      // Remove from localStorage
      try {
        const savedPosts = JSON.parse(
          localStorage.getItem("userPosts") || "[]"
        );
        const updatedPosts = savedPosts.filter(
          (post: Post) => post.id !== postId
        );
        localStorage.setItem("userPosts", JSON.stringify(updatedPosts));
      } catch (e) {
        console.error("Failed to delete post from localStorage:", e);
      }
      addToast(`Post deleted successfully`, "success");
    }
    // Close menu
    setActivePostMenu(null);
  };

  const sortPosts = React.useMemo(() => {
    return (posts: Post[], option: SortOption): Post[] => {
      switch (option) {
        case "latest":
          return posts.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "popular":
          return [...posts].sort(
            (a, b) =>
              b.likes +
              b.comments +
              b.shares -
              (a.likes + a.comments + a.shares)
          );
        case "personalized":
          // Filter out posts with muted hashtags
          const filteredPosts = posts.filter(
            (post) =>
              !post.hashtags.some((hashtag) =>
                mutedHashtags.includes(hashtag.id)
              )
          );

          // Prioritize posts with followed hashtags
          return filteredPosts.sort((a, b) => {
            const aFollowedCount = a.hashtags.filter((hashtag) =>
              followedHashtags.includes(hashtag.id)
            ).length;
            const bFollowedCount = b.hashtags.filter((hashtag) =>
              followedHashtags.includes(hashtag.id)
            ).length;

            if (aFollowedCount !== bFollowedCount) {
              return bFollowedCount - aFollowedCount;
            }

            // If same follow count, sort by latest
            // Ensure timestamps are Date objects before calling getTime()
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        default:
          return posts;
      }
    };
  }, [mutedHashtags, followedHashtags]);

  const handleFollowHashtag = (hashtagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (followedHashtags.includes(hashtagId)) {
      setFollowedHashtags(followedHashtags.filter((id) => id !== hashtagId));
    } else {
      setFollowedHashtags([...followedHashtags, hashtagId]);
      // If we follow a hashtag, we can't mute it
      setMutedHashtags(mutedHashtags.filter((id) => id !== hashtagId));
    }
    setActiveDropdown(null);
  };

  const handleMuteHashtag = (hashtagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mutedHashtags.includes(hashtagId)) {
      setMutedHashtags(mutedHashtags.filter((id) => id !== hashtagId));
    } else {
      setMutedHashtags([...mutedHashtags, hashtagId]);
      // If we mute a hashtag, we can't follow it
      setFollowedHashtags(followedHashtags.filter((id) => id !== hashtagId));
    }
    setActiveDropdown(null);
  };

  const formatTimestamp = (date: Date | string): string => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return (date instanceof Date ? date : new Date(date)).toLocaleDateString();
  };

  const toggleDropdown = (hashtagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === hashtagId ? null : hashtagId);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setActivePostMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter out posts based on user preferences (muted posts, muted users, blocked users)
  const filteredByPreferences = posts.filter((post) => {
    // Skip muted posts
    if (mutedPosts.includes(post.id)) return false;

    // Skip posts from muted users
    if (mutedUsers.includes(post.user.id)) return false;

    // Skip posts from blocked users
    if (blockedUsers.includes(post.user.id)) return false;

    // Show all other posts
    return true;
  });

  const sortedPosts = sortPosts(filteredByPreferences, sortOption);
  const displayedPosts = sortedPosts.slice(0, visiblePosts);

  // Function to add a toast notification
  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message, type }]);
  };

  // Function to remove a toast notification
  const removeToast = (id: string) => {
    setToasts(toasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="min-h-screen" data-component="timeline">
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />

        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
        <Head>
          <title>
            {activeTab === "home"
              ? "Timeline"
              : activeTab === "profile"
              ? "Profile"
              : "Settings"}
          </title>
          <meta
            name="description"
            content="A responsive social media experience built with NextJS and Tailwind CSS"
          />
        </Head>

        {activeTab === "home" && (
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Filter Options */}
            <div className="mb-8 flex flex-wrap justify-center gap-4">
              {(["latest", "popular", "personalized"] as const).map(
                (option) => (
                  <button
                    key={option}
                    onClick={() => setSortOption(option)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      sortOption === option
                        ? "bg-teal-500 text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
                        : "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-[6px_6px_12px_rgba(0,0,0,0.03),_-6px_-6px_12px_rgba(255,255,255,0.8),_inset_0_0_0_rgba(255,255,255,0.25)] dark:shadow-lg"
                    }`}
                    style={{ borderRadius: "18px" }}
                  >
                    {option === "latest"
                      ? "Latest"
                      : option === "popular"
                      ? "Popular"
                      : "For You"}
                  </button>
                )
              )}
            </div>

            {/* Posts Timeline */}
            <div className="space-y-8">
              {displayedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  handleLikePost={handleLikePost}
                  handleCommentPost={handleCommentPost}
                  handleSharePost={handleSharePost}
                  followedHashtags={followedHashtags}
                  mutedHashtags={mutedHashtags}
                  handleFollowHashtag={handleFollowHashtag}
                  handleMuteHashtag={handleMuteHashtag}
                  activeDropdown={activeDropdown}
                  toggleDropdown={toggleDropdown}
                  formatTimestamp={formatTimestamp}
                  // Post options dropdown props
                  activePostMenu={activePostMenu}
                  togglePostMenu={togglePostMenu}
                  handleMutePost={handleMutePost}
                  handleMuteUser={handleMuteUser}
                  handleFollowUser={handleFollowUser}
                  handleBlockUser={handleBlockUser}
                  handleReportPost={handleReportPost}
                  handleViewEngagement={handleViewEngagement}
                  followedUsers={followedUsers}
                  mutedUsers={mutedUsers}
                  blockedUsers={blockedUsers}
                  // Post editing props
                  editingPostId={editingPostId}
                  editPostContent={editPostContent}
                  handleEditPost={handleEditPost}
                  handleDeletePost={handleDeletePost}
                  handleSavePostEdit={handleSavePostEdit}
                  handleCancelPostEdit={handleCancelPostEdit}
                  setEditPostContent={setEditPostContent}
                  currentUserId={currentUserId}
                />
              ))}

              {/* End of feed indicator */}
              <div
                className="text-center py-8 px-6 rounded-3xl bg-white"
                style={{
                  borderRadius: "30px",
                  boxShadow:
                    "8px 8px 16px rgba(0,0,0,0.05), -8px -8px 16px rgba(255,255,255,0.8)",
                  border: "3px solid rgba(255,255,255,0.7)",
                }}
              >
                <p className="text-teal-600 font-medium">
                  You&apos;ve reached the end of your feed!
                </p>
                <button
                  onClick={handleLoadMore}
                  className="mt-4 px-6 py-2.5 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-colors"
                >
                  Load more
                </button>
              </div>
            </div>
          </main>
        )}

        {activeTab === "profile" && (
          <Profile
            currentUser={savedUserData || mockCurrentUser}
            posts={posts}
            handleLikePost={handleLikePost}
            handleCommentPost={handleCommentPost}
            handleSharePost={handleSharePost}
            followedHashtags={followedHashtags}
            mutedHashtags={mutedHashtags}
            handleFollowHashtag={handleFollowHashtag}
            handleMuteHashtag={handleMuteHashtag}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
            formatTimestamp={formatTimestamp}
            handleCreatePost={handleCreatePost}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === "settings" && (
          <div className="container mx-auto px-4 py-8 max-w-4xl dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-6 text-center">
              Settings
            </h1>

            {/* Settings Panels */}
            <div className="grid md:grid-cols-1 gap-8">
              {/* Theme Mode */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Theme Mode
                </h2>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <span className="text-gray-700 dark:text-gray-100">
                    Dark Mode
                  </span>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      theme === "dark" ? "bg-teal-500" : "bg-gray-300"
                    }`}
                    aria-label="Toggle dark mode"
                  >
                    <span className="sr-only">Toggle Dark Mode</span>
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full transition-transform duration-300 ${
                        theme === "dark"
                          ? "translate-x-8 bg-gray-800 shadow-[0_0_2px_1px_rgba(20,184,166,0.6)]"
                          : "translate-x-1 bg-white"
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                  {theme === "dark"
                    ? "Currently using dark theme"
                    : "Currently using light theme"}
                </p>
              </div>

              {/* Font Size */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Font Size
                </h2>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => changeFontSize("small")}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 ${
                      fontSize === "small"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="text-sm">Small</span>
                  </button>
                  <button
                    onClick={() => changeFontSize("default")}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 ${
                      fontSize === "default"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="text-base">Default</span>
                  </button>
                  <button
                    onClick={() => changeFontSize("large")}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 ${
                      fontSize === "large"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="text-lg">Large</span>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                  Choose a comfortable text size for better readability
                </p>
              </div>

              {/* Muted Users */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Muted Users
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 min-h-[150px]">
                  {mutedUsers.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {/* Filter unique users to avoid duplicates */}
                      {posts
                        .filter((post) => mutedUsers.includes(post.user.id))
                        // Create a Set of user IDs we've already displayed to prevent duplicates
                        .filter(
                          (post, index, self) =>
                            index ===
                            self.findIndex((p) => p.user.id === post.user.id)
                        )
                        .map((post) => (
                          <li
                            key={`muted-${post.user.id}`}
                            className="py-4 flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <img
                                src={post.user.avatar}
                                alt={post.user.name}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium">
                                  {post.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-200">
                                  @{post.user.username}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnmuteUser(post.user.id)}
                              className="ml-4 px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-300"
                            >
                              Unmute
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-[150px] text-gray-500 dark:text-gray-200">
                      <p>You haven&apos;t muted any users yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Blocked Users */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Blocked Users
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 min-h-[150px]">
                  {blockedUsers.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {/* Filter unique users to avoid duplicates */}
                      {posts
                        .filter((post) => blockedUsers.includes(post.user.id))
                        // Create a Set of user IDs we've already displayed to prevent duplicates
                        .filter(
                          (post, index, self) =>
                            index ===
                            self.findIndex((p) => p.user.id === post.user.id)
                        )
                        .map((post) => (
                          <li
                            key={`blocked-${post.user.id}`}
                            className="py-4 flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <img
                                src={post.user.avatar}
                                alt={post.user.name}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium">
                                  {post.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-200">
                                  @{post.user.username}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnblockUser(post.user.id)}
                              className="ml-4 px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-300"
                            >
                              Unblock
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-[150px] text-gray-500 dark:text-gray-200">
                      <p>You haven&apos;t blocked any users yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),_-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reset Settings
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-200 mb-4">
                  Restore all settings to their default values. This will unmute
                  and unblock all users, and reset theme and font preferences.
                </p>
                <button
                  onClick={resetSettings}
                  className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0111 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reset All Settings
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="hidden md:flex justify-center items-center py-4 bg-white/60 backdrop-blur-md border-t border-gray-200 text-sm text-gray-500">
          <div className="container max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
            <div>
              <span className="font-medium">&copy; 2025 SocialSphere</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-teal-600 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-teal-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-teal-600 transition-colors">
                Contact
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-600 transition-colors flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Timeline;
