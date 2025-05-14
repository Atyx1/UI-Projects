import React, { useState, useEffect, useRef } from "react";

// Dynamically load CDNs for Tailwind and Material Icons
const TW_CDN_URL = "https://cdn.tailwindcss.com";
const MATERIAL_ICONS_CDN_URL =
  "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";

// Type Definitions - Updated for Language App
type View = "Dialogues" | "Vocabulary" | "Progress" | "Settings" | "Profile"; // Updated views

type DialogueMeta = {
  id: string;
  title: string;
  icon: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

type DialogueLine = {
  speaker: string;
  line: string;
  recordable?: boolean;
  audioSrc?: string; // Placeholder for audio file URL
};

type Dialogue = {
  id: string;
  title: string;
  lines: DialogueLine[];
};

type VocabularyWord = {
  id: string;
  word: string;
  definition: string;
  context: string;
  pronunciation: string;
  audioSrc?: string; // Placeholder for audio file URL
  keywords: string[]; // Added keywords for better matching
};

type ProgressData = {
  overallAccuracy: number;
  completedDialogues: number;
  totalDialogues: number;
  accuracyByDialogue: { title: string; accuracy: number }[];
};

// Add type for pronunciation attempt
type PronunciationAttempt = {
  expected: string;
  actual: string;
  similarity: number;
  timestamp: number;
  isCorrect: boolean;
};

// Declare global interfaces for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

// --- API Simulation --- //
const mockDialoguesMeta: DialogueMeta[] = [
  {
    id: "d1",
    title: "Ordering Coffee",
    icon: "local_cafe",
    difficulty: "Easy",
  },
  {
    id: "d2",
    title: "Asking for Directions",
    icon: "directions",
    difficulty: "Easy",
  },
  { id: "d3", title: "Booking a Hotel", icon: "hotel", difficulty: "Medium" },
  {
    id: "d4",
    title: "Shopping for Clothes",
    icon: "shopping_bag",
    difficulty: "Medium",
  },
  {
    id: "d5",
    title: "Discussing Weekend Plans",
    icon: "event",
    difficulty: "Hard",
  },
  {
    id: "d6",
    title: "Job Interview Practice",
    icon: "work",
    difficulty: "Hard",
  },
];

const mockDialoguesContent: { [key: string]: Dialogue } = {
  d1: {
    id: "d1",
    title: "Ordering Coffee",
    lines: [
      {
        speaker: "Barista",
        line: "Hi there! What can I get for you?",
        audioSrc: "/audio/barista1.mp3",
      },
      {
        speaker: "You",
        line: "Hi! Can I have a large latte, please?",
        recordable: true,
      },
      {
        speaker: "Barista",
        line: "Sure thing. Anything else?",
        audioSrc: "/audio/barista2.mp3",
      },
      { speaker: "You", line: "No, that's all. Thanks!", recordable: true },
      {
        speaker: "Barista",
        line: "Alright, that'll be $4.50.",
        audioSrc: "/audio/barista3.mp3",
      },
    ],
  },
  d2: {
    id: "d2",
    title: "Asking for Directions",
    lines: [
      {
        speaker: "You",
        line: "Excuse me, could you tell me how to get to the nearest station?",
        recordable: true,
      },
      {
        speaker: "Local",
        line: "Of course. Go straight down this road, take the second left, and it's just on your right.",
        audioSrc: "/audio/local1.mp3",
      },
      {
        speaker: "You",
        line: "Second left, then on the right. Got it. Thank you!",
        recordable: true,
      },
      {
        speaker: "Local",
        line: "No problem! Have a nice day.",
        audioSrc: "/audio/local2.mp3",
      },
    ],
  },
  d3: {
    id: "d3",
    title: "Booking a Hotel",
    lines: [
      {
        speaker: "You",
        line: "Hello, I'd like to make a booking for two nights, please.",
        recordable: true,
      },
      {
        speaker: "Receptionist",
        line: "Of course. When would you like to stay with us?",
        audioSrc: "/audio/hotel1.mp3",
      },
      {
        speaker: "You",
        line: "This weekend, from Friday to Sunday.",
        recordable: true,
      },
      {
        speaker: "Receptionist",
        line: "Let me check availability. Yes, we have a double room available. Would you like to book it?",
        audioSrc: "/audio/hotel2.mp3",
      },
      {
        speaker: "You",
        line: "Yes, that sounds perfect. How much will it cost?",
        recordable: true,
      },
      {
        speaker: "Receptionist",
        line: "It's $120 per night, so $240 in total. May I have your name, please?",
        audioSrc: "/audio/hotel3.mp3",
      },
    ],
  },
  d4: {
    id: "d4",
    title: "Shopping for Clothes",
    lines: [
      {
        speaker: "Assistant",
        line: "Hi there, can I help you find anything specific today?",
        audioSrc: "/audio/shop1.mp3",
      },
      {
        speaker: "You",
        line: "Yes, I'm looking for some new clothes for summer.",
        recordable: true,
      },
      {
        speaker: "Assistant",
        line: "Our summer collection is just over here. Are you looking for something casual or formal?",
        audioSrc: "/audio/shop2.mp3",
      },
      {
        speaker: "You",
        line: "Just casual wear. I need some t-shirts and maybe a pair of shorts.",
        recordable: true,
      },
      {
        speaker: "Assistant",
        line: "Perfect. The t-shirts are on this rack, and shorts are just around the corner. Let me know if you need any other sizes.",
        audioSrc: "/audio/shop3.mp3",
      },
      {
        speaker: "You",
        line: "Thank you, I'll try these on and see how they fit.",
        recordable: true,
      },
    ],
  },
  d5: {
    id: "d5",
    title: "Discussing Weekend Plans",
    lines: [
      {
        speaker: "Friend",
        line: "So, what are your plans for the weekend?",
        audioSrc: "/audio/weekend1.mp3",
      },
      {
        speaker: "You",
        line: "I'm not sure yet. I might go to the movies or just relax at home. What about you?",
        recordable: true,
      },
      {
        speaker: "Friend",
        line: "I was thinking of going hiking on Saturday if the weather is nice. Would you be interested in joining?",
        audioSrc: "/audio/weekend2.mp3",
      },
      {
        speaker: "You",
        line: "That sounds fun! I haven't been hiking in a while. What time are you planning to go?",
        recordable: true,
      },
      {
        speaker: "Friend",
        line: "I was thinking early morning, around 8am. We could have lunch at that nice cafe near the trail afterward.",
        audioSrc: "/audio/weekend3.mp3",
      },
      {
        speaker: "You",
        line: "Perfect, let's do that. I'll make sure to prepare my hiking gear.",
        recordable: true,
      },
    ],
  },
  d6: {
    id: "d6",
    title: "Job Interview Practice",
    lines: [
      {
        speaker: "Interviewer",
        line: "Thank you for coming in today. Could you tell me a bit about yourself and your experience?",
        audioSrc: "/audio/interview1.mp3",
      },
      {
        speaker: "You",
        line: "Thank you for having me. I have five years of experience in marketing, with a focus on digital campaigns and social media strategy.",
        recordable: true,
      },
      {
        speaker: "Interviewer",
        line: "That's interesting. Can you tell me about a challenging project you worked on recently?",
        audioSrc: "/audio/interview2.mp3",
      },
      {
        speaker: "You",
        line: "Last year, I led a rebranding campaign for a major client that increased their social media engagement by 40% within three months.",
        recordable: true,
      },
      {
        speaker: "Interviewer",
        line: "Impressive! How do you handle tight deadlines and pressure?",
        audioSrc: "/audio/interview3.mp3",
      },
      {
        speaker: "You",
        line: "I prioritize tasks and maintain clear communication with team members. I find that breaking large projects into smaller milestones helps manage pressure effectively.",
        recordable: true,
      },
    ],
  },
};

const mockVocabulary: VocabularyWord[] = [
  {
    id: "vocab1",
    word: "coffee",
    definition: "A hot drink made from roasted coffee beans.",
    context: "I'd like a black coffee, please.",
    pronunciation: "kɒfi",
    audioSrc: "/audio/coffee.mp3",
    keywords: ["drink", "cup", "espresso", "caffeine", "cafe", "hot"],
  },
  {
    id: "vocab2",
    word: "croissant",
    definition: "A flaky, buttery, crescent-shaped roll of French origin.",
    context: "I'll have a croissant with my coffee.",
    pronunciation: "krwɑsɒ̃",
    audioSrc: "/audio/croissant.mp3",
    keywords: ["pastry", "breakfast", "French", "bakery", "butter"],
  },
  {
    id: "vocab3",
    word: "latte",
    definition: "A coffee drink made with espresso and steamed milk.",
    context: "Can I have a large latte, please?",
    pronunciation: "ˈlɑːteɪ",
    audioSrc: "/audio/latte.mp3",
    keywords: ["coffee", "milk", "espresso", "drink", "order"],
  },
  {
    id: "vocab4",
    word: "station",
    definition:
      "A place where trains or buses stop so that passengers can get on and off.",
    context: "Could you tell me how to get to the nearest station?",
    pronunciation: "ˈsteɪʃən",
    audioSrc: "/audio/station.mp3",
    keywords: ["train", "bus", "travel", "transport", "directions"],
  },
  {
    id: "vocab5",
    word: "directions",
    definition: "Information about how to get to a place.",
    context: "Can you give me directions to the museum?",
    pronunciation: "dɪˈrɛkʃənz",
    audioSrc: "/audio/directions.mp3",
    keywords: ["map", "guide", "route", "way", "path", "navigate"],
  },
  {
    id: "vocab6",
    word: "hotel",
    definition: "A building where people pay to stay when they are traveling.",
    context: "We're staying at a hotel near the beach.",
    pronunciation: "hoʊˈtɛl",
    audioSrc: "/audio/hotel.mp3",
    keywords: [
      "accommodation",
      "stay",
      "room",
      "booking",
      "reservation",
      "lodging",
    ],
  },
  {
    id: "vocab7",
    word: "booking",
    definition: "An arrangement to buy a ticket, stay in a hotel room, etc.",
    context: "I'd like to make a booking for two nights.",
    pronunciation: "ˈbʊkɪŋ",
    audioSrc: "/audio/booking.mp3",
    keywords: ["reserve", "reservation", "hotel", "ticket", "arrangement"],
  },
  {
    id: "vocab8",
    word: "clothes",
    definition: "Items worn to cover the body.",
    context: "I need to buy some new clothes for summer.",
    pronunciation: "kloʊðz",
    audioSrc: "/audio/clothes.mp3",
    keywords: ["shopping", "fashion", "wear", "dress", "apparel", "garments"],
  },
  {
    id: "vocab9",
    word: "weekend",
    definition: "Saturday and Sunday; the period when most people do not work.",
    context: "What are your plans for the weekend?",
    pronunciation: "ˈwiːkɛnd",
    audioSrc: "/audio/weekend.mp3",
    keywords: [
      "Saturday",
      "Sunday",
      "plans",
      "leisure",
      "free time",
      "holiday",
    ],
  },
  {
    id: "vocab10",
    word: "interview",
    definition:
      "A formal meeting where someone is asked questions to see if they are suitable for a job.",
    context: "I have a job interview next week.",
    pronunciation: "ˈɪntəvjuː",
    audioSrc: "/audio/interview.mp3",
    keywords: [
      "job",
      "hiring",
      "questions",
      "career",
      "employment",
      "recruitment",
    ],
  },
];

const mockProgress: ProgressData = {
  overallAccuracy: 85,
  completedDialogues: 2, // Will be updated dynamically
  totalDialogues: mockDialoguesMeta.length,
  accuracyByDialogue: [
    { title: "Ordering Coffee", accuracy: 92 },
    { title: "Asking for Directions", accuracy: 88 },
    // These will be populated dynamically as user completes dialogues
  ],
};

const simulateApiCall = <T,>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

const fetchDialoguesMeta = () => simulateApiCall(mockDialoguesMeta);
const fetchDialogueContent = (id: string) =>
  simulateApiCall(mockDialoguesContent[id]);
const fetchVocabulary = () => simulateApiCall(mockVocabulary);
const fetchProgress = () => simulateApiCall(mockProgress);

const saveWord = (
  wordData: Omit<VocabularyWord, "id">
): Promise<VocabularyWord> => {
  console.log("API_SIM: Saving word:", wordData);
  const newWord = { ...wordData, id: `v${Date.now()}` }; // Create a dummy ID
  mockVocabulary.push(newWord); // Add to mock data (won't persist visually without state update)
  return simulateApiCall(newWord, 300);
};

const recordAudio = (): Promise<{ success: boolean; message: string }> => {
  console.log("API_SIM: Simulating audio recording...");
  // In a real app, this would involve Web Speech API or similar
  return simulateApiCall(
    { success: true, message: "Recording successful (simulated)" },
    1500
  );
};

// Define speech result type
type SpeechResult = { text: string; accuracy: number };

// Audio utility functions
const playAudio = (src?: string, text?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If audio source is provided, try to play it
    if (src) {
      const audio = new Audio(src);
      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);

        // If text is provided, fall back to speech synthesis
        if (text) {
          speakText(text).then(resolve).catch(reject);
        } else {
          showToast("Audio playback failed", "error");
          reject(new Error("Audio playback failed"));
        }
      };
      audio.play().catch((e) => {
        console.error("Audio play error:", e);

        // If text is provided, fall back to speech synthesis
        if (text) {
          speakText(text).then(resolve).catch(reject);
        } else {
          showToast("Audio playback failed", "error");
          reject(new Error("Audio playback failed"));
        }
      });
    }
    // If no audio source but text is provided, use speech synthesis
    else if (text) {
      speakText(text).then(resolve).catch(reject);
    }
    // Neither audio source nor text provided
    else {
      showToast("No audio or text provided", "error");
      reject(new Error("No audio or text provided"));
    }
  });
};

// Text-to-speech function
const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      showToast("Speech synthesis not supported", "error");
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      showToast("Speech synthesis failed", "error");
      reject(new Error("Speech synthesis failed"));
    };
    window.speechSynthesis.speak(utterance);
  });
};

// Play sound effect for feedback
const playSound = (type: "success" | "error") => {
  // In a real app, you would have actual sound files
  // This is a simple placeholder using Web Audio API
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "success") {
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );
    oscillator.stop(audioContext.currentTime + 0.5);
  } else {
    oscillator.frequency.value = 300;
    oscillator.type = "triangle";
    gainNode.gain.value = 0.1;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.3
    );
    oscillator.stop(audioContext.currentTime + 0.3);
  }
};

// Normalize two strings and calculate their similarity percentage (higher is more similar)
const accuracyPct = (spoken: string, target: string) => {
  const dist = calculateLevenshteinDistance(
    spoken.toLowerCase(),
    target.toLowerCase()
  );
  const maxLen = Math.max(spoken.length, target.length);
  return Math.round(((maxLen - dist) / maxLen) * 100);
};

// Levenshtein distance function to calculate string similarity
const calculateLevenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Calculate similarity percentage between two strings (higher is more similar)
const calculateSimilarity = (expected: string, actual: string): number => {
  // Normalize strings: lowercase, trim, and remove punctuation
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  const normalizedExpected = normalize(expected);
  const normalizedActual = normalize(actual);

  if (normalizedExpected.length === 0) return 0;

  const distance = calculateLevenshteinDistance(
    normalizedExpected,
    normalizedActual
  );
  const maxLength = Math.max(
    normalizedExpected.length,
    normalizedActual.length
  );
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
};

// Color palette for Tailwind Config (brighter and more modern)
const tailwindConfig = `
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Vibrant Blue Tone)
        brand: {
          light: '#f0f9ff', // sky-50
          DEFAULT: '#0ea5e9', // sky-500
          dark: '#0369a1',  // sky-700
          'text-light': '#f8fafc', // neutral-50 (For light theme text)
          'text-dark': '#0f172a',  // neutral-900 (For dark theme text)
        },
        // Secondary Accent Colors (Vibrant Green Tone)
        secondary: {
          light: '#a7f3d0', // emerald-200
          DEFAULT: '#10b981', // emerald-500
          dark: '#047857',  // emerald-700
        },
        // Tertiary/Action Color (Vibrant Rose Tone)
        accent: {
          light: '#ffe4e6', // rose-100
          DEFAULT: '#f43f5e', // rose-500
          dark: '#be123c',  // rose-700
        },
        // Neutral Colors (Gray Tones) - Slightly darker for contrast
        neutral: {
          50: '#f9fafb',  // gray-50
          100: '#f3f4f6', // gray-100
          200: '#e5e7eb', // gray-200
          300: '#d1d5db', // gray-300
          400: '#9ca3af', // gray-400
          500: '#6b7280', // gray-500
          600: '#4b5563', // gray-600
          700: '#374151', // gray-700
          800: '#1f2937', // gray-800
          900: '#111827', // gray-900
          950: '#030712', // gray-950
        },
        // Status Colors
        success: '#10b981', // emerald-500
        error: '#f43f5e',   // rose-500
        info: '#3b82f6',   // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      },
      boxShadow: {
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'smooth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'smooth-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-smooth': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        'button': '0 2px 5px 0 rgba(0, 0, 0, 0.08)',
        'button-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
         'pulse-mic': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.4)' }, // rose-500
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(244, 63, 94, 0)' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
        'pulse-mic': 'pulse-mic 1.5s infinite ease-out',
        'scale-in': 'scale-in 0.2s ease-out forwards',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    }
  }
}
`;

// Global toast function (defined outside component)
let showToast: (
  message: string,
  type?: "success" | "error" | "info"
) => void = () => {};

// Web Speech API Check
const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const browserSupportsSpeechRecognition = !!SpeechRecognition;

// Main application component
function App() {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [fontSize, setFontSize] = useState<number>(1);
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<View>("Dialogues");
  // For backwards compatibility with existing code
  const currentView = activeView;
  const setCurrentView = setActiveView;
  const [showPracticeScreen, setShowPracticeScreen] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);

  // Dialogues States
  const [dialoguesList, setDialoguesList] = useState<DialogueMeta[]>([]);
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(
    null
  );
  const [currentDialogueContent, setCurrentDialogueContent] =
    useState<Dialogue | null>(null);
  const [loadingDialogueContent, setLoadingDialogueContent] =
    useState<boolean>(false);
  const [loadingDialogues, setLoadingDialogues] = useState<boolean>(true);

  // Line states
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [showVocabHelp, setShowVocabHelp] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  // Add more learning tracking states
  const [completedDialogueIds, setCompletedDialogueIds] = useState<string[]>(
    []
  );
  const [practiceSessionCount, setPracticeSessionCount] = useState<number>(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState<number>(0);
  const [practiceSessionStartTime, setPracticeSessionStartTime] = useState<
    number | null
  >(null);
  const [learnedVocabularyIds, setLearnedVocabularyIds] = useState<string[]>(
    []
  );

  // Vocabulary
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([]);
  const [loadingVocabulary, setLoadingVocabulary] = useState<boolean>(true);

  // Progress
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(true);

  // Speech Recognition
  const speechRecognitionSupported =
    (typeof window !== "undefined" &&
      (window as any).SpeechRecognition !== undefined) ||
    (window as any).webkitSpeechRecognition !== undefined;

  const recognitionInstance = useRef<any | null>(null); // Use Ref for the instance, changed type to any
  const [lastFinalTranscript, setLastFinalTranscript] = useState<string>("");
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null);

  // Add Word Modal State
  const [showAddWordModal, setShowAddWordModal] = useState<boolean>(false);

  // Add pronunciation history state for tracking attempts
  const [pronunciationHistory, setPronunciationHistory] = useState<
    PronunciationAttempt[]
  >([]);

  const scriptsLoaded = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  // Assign global toast function
  useEffect(() => {
    showToast = (message, type = "info") => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToastState({ message, type, visible: true });
      toastTimerRef.current = window.setTimeout(() => {
        setToastState(null);
        toastTimerRef.current = null;
      }, 3000);
    };
    // Check speech recognition support on mount
    if (!browserSupportsSpeechRecognition) {
      showToast(
        "Speech recognition is not supported in your browser.",
        "error"
      );
    }
  }, []);

  // Initialize Speech Recognition Instance
  useEffect(() => {
    if (!speechRecognitionSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Turn off continuous listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = "en-US"; // Set language

    recognition.onresult = (event: any) => {
      let interim = "",
        final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        event.results[i].isFinal
          ? (final += event.results[i][0].transcript)
          : (interim += event.results[i][0].transcript);
      }

      setCurrentTranscript(interim);

      if (final && currentDialogueContent) {
        const target = currentDialogueContent.lines[currentLineIndex].line;
        const acc = accuracyPct(final, target);
        const res = { text: final, accuracy: acc };
        setSpeechResult(res);

        // Create record compatible with pronunciation history type
        const attempt: PronunciationAttempt = {
          expected: target,
          actual: final,
          similarity: acc,
          timestamp: Date.now(),
          isCorrect: acc >= 75, // Raise threshold to 75%
        };

        setPronunciationHistory((h) => [attempt, ...h]);

        if (acc >= 75) handleNextLine(); // Auto advance for 75% or higher
        else {
          showToast(`Almost! Try again. (${acc}% accuracy)`, "error");
        }
      }
    };

    recognition.onerror = () => setIsListening(false);

    recognition.onabort = () => {
      // If there was a partial recognition, add it to history
      if (
        currentTranscript &&
        currentTranscript.trim() &&
        currentDialogueContent
      ) {
        const target = currentDialogueContent.lines[currentLineIndex].line;
        const acc = accuracyPct(currentTranscript, target);

        const attempt: PronunciationAttempt = {
          expected: target,
          actual: currentTranscript + " (interrupted)",
          similarity: acc,
          timestamp: Date.now(),
          isCorrect: false,
        };

        setPronunciationHistory((h) => [attempt, ...h]);
      }
    };

    recognition.onend = () => {
      setIsListening(false); // setIsListening(false) is called here
      setCurrentTranscript("");
    };

    recognitionInstance.current = recognition;
  }, [currentDialogueContent, currentLineIndex, speechRecognitionSupported]);

  // Load CDNs & Initial Setup
  useEffect(() => {
    if (scriptsLoaded.current) return;

    const iconsLink = document.createElement("link");
    iconsLink.rel = "stylesheet";
    iconsLink.href = MATERIAL_ICONS_CDN_URL;
    document.head.appendChild(iconsLink);

    // Her zaman Tailwind yükle (geliştirme modunda)
    const twConfigScript = document.createElement("script");
    twConfigScript.innerHTML = tailwindConfig;
    twConfigScript.setAttribute("data-tailwind-config", "true");
    document.head.appendChild(twConfigScript);

    const twScript = document.createElement("script");
    twScript.src = TW_CDN_URL;
    twScript.async = true;
    twScript.onload = () => {
      console.log("Tailwind CDN loaded.");
      const savedMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedMode);
      document.documentElement.classList.toggle("dark", savedMode);
      setAppLoading(false); // App is ready after Tailwind loads
    };
    document.head.appendChild(twScript);

    scriptsLoaded.current = true;

    return () => {
      if (document.head.contains(iconsLink))
        document.head.removeChild(iconsLink);

      const twConfigScript = document.querySelector(
        "script[data-tailwind-config]"
      );
      const twScript = document.querySelector(`script[src="${TW_CDN_URL}"]`);

      if (twConfigScript && document.head.contains(twConfigScript))
        document.head.removeChild(twConfigScript);
      if (twScript && document.head.contains(twScript))
        document.head.removeChild(twScript);
    };
  }, []);

  // Load/Save Dark Mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      const isDark = savedMode === "true";
      // Only set state if it differs or on initial load where it might be default true/false
      if (darkMode !== isDark || appLoading) {
        setDarkMode(isDark);
      }
      document.documentElement.classList.toggle("dark", isDark);
    } else if (!appLoading) {
      // Only default to light if not loading and no saved pref
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [appLoading]); // Depend on appLoading to ensure initial setup

  useEffect(() => {
    if (!appLoading) {
      // Don't save during initial load
      localStorage.setItem("darkMode", darkMode.toString());
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode, appLoading]);

  // Load/Save Font Size
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      try {
        setFontSize(parseFloat(savedFontSize));
      } catch (error) {
        console.error("Error loading font size:", error);
        setFontSize(1);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString());
  }, [fontSize]);

  // Fetch Data based on View
  useEffect(() => {
    if (currentView === "Dialogues" && dialoguesList.length === 0) {
      setLoadingDialogues(true);
      fetchDialoguesMeta()
        .then((data) => setDialoguesList(data))
        .catch((err) => {
          console.error("Error fetching dialogues:", err);
          showToast("Failed to load dialogues", "error");
        })
        .finally(() => setLoadingDialogues(false));
    }
    if (currentView === "Vocabulary" && vocabularyList.length === 0) {
      setLoadingVocabulary(true);
      fetchVocabulary()
        .then((data) => setVocabularyList(data))
        .catch((err) => {
          console.error("Error fetching vocabulary:", err);
          showToast("Failed to load vocabulary", "error");
        })
        .finally(() => setLoadingVocabulary(false));
    }
    if (currentView === "Progress" && !progressData) {
      setLoadingProgress(true);
      fetchProgress()
        .then((data) => setProgressData(data))
        .catch((err) => {
          console.error("Error fetching progress:", err);
          showToast("Failed to load progress", "error");
        })
        .finally(() => setLoadingProgress(false));
    }
  }, [currentView, dialoguesList.length, vocabularyList.length, progressData]); // Include lengths to avoid dependency array warnings

  // --- Event Handlers --- //

  const handleOpenPractice = (dialogueId: string) => {
    setSelectedDialogueId(dialogueId); // Store ID using the correct setter
    setShowPracticeScreen(true);
    setLoadingDialogueContent(true);
    setCurrentLineIndex(0); // Reset line index
    setShowVocabHelp(false); // Reset vocab help
    setLastFinalTranscript(""); // Clear previous transcript
    setCurrentTranscript("");
    setRecognitionError(null);

    // Start tracking practice session time
    setPracticeSessionStartTime(Date.now());

    fetchDialogueContent(dialogueId)
      .then((data) => {
        if (data) {
          setCurrentDialogueContent(data);
          showToast(`Starting "${data.title}"`, "info");
        } else {
          throw new Error("Dialogue not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching dialogue content:", err);
        showToast("Failed to load dialogue practice", "error");
        setShowPracticeScreen(false); // Close screen on error
      })
      .finally(() => setLoadingDialogueContent(false));
  };

  const handleClosePractice = () => {
    if (isListening && recognitionInstance.current) {
      recognitionInstance.current.stop();
      setIsListening(false);
    }

    // Calculate average accuracy if there were any pronunciation attempts
    if (pronunciationHistory.length > 0 && currentDialogueContent) {
      const totalAccuracy = pronunciationHistory.reduce(
        (sum, attempt) => sum + attempt.similarity,
        0
      );
      const averageAccuracy = Math.round(
        totalAccuracy / pronunciationHistory.length
      );

      // Track completed dialogue if not already completed
      if (
        selectedDialogueId &&
        !completedDialogueIds.includes(selectedDialogueId)
      ) {
        setCompletedDialogueIds((prev) => [...prev, selectedDialogueId]);

        // Update progress data dynamically
        const title = currentDialogueContent.title;
        setProgressData((prev) => {
          if (!prev) return prev; // Null check

          const existingDialogueIndex = prev.accuracyByDialogue.findIndex(
            (item) => item.title === title
          );

          const newList = [...prev.accuracyByDialogue];

          // Update existing or add new entry
          if (existingDialogueIndex >= 0) {
            newList[existingDialogueIndex] = {
              ...newList[existingDialogueIndex],
              accuracy: Math.round(
                (newList[existingDialogueIndex].accuracy + averageAccuracy) / 2
              ),
            };
          } else {
            newList.push({ title, accuracy: averageAccuracy });
          }

          // Calculate new overall average
          const newOverall = Math.round(
            newList.reduce((sum, item) => sum + item.accuracy, 0) /
              newList.length
          );

          // Update completed dialogues count
          const updatedCompletedCount = completedDialogueIds.length + 1;

          return {
            ...prev,
            overallAccuracy: newOverall,
            completedDialogues: updatedCompletedCount,
            accuracyByDialogue: newList,
          };
        });
      }
    }

    // Calculate and update practice time
    if (practiceSessionStartTime !== null) {
      const sessionDuration = Math.round(
        (Date.now() - practiceSessionStartTime) / 1000
      );
      setTotalPracticeTime((prev) => prev + sessionDuration);
      setPracticeSessionStartTime(null);
    }

    // Add vocabulary words from the current dialogue to learned list
    if (currentDialogueContent) {
      const relevantVocab = vocabularyList.filter((word) =>
        currentDialogueContent.lines.some((line) =>
          line.line.toLowerCase().includes(word.word.toLowerCase())
        )
      );

      // Add to learned vocabulary if not already learned
      relevantVocab.forEach((word) => {
        if (!learnedVocabularyIds.includes(word.id)) {
          setLearnedVocabularyIds((prev) => [...prev, word.id]);
        }
      });

      // Also update the main vocabulary list as before
      setVocabularyList((prev) => {
        const newList = [...prev];
        const dialogueWords = vocabularyList.filter((word) =>
          currentDialogueContent.lines.some((line) =>
            line.line.toLowerCase().includes(word.word.toLowerCase())
          )
        );

        // Add words if they don't already exist in the list
        dialogueWords.forEach((newEntry) => {
          if (
            !newList.some(
              (v) => v.word.toLowerCase() === newEntry.word.toLowerCase()
            )
          ) {
            newList.push(newEntry as VocabularyWord);
          }
        });
        return newList;
      });
    }

    // Increment practice session count
    setPracticeSessionCount((prev) => prev + 1);

    // Clear states as before
    setSelectedDialogueId(null);
    setCurrentDialogueContent(null);
    setCurrentLineIndex(0);
    setShowVocabHelp(false);
    setPronunciationHistory([]);
    setCurrentTranscript("");
    setSpeechResult(null);
    setShowPracticeScreen(false);
  };

  // Native audio playback function
  const playNativeAudio = (txt: string) => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "en-US";
    u.rate = 0.9; // Slow down slightly for better comprehension
    window.speechSynthesis.speak(u);
  };

  // Audio playback (file or text-to-speech)
  const handlePlayLine = (line: DialogueLine) => {
    if (isListening) {
      showToast("Please stop listening before playing audio.", "info");
      return;
    }

    // Use the playAudio function which handles both audio file and text-to-speech
    playAudio(line.audioSrc, line.line)
      .then(() => {
        // Audio played successfully
      })
      .catch((error) => {
        console.error("Audio playback error:", error);
        showToast("Audio playback failed", "error");
      });
  };

  // Function to toggle speech recognition
  const handleToggleListening = () => {
    // Check if already listening and stop if so
    if (isListening) {
      if (recognitionInstance.current) {
        recognitionInstance.current.stop();
        setIsListening(false);
        showToast("Listening stopped", "info");
      }
      return;
    }

    // Check for Speech Recognition support
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in your browser", "error");
      return;
    }

    try {
      // Initialize new recognition instance
      recognitionInstance.current = new SpeechRecognition();

      if (recognitionInstance.current) {
        recognitionInstance.current.continuous = true; // Turn off continuous listening
        recognitionInstance.current.interimResults = true; // Show interim results
        recognitionInstance.current.lang = "en-US"; // Set language

        // Set up event handlers
        recognitionInstance.current.onstart = () => {
          setIsListening(true);
          showToast("Microphone is now active", "info");
        };

        recognitionInstance.current.onend = () => {
          // onend is called when recognition is stopped programmatically or times out
          setIsListening(false);
        };

        recognitionInstance.current.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            handleRecognitionResult(transcript);
          }
        };

        recognitionInstance.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          showToast(`Speech recognition error: ${event.error}`, "error");
        };

        // Start listening
        recognitionInstance.current.start();
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
      showToast("Failed to start speech recognition", "error");
    }
  };

  const handleRecordLine = () => {
    // Call toggle function directly to handle microphone
    handleToggleListening();
  };

  // Updated handler with 75% threshold and no auto-advance
  const handleRecognitionResult = (transcript: string) => {
    if (!currentDialogueContent) return;
    const currentLine = currentDialogueContent.lines[currentLineIndex];

    // Only process results for user lines
    if (currentLine.speaker !== "You") return;

    const expectedLine = currentLine.line;
    console.log("Expected:", expectedLine);
    console.log("Recognized:", transcript);

    // Calculate similarity with 75% threshold
    const similarity = accuracyPct(expectedLine, transcript);
    const isMatch = similarity >= 75; // 75% or above is considered correct

    // Create new pronunciation attempt record
    const attempt: PronunciationAttempt = {
      expected: expectedLine,
      actual: transcript,
      similarity,
      timestamp: Date.now(),
      isCorrect: isMatch,
    };

    // Update pronunciation history
    setPronunciationHistory((prev) => [attempt, ...prev]);

    // Update the current speech result
    setSpeechResult({
      text: transcript,
      accuracy: similarity,
    });

    // Set current transcript
    setCurrentTranscript(transcript);

    if (isMatch) {
      showToast(`Correct! (${similarity.toFixed(1)}% match)`, "success");
      // Play success sound if available
      playSound("success");

      // Automatically move to the next line after a short delay
      setTimeout(() => {
        handleNextLine();
      }, 1500);
    } else {
      showToast(`Try again! (${similarity.toFixed(1)}% match)`, "error");
      // Play error sound if available
      playSound("error");

      // Don't advance to the next line - keep mic active
      // The user will need to try again
    }
  };

  const handleNextLine = () => {
    if (!currentDialogueContent) return;

    if (currentLineIndex < currentDialogueContent.lines.length - 1) {
      // Move to next line
      setCurrentLineIndex(currentLineIndex + 1);
      setShowVocabHelp(false);
      setSpeechResult(null);
      setCurrentTranscript("");
    } else {
      // Dialogue completed
      showToast("Dialogue completed!", "success");

      // Stop listening
      if (isListening && recognitionInstance.current) {
        recognitionInstance.current.stop();
      }

      // Close overlay
      setTimeout(handleClosePractice, 1500);
    }
  };

  const handlePlayPronunciation = (word: VocabularyWord) => {
    if (word.audioSrc) {
      playAudio(word.audioSrc, word.word).catch((error: Error) => {
        console.error("Audio playback error:", error);
        showToast("Audio playback failed", "error");
      });
    } else {
      // Use the word itself as fallback for text-to-speech
      playAudio(undefined, word.word).catch((error: Error) => {
        console.error("Text-to-speech error:", error);
        showToast("Text-to-speech failed", "error");
      });
    }
  };

  const handleAddNewWord = async (formData: Omit<VocabularyWord, "id">) => {
    try {
      const newWord = await saveWord(formData);
      setVocabularyList((prev) => [...prev, newWord]); // Update state immediately
      showToast(`"${newWord.word}" added successfully!`, "success");
      setShowAddWordModal(false);
    } catch (error) {
      console.error("Failed to save word:", error);
      showToast("Failed to save word.", "error");
    }
  };

  // --- Render Functions --- //

  // Loading Skeleton Component (Simple Example)
  const renderSkeletonCard = (count = 1) =>
    Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`p-6 rounded-2xl animate-pulse ${
          darkMode ? "bg-neutral-800/70" : "bg-neutral-200/70"
        } shadow-smooth border ${
          darkMode ? "border-neutral-700/40" : "border-neutral-300/40"
        }`}
      >
        <div
          className={`h-8 w-1/3 rounded mb-4 ${
            darkMode ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        ></div>
        <div
          className={`h-4 w-full rounded mb-2 ${
            darkMode ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        ></div>
        <div
          className={`h-4 w-2/3 rounded ${
            darkMode ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        ></div>
      </div>
    ));
  const renderListSkeleton = (count = 3) =>
    Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`p-5 rounded-xl animate-pulse ${
          darkMode ? "bg-neutral-800/60" : "bg-neutral-100/80"
        } shadow-smooth border ${
          darkMode ? "border-neutral-700/40" : "border-neutral-300/40"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <div
            className={`h-5 w-1/4 rounded ${
              darkMode ? "bg-neutral-700" : "bg-neutral-300"
            }`}
          ></div>
          <div
            className={`h-6 w-6 rounded-full ${
              darkMode ? "bg-neutral-700" : "bg-neutral-300"
            }`}
          ></div>
        </div>
        <div
          className={`h-4 w-full rounded mb-2 ${
            darkMode ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        ></div>
        <div
          className={`h-4 w-4/5 rounded ${
            darkMode ? "bg-neutral-700" : "bg-neutral-300"
          }`}
        ></div>
      </div>
    ));

  // Dialogue Practice Screen
  const renderDialoguePracticeScreen = () => {
    if (!showPracticeScreen) return null;

    if (loadingDialogueContent || !currentDialogueContent) {
      return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="animate-spin rounded-full h-14 w-14 border-3 border-transparent border-t-brand border-b-brand"></div>
        </div>
      );
    }

    const currentLine = currentDialogueContent.lines[currentLineIndex];

    // Enhanced vocabulary matching using keywords and content
    const relevantVocab = vocabularyList
      .filter((v) => {
        // Check if word appears directly in the line
        if (currentLine.line.toLowerCase().includes(v.word.toLowerCase())) {
          return true;
        }

        // Check for keyword matches
        if (
          v.keywords &&
          v.keywords.some((keyword) =>
            currentLine.line.toLowerCase().includes(keyword.toLowerCase())
          )
        ) {
          return true;
        }

        return false;
      })
      .slice(0, 3); // Limit to 3 most relevant words

    // If no matches, provide a few general vocabulary items as fallback
    const fallbackVocab = vocabularyList.slice(0, 3);

    // Use only one handleRecognitionResult function
    // We're removing the inner function here

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div
          className={`relative max-w-2xl w-full rounded-2xl p-6 md:p-8 shadow-xl border ${
            darkMode
              ? "bg-neutral-800 border-brand-dark/50"
              : "bg-white border-brand-light/30"
          } transition-transform duration-300 animate-scale-in`}
        >
          <button
            onClick={handleClosePractice}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              darkMode
                ? "text-neutral-400 hover:bg-neutral-700 hover:text-white"
                : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
            }`}
            aria-label="Close practice"
          >
            <span className="material-icons-outlined">close</span>
          </button>

          <h2 className="text-2xl font-serif font-semibold mb-2 bg-gradient-to-r from-brand to-emerald-500 text-transparent bg-clip-text tracking-tight">
            {currentDialogueContent.title}
          </h2>
          <p
            className={`text-sm mb-6 ${
              darkMode ? "text-neutral-400" : "text-neutral-500"
            }`}
          >{`Line ${currentLineIndex + 1} of ${
            currentDialogueContent.lines.length
          }`}</p>

          <div className="relative">
            <div
              className={`flex items-center p-2 ${
                darkMode
                  ? "bg-neutral-800 border-b border-brand/40"
                  : "bg-white border-b border-brand/40"
              } sticky top-0 mb-4 backdrop-blur-md bg-opacity-80 z-10`}
            >
              {/* Toggle vocabulary help - KEEP THIS ONE */}
              <button
                onClick={() => setShowVocabHelp(!showVocabHelp)}
                className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                  showVocabHelp
                    ? "bg-brand text-white"
                    : darkMode
                    ? "text-neutral-300 hover:text-brand"
                    : "text-neutral-600 hover:text-brand"
                }`}
              >
                <span className="material-icons-outlined text-sm">
                  {showVocabHelp ? "visibility_off" : "visibility"}
                </span>
                <span>{showVocabHelp ? "Hide" : "Show"} Word Help</span>
              </button>

              <div className="ml-auto flex gap-2">
                {/* Add filters or other controls here as needed */}
              </div>
            </div>

            {/* Dialogue Display */}
            <div className="space-y-4 min-h-[150px] mb-6 flex flex-col justify-center">
              <div
                className={`flex gap-3 items-start ${
                  currentLine.speaker === "You" ? "justify-end" : ""
                }`}
              >
                {currentLine.speaker !== "You" && (
                  <span
                    className={`material-icons-outlined text-2xl mt-1 ${
                      darkMode ? "text-brand" : "text-brand"
                    }`}
                  >
                    {currentLine.speaker === "Barista"
                      ? "storefront"
                      : "person_pin_circle"}
                  </span>
                )}
                <div
                  className={`p-4 rounded-lg max-w-[80%] shadow-md ${
                    currentLine.speaker === "You"
                      ? darkMode
                        ? "bg-brand/20 border border-brand/30"
                        : "bg-brand/10 border border-brand/20"
                      : darkMode
                      ? "bg-neutral-700/80"
                      : "bg-neutral-100/80"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${
                      darkMode ? "text-brand" : "text-brand-dark"
                    }`}
                  >
                    {currentLine.speaker}
                  </p>
                  <p
                    className={`text-lg ${
                      darkMode ? "text-neutral-100" : "text-neutral-900"
                    } ${
                      currentLine.speaker === "You"
                        ? "text-brand-dark dark:text-brand"
                        : ""
                    }`}
                  >
                    {currentLine.speaker === "You" && isListening
                      ? currentTranscript || "Listening..."
                      : currentLine.line}
                  </p>

                  {/* Speech result display */}
                  {speechResult && currentLine.speaker === "You" && (
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="relative w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `conic-gradient(${
                            speechResult.accuracy >= 75
                              ? darkMode
                                ? "#22c55e"
                                : "#16a34a"
                              : speechResult.accuracy >= 65
                              ? darkMode
                                ? "#eab308"
                                : "#ca8a04"
                              : darkMode
                              ? "#ef4444"
                              : "#dc2626"
                          } ${speechResult.accuracy}%, transparent 0)`,
                        }}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            darkMode ? "bg-neutral-800" : "bg-white"
                          }`}
                        >
                          {Math.round(speechResult.accuracy)}%
                        </div>
                      </div>
                      <p
                        className={`text-sm ${
                          speechResult.accuracy >= 75
                            ? darkMode
                              ? "text-green-400 font-medium"
                              : "text-green-600 font-medium"
                            : speechResult.accuracy >= 65
                            ? darkMode
                              ? "text-amber-400 font-medium"
                              : "text-amber-600 font-medium"
                            : darkMode
                            ? "text-red-400 font-medium"
                            : "text-red-600 font-medium"
                        }`}
                      >
                        <span className="material-icons-outlined text-xs align-middle mr-1">
                          record_voice_over
                        </span>{" "}
                        "{speechResult.text}"
                      </p>
                    </div>
                  )}

                  {/* Show transcript below if it was the user speaking and not currently listening */}
                  {currentLine.speaker === "You" &&
                    !isListening &&
                    currentTranscript && (
                      <p
                        className={`text-sm mt-2 p-2 rounded ${
                          darkMode
                            ? "bg-neutral-600/50 text-neutral-300"
                            : "bg-neutral-200/50 text-neutral-600"
                        }`}
                      >
                        <i>You said: {currentTranscript}</i>
                      </p>
                    )}
                  {/* Show recognition error */}
                  {currentLine.speaker === "You" && recognitionError && (
                    <p className={`text-sm mt-2 text-error`}>
                      {recognitionError}
                    </p>
                  )}
                </div>
                {currentLine.speaker === "You" && (
                  <span
                    className={`material-icons-outlined text-2xl mt-1 ${
                      darkMode ? "text-brand" : "text-brand"
                    }`}
                  >
                    person
                  </span>
                )}
              </div>
            </div>

            {/* Target sentence display - always show what the user needs to say */}
            {currentLine.speaker === "You" && (
              <div className="p-4 mb-4 rounded-lg border border-brand/30 bg-brand/5 text-center">
                <p className="text-sm font-medium text-brand-dark dark:text-brand-light mb-1">
                  Your target sentence:
                </p>
                <p className="text-lg font-medium">"{currentLine.line}"</p>
              </div>
            )}

            {/* Vocabulary Help - new design */}
            <div className="relative my-3">
              {!showVocabHelp ? (
                <button
                  onClick={() => setShowVocabHelp(true)}
                  className="mx-auto flex items-center gap-1 px-3 py-1.5 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-full text-sm font-medium shadow-sm hover:shadow transform hover:scale-105 transition-all duration-200"
                ></button>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-brand dark:text-brand-light">
                      Relevant Vocabulary
                    </h3>
                    <button
                      onClick={() => setShowVocabHelp(false)}
                      className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      <span className="material-icons-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>

                  <div className="max-h-[35vh] md:max-h-none overflow-y-auto p-3">
                    {relevantVocab.length > 0 ? (
                      <div className="space-y-2">
                        {relevantVocab.map((word) => (
                          <div
                            key={word.id}
                            className={`p-2 rounded-lg ${
                              darkMode
                                ? "bg-neutral-700/50"
                                : "bg-neutral-100/60"
                            } hover:bg-brand/5 transition-colors`}
                          >
                            <div className="grid grid-cols-12 gap-2 items-start">
                              <div className="col-span-4">
                                <div className="flex items-center">
                                  <span className="font-medium text-brand dark:text-brand-light">
                                    {word.word}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handlePlayPronunciation(word)
                                    }
                                    className="ml-1 text-brand/70 dark:text-brand-light/70 hover:text-brand hover:dark:text-brand-light"
                                  >
                                    <span className="material-icons-outlined text-xs">
                                      volume_up
                                    </span>
                                  </button>
                                </div>
                              </div>
                              <div className="col-span-8">
                                <p
                                  className={`text-xs ${
                                    darkMode
                                      ? "text-neutral-300"
                                      : "text-neutral-600"
                                  }`}
                                >
                                  {word.definition}
                                  <span
                                    className={`block mt-1 text-[10px] italic ${
                                      darkMode
                                        ? "text-neutral-400"
                                        : "text-neutral-500"
                                    }`}
                                  >
                                    {word.context}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`p-3 rounded-lg text-center ${
                          darkMode ? "bg-neutral-700/50" : "bg-neutral-100/60"
                        }`}
                      >
                        <p className="text-sm text-neutral-400">
                          No words found for this line.
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {fallbackVocab.slice(0, 2).map((word) => (
                            <div key={word.id} className="p-2 rounded text-xs">
                              <span className="font-medium text-brand dark:text-brand-light block">
                                {word.word}
                              </span>
                              <span className="text-xs line-clamp-1">
                                {word.definition}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Controls - Redesigned fixed layout */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6 border-t pt-8 border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => handlePlayLine(currentLine)}
                className={`flex items-center gap-1 py-2 px-3 rounded-lg transition-all shadow-sm ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                    : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95`}
              >
                <span className="material-icons-outlined text-xl">
                  {currentLine.audioSrc ? "play_circle" : "volume_up"}
                </span>
                <span className="text-sm font-medium">Listen Line</span>
              </button>

              {currentLine.recordable && (
                <button
                  onClick={handleToggleListening}
                  disabled={!speechRecognitionSupported}
                  className={`relative flex items-center gap-1 py-3 px-4 rounded-lg transition-all shadow-lg ${
                    isListening
                      ? "bg-red-500 text-white scale-105"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening ? "animate-pulse-mic" : ""
                  } z-20`}
                >
                  <span className="material-icons-outlined text-xl">
                    {isListening ? "stop_circle" : "mic"}
                  </span>
                  <span className="text-sm font-medium">
                    {isListening ? "Stop" : " Speak"}
                  </span>
                </button>
              )}

              {/* Show "Finish" button on the last line */}
              {currentLineIndex ===
              (currentDialogueContent?.lines.length || 0) - 1 ? (
                <button
                  onClick={() => {
                    showToast("Dialog Completed!", "success");
                    setTimeout(handleClosePractice, 800);
                  }}
                  disabled={
                    !!(
                      isListening ||
                      (currentLine.speaker === "You" &&
                        speechResult &&
                        speechResult.accuracy < 60)
                    )
                  }
                  className={`flex items-center gap-1 py-2 px-3 rounded-lg transition-all shadow-sm ${
                    darkMode
                      ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  } focus:outline-none focus:ring-2 focus:ring-green-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="material-icons-outlined text-xl">
                    check_circle
                  </span>
                  <span className="text-sm font-medium">Finish</span>
                </button>
              ) : (
                <>
                  {/* Low accuracy "Try Again" button */}
                  {currentLine.speaker === "You" &&
                    speechResult &&
                    speechResult.accuracy < 60 && (
                      <button
                        onClick={() => {
                          setSpeechResult(null);
                          setCurrentTranscript("");
                          handleToggleListening();
                        }}
                        className={`flex items-center gap-1 py-2 px-3 rounded-lg transition-all shadow-sm ${
                          darkMode
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                            : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-95`}
                      >
                        <span className="material-icons-outlined text-xl">
                          autorenew
                        </span>
                        <span className="text-sm font-medium">Try Again</span>
                      </button>
                    )}

                  <button
                    onClick={handleNextLine}
                    disabled={
                      !!(
                        isListening ||
                        (currentLine.speaker === "You" &&
                          speechResult &&
                          speechResult.accuracy < 60)
                      )
                    }
                    className={`flex items-center gap-1 py-2 px-3 rounded-lg transition-all shadow-sm ${
                      darkMode
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={
                      currentLine.speaker === "You" &&
                      speechResult &&
                      speechResult.accuracy < 60
                        ? "Minimum 60% accuracy required to continue"
                        : ""
                    }
                  >
                    <span className="material-icons-outlined text-xl">
                      skip_next
                    </span>
                    <span className="text-sm font-medium">Next Line</span>
                  </button>
                </>
              )}
            </div>

            {/* Pronunciation history panel */}
            {pronunciationHistory.length > 0 && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  darkMode
                    ? "bg-neutral-800/80 border-neutral-700"
                    : "bg-white/80 border-neutral-200"
                }`}
              >
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <span className="material-icons-outlined text-sm">
                    history
                  </span>
                  Pronunciation History
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {pronunciationHistory.map((attempt, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-md text-sm ${
                        attempt.similarity >= 75
                          ? darkMode
                            ? "bg-green-800/30 border border-green-700/30"
                            : "bg-green-100 border border-green-200"
                          : attempt.similarity >= 65
                          ? darkMode
                            ? "bg-amber-800/30 border border-amber-700/30"
                            : "bg-amber-100 border border-amber-200"
                          : darkMode
                          ? "bg-red-800/30 border border-red-700/30"
                          : "bg-red-100 border border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`${
                            darkMode ? "text-neutral-300" : "text-neutral-600"
                          }`}
                        >
                          "{attempt.actual}"
                        </span>
                        <div
                          className="relative w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `conic-gradient(${
                              attempt.similarity >= 75
                                ? darkMode
                                  ? "#22c55e"
                                  : "#16a34a"
                                : attempt.similarity >= 65
                                ? darkMode
                                  ? "#eab308"
                                  : "#ca8a04"
                                : darkMode
                                ? "#ef4444"
                                : "#dc2626"
                            } ${attempt.similarity}%, transparent 0)`,
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              darkMode ? "bg-neutral-800" : "bg-white"
                            }`}
                          >
                            {Math.round(attempt.similarity)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remove the third Word Help button and related elements */}

            {/* Pronunciation accuracy alert for minimum 65% threshold */}
            {currentLine.speaker === "You" && (
              <div className="mt-4 text-center text-sm">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Minimum 65% accuracy required to proceed to next line.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Dialogues View
  const renderDialogues = () => {
    return (
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
          <span
            className={`material-icons-outlined mr-4 text-5xl ${
              darkMode ? "text-brand" : "text-brand"
            } drop-shadow`}
          >
            record_voice_over
          </span>
          Dialogue Practice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingDialogues
            ? renderSkeletonCard(6)
            : dialoguesList.map((dialogue) => (
                <button
                  key={dialogue.id}
                  onClick={() => handleOpenPractice(dialogue.id)}
                  className={`p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary ${
                    darkMode
                      ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50 backdrop-blur-sm hover:bg-neutral-700/80 focus:ring-offset-neutral-900"
                      : "bg-white/90 shadow-card border border-neutral-200/70 backdrop-blur-sm hover:bg-white focus:ring-offset-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`material-icons-outlined text-4xl ${
                        darkMode ? "text-brand-light" : "text-brand"
                      }`}
                    >
                      {dialogue.icon}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dialogue.difficulty === "Easy"
                          ? darkMode
                            ? "bg-green-700/40 text-green-300"
                            : "bg-green-100 text-green-800"
                          : dialogue.difficulty === "Medium"
                          ? darkMode
                            ? "bg-yellow-700/40 text-yellow-300"
                            : "bg-yellow-100 text-yellow-800"
                          : darkMode
                          ? "bg-red-700/40 text-red-300"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dialogue.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-brand-text-dark dark:text-brand-text-light">
                    {dialogue.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Practice a real-world conversation about{" "}
                    {dialogue.title.toLowerCase()}.
                  </p>
                </button>
              ))}
        </div>
      </section>
    );
  };

  // Add Word Modal
  const AddWordModal = ({
    onClose,
    onAdd,
  }: {
    onClose: () => void;
    onAdd: (data: Omit<VocabularyWord, "id">) => void;
  }) => {
    const [wordData, setWordData] = useState({
      word: "",
      definition: "",
      context: "",
      pronunciation: "",
      keywords: [] as string[], // Add the keywords array property
    });

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setWordData({
        ...wordData,
        [name]: value,
      });
    };

    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const keywordsString = e.target.value;
      // Split the comma-separated string into an array of keywords
      const keywordsArray = keywordsString
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
      setWordData({
        ...wordData,
        keywords: keywordsArray,
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      onAdd(wordData);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div
          className={`relative max-w-md w-full rounded-2xl p-6 shadow-xl border ${
            darkMode
              ? "bg-neutral-800 border-neutral-700"
              : "bg-white border-neutral-200"
          } transition-transform duration-300 animate-scale-in`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              darkMode
                ? "text-neutral-400 hover:bg-neutral-700 hover:text-white"
                : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
            }`}
            aria-label="Close modal"
          >
            <span className="material-icons-outlined">close</span>
          </button>

          <h2 className="text-2xl font-serif font-semibold mb-6 text-brand-text-dark dark:text-brand-text-light tracking-tight">
            Add New Word
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Word input */}
            <div>
              <label
                htmlFor="word"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Word
              </label>
              <input
                type="text"
                id="word"
                name="word"
                required
                value={wordData.word}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-900"
                } focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>

            {/* Definition input */}
            <div>
              <label
                htmlFor="definition"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Definition
              </label>
              <textarea
                id="definition"
                name="definition"
                required
                value={wordData.definition}
                onChange={handleInputChange}
                rows={2}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-900"
                } focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>

            {/* Context input */}
            <div>
              <label
                htmlFor="context"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Example Sentence
              </label>
              <textarea
                id="context"
                name="context"
                value={wordData.context}
                onChange={handleInputChange}
                rows={1}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-900"
                } focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>

            {/* Pronunciation input */}
            <div>
              <label
                htmlFor="pronunciation"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Pronunciation
              </label>
              <input
                type="text"
                id="pronunciation"
                name="pronunciation"
                value={wordData.pronunciation}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-900"
                } focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>

            {/* Keywords input - new field */}
            <div>
              <label
                htmlFor="keywords"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                placeholder="e.g. food, drink, restaurant"
                onChange={handleKeywordsChange}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-neutral-300 text-neutral-900"
                } focus:ring-2 focus:ring-brand focus:border-brand`}
              />
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Add words that might be related or appear in the same context
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-md transition-colors ${
                  darkMode
                    ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
              >
                Add Word
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Vocabulary View
  const renderVocabulary = () => {
    return (
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
          <span
            className={`material-icons-outlined mr-4 text-5xl ${
              darkMode ? "text-secondary" : "text-secondary"
            } drop-shadow`}
          >
            translate
          </span>
          Vocabulary List
        </h2>

        <div className="space-y-4">
          {loadingVocabulary
            ? renderListSkeleton(5)
            : vocabularyList.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl transition-all duration-300 border ${
                    darkMode
                      ? "bg-neutral-800/80 border-neutral-700/60 backdrop-blur-sm"
                      : "bg-white/80 border-neutral-200/80 backdrop-blur-sm"
                  } shadow-smooth hover:shadow-smooth-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-brand-text-dark dark:text-brand-text-light">
                      {item.word}
                    </h3>
                    <button
                      onClick={() => handlePlayPronunciation(item)}
                      disabled={!item.audioSrc}
                      className={`p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        darkMode
                          ? "text-neutral-400 hover:bg-neutral-700"
                          : "text-neutral-500 hover:bg-neutral-200"
                      }`}
                      aria-label="Pronounce word"
                    >
                      <span className="material-icons-outlined text-lg">
                        {item.audioSrc ? "volume_up" : "volume_off"}
                      </span>
                    </button>
                  </div>
                  <p
                    className={`text-sm italic ${
                      darkMode ? "text-neutral-400" : "text-neutral-500"
                    } mb-2`}
                  >
                    {item.pronunciation || "-"}
                  </p>
                  <p
                    className={`text-base ${
                      darkMode ? "text-neutral-300" : "text-neutral-700"
                    } mb-3`}
                  >
                    {item.definition}
                  </p>
                  {item.context && (
                    <p
                      className={`text-sm border-l-2 pl-3 ${
                        darkMode
                          ? "text-neutral-400 border-brand/50"
                          : "text-neutral-600 border-brand/70"
                      }`}
                    >
                      <i>"{item.context}"</i>
                    </p>
                  )}
                </div>
              ))}
          {vocabularyList.length === 0 && !loadingVocabulary && (
            <p
              className={`text-center py-10 ${
                darkMode ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Your vocabulary list is empty.
            </p>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setShowAddWordModal(true)}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-button hover:shadow-button-hover mx-auto ${
              darkMode
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-secondary text-white hover:bg-secondary/90"
            }`}
          >
            <span className="material-icons-outlined text-sm">add</span>
            Add New Word
          </button>
        </div>
        {showAddWordModal && (
          <AddWordModal
            onClose={() => setShowAddWordModal(false)}
            onAdd={handleAddNewWord}
          />
        )}
      </section>
    );
  };

  // Progress View
  const renderProgress = () => {
    if (loadingProgress || !progressData) {
      return (
        <section className="max-w-4xl mx-auto px-4 py-10 space-y-10">
          <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
            <span
              className={`material-icons-outlined mr-4 text-5xl ${
                darkMode ? "text-accent" : "text-accent"
              } drop-shadow`}
            >
              assessment
            </span>
            Your Progress
          </h2>
          {/* Skeleton for progress cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-2xl animate-pulse ${
              darkMode ? "bg-neutral-800/70" : "bg-neutral-200/70"
            } shadow-smooth border ${
              darkMode ? "border-neutral-700/40" : "border-neutral-300/40"
            }`}
          >
            <div className="flex flex-col items-center justify-center p-4">
              <div
                className={`h-4 w-1/2 rounded mb-4 ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              ></div>
              <div
                className={`h-32 w-32 rounded-full ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                } mb-2`}
              ></div>
              <div
                className={`h-4 w-1/4 rounded ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              ></div>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div
                className={`h-4 w-1/2 rounded mb-4 ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              ></div>
              <div
                className={`h-2.5 w-full rounded-full ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                } mb-3`}
              ></div>
              <div
                className={`h-6 w-1/3 rounded mb-2 ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              ></div>
              <div
                className={`h-4 w-1/4 rounded ${
                  darkMode ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              ></div>
            </div>
          </div>
          <div
            className={`p-8 rounded-2xl animate-pulse ${
              darkMode ? "bg-neutral-800/70" : "bg-neutral-200/70"
            } shadow-smooth border ${
              darkMode ? "border-neutral-700/40" : "border-neutral-300/40"
            }`}
          >
            <div
              className={`h-6 w-1/3 rounded mb-6 ${
                darkMode ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            ></div>
            <div className="space-y-3">
              <div
                className={`h-10 w-full rounded-lg ${
                  darkMode ? "bg-neutral-700/50" : "bg-neutral-300/50"
                }`}
              ></div>
              <div
                className={`h-10 w-full rounded-lg ${
                  darkMode ? "bg-neutral-700/50" : "bg-neutral-300/50"
                }`}
              ></div>
              <div
                className={`h-10 w-full rounded-lg ${
                  darkMode ? "bg-neutral-700/50" : "bg-neutral-300/50"
                }`}
              ></div>
            </div>
          </div>
        </section>
      );
    }

    const completionPercentage =
      (progressData.completedDialogues / progressData.totalDialogues) * 100;
    const dialoguesNotStarted = dialoguesList.filter(
      (meta) =>
        !progressData.accuracyByDialogue.some((acc) => acc.title === meta.title)
    );

    return (
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
          <span
            className={`material-icons-outlined mr-4 text-5xl ${
              darkMode ? "text-accent" : "text-accent"
            } drop-shadow`}
          >
            assessment
          </span>
          Your Progress
        </h2>

        {/* Overall Stats Card */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-2xl transition-all duration-300 ${
            darkMode
              ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50 backdrop-blur-sm"
              : "bg-white/90 shadow-card border border-neutral-200/70 backdrop-blur-sm"
          }`}
        >
          {/* Overall Accuracy */}
          <div className="flex flex-col items-center justify-center p-4">
            <p
              className={`text-sm font-medium mb-2 ${
                darkMode ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Overall Pronunciation
            </p>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className={`stroke-current ${
                    darkMode ? "text-neutral-700" : "text-neutral-200"
                  }`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                ></path>
                <path
                  className={`stroke-current ${
                    darkMode ? "text-accent" : "text-accent"
                  }`}
                  strokeDasharray={`${progressData.overallAccuracy}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                ></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-3xl font-bold ${
                    darkMode ? "text-accent-light" : "text-accent-dark"
                  }`}
                >
                  {progressData.overallAccuracy}%
                </span>
              </div>
            </div>
            <p
              className={`text-sm mt-2 ${
                darkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Accuracy
            </p>
          </div>

          {/* Completion Progress */}
          <div className="flex flex-col items-center justify-center p-4">
            <p
              className={`text-sm font-medium mb-2 ${
                darkMode ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Dialogues Completed
            </p>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-secondary h-2.5 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p
              className={`text-xl font-bold ${
                darkMode ? "text-secondary-light" : "text-secondary-dark"
              } mb-1`}
            >
              {progressData.completedDialogues} / {progressData.totalDialogues}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Completed
            </p>
          </div>
        </div>

        {/* Accuracy per Dialogue Card */}
        <div
          className={`p-8 rounded-2xl transition-all duration-300 ${
            darkMode
              ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50 backdrop-blur-sm"
              : "bg-white/90 shadow-card border border-neutral-200/70 backdrop-blur-sm"
          }`}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-brand-text-dark dark:text-brand-text-light">
            <span className="material-icons-outlined text-brand">
              checklist
            </span>{" "}
            Accuracy Breakdown
          </h3>
          <ul className="space-y-3">
            {progressData.accuracyByDialogue.map((item, index) => (
              <li
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? "bg-neutral-700/50" : "bg-neutral-100/70"
                }`}
              >
                <span
                  className={`text-base font-medium ${
                    darkMode ? "text-neutral-200" : "text-neutral-800"
                  }`}
                >
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold text-sm ${
                      item.accuracy >= 75
                        ? darkMode
                          ? "text-success"
                          : "text-success"
                        : item.accuracy >= 65
                        ? darkMode
                          ? "text-yellow-400"
                          : "text-yellow-600"
                        : darkMode
                        ? "text-error"
                        : "text-error"
                    }`}
                  >
                    {item.accuracy}%
                  </span>
                  <span
                    className={`material-icons-outlined text-lg ${
                      item.accuracy >= 75
                        ? darkMode
                          ? "text-success"
                          : "text-success"
                        : item.accuracy >= 65
                        ? darkMode
                          ? "text-yellow-400"
                          : "text-yellow-600"
                        : darkMode
                        ? "text-error"
                        : "text-error"
                    }`}
                  >
                    {item.accuracy >= 85
                      ? "sentiment_very_satisfied"
                      : item.accuracy >= 75
                      ? "sentiment_satisfied"
                      : item.accuracy >= 65
                      ? "sentiment_neutral"
                      : "sentiment_dissatisfied"}
                  </span>
                </div>
              </li>
            ))}
            {dialoguesNotStarted.map((item, index) => (
              <li
                key={`not-started-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode
                    ? "bg-neutral-700/30 opacity-60"
                    : "bg-neutral-100/50 opacity-60"
                }`}
              >
                <span
                  className={`text-base font-medium ${
                    darkMode ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-neutral-500" : "text-neutral-400"
                  }`}
                >
                  Not Started
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  // Settings View with added PronunciationLevels component
  const renderSettings = () => (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
        <span
          className={`material-icons-outlined mr-4 text-5xl ${
            darkMode ? "text-brand" : "text-brand"
          } drop-shadow`}
        >
          settings
        </span>
        Settings
      </h2>

      <div
        className={`p-6 rounded-2xl ${
          darkMode
            ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50"
            : "bg-white/90 shadow-card border border-neutral-200/70"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-icons-outlined">color_lens</span>
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-xl">dark_mode</span>
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600`}
            ></div>
          </label>
        </div>
      </div>

      {/* New PronunciationLevels component */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode
            ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50"
            : "bg-white/90 shadow-card border border-neutral-200/70"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-icons-outlined">record_voice_over</span>
          Pronunciation Difficulty Levels
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                level: "Beginner",
                description:
                  "Simple words and phrases, very forgiving accuracy (60%)",
                color: "green",
                threshold: 60,
              },
              {
                level: "Elementary",
                description:
                  "Basic sentences, somewhat forgiving accuracy (70%)",
                color: "teal",
                threshold: 70,
              },
              {
                level: "Intermediate",
                description: "Moderate complexity, standard accuracy (75%)",
                color: "blue",
                threshold: 75,
              },
              {
                level: "Advanced",
                description:
                  "Complex sentences, high accuracy requirement (85%)",
                color: "purple",
                threshold: 85,
              },
              {
                level: "Expert",
                description:
                  "Natural conversation speed, very high accuracy (95%)",
                color: "red",
                threshold: 95,
              },
            ].map((item) => (
              <div
                key={item.level}
                className={`p-4 rounded-lg border ${
                  darkMode
                    ? `bg-${item.color}-900/20 border-${item.color}-700/30`
                    : `bg-${item.color}-50 border-${item.color}-200`
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4
                    className={`font-medium text-${item.color}-${
                      darkMode ? "400" : "700"
                    }`}
                  >
                    {item.level}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold bg-${
                      item.color
                    }-${darkMode ? "800/40" : "100"} text-${item.color}-${
                      darkMode ? "300" : "800"
                    }`}
                  >
                    {item.threshold}%
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Current Difficulty Level</p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Used for all pronunciation exercises
                </p>
              </div>
              <select
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-neutral-700 border-neutral-600 text-neutral-200"
                    : "bg-white border-neutral-300 text-neutral-700"
                }`}
                defaultValue="intermediate"
              >
                <option value="beginner">Beginner (60%)</option>
                <option value="elementary">Elementary (70%)</option>
                <option value="intermediate">Intermediate (75%)</option>
                <option value="advanced">Advanced (85%)</option>
                <option value="expert">Expert (95%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-2xl ${
          darkMode
            ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50"
            : "bg-white/90 shadow-card border border-neutral-200/70"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-icons-outlined">speaker_notes</span>
          Speech Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-xl">speed</span>
              <p>Speech Rate</p>
            </div>
            <select
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-neutral-700 border-neutral-600 text-neutral-200"
                  : "bg-white border-neutral-300 text-neutral-700"
              }`}
            >
              <option value="0.7">Slow</option>
              <option value="0.85">Normal</option>
              <option value="1">Fast</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-xl">
                auto_stories
              </span>
              <p>Auto Play Dialogue</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div
                className={`w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600`}
              ></div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );

  // Profile Page
  const renderProfile = () => (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
        <span
          className={`material-icons-outlined mr-4 text-5xl ${
            darkMode ? "text-accent drop-shadow-md" : "text-accent drop-shadow"
          }`}
        >
          person
        </span>
        Profile
      </h2>

      {/* Profile Header Card */}
      <div
        className={`p-8 rounded-2xl transition-all duration-300 ${
          darkMode
            ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50 backdrop-blur-sm"
            : "bg-white/90 shadow-card border border-neutral-200/70 backdrop-blur-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar */}
          <div
            className={`relative w-28 h-28 rounded-full overflow-hidden border-4 transition-transform duration-300 hover:scale-105 ${
              darkMode
                ? "border-brand-dark shadow-xl"
                : "border-brand-light shadow-xl"
            } flex-shrink-0`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-white">
              <span className="material-icons-outlined text-6xl">person</span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-2xl font-semibold text-brand-text-dark dark:text-brand-text-light mb-2">
              John Doe
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400 mb-4">
              john.doe@example.com
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-brand-dark/30 text-brand-light border border-brand-dark/50 hover:bg-brand-dark/40"
                    : "bg-brand-light text-brand-dark border border-brand-light/80 hover:bg-brand-light/80"
                }`}
              >
                <span className="material-icons-outlined text-sm mr-1.5">
                  verified
                </span>
                Premium Member
              </span>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-secondary-dark/30 text-secondary-light border border-secondary-dark/50 hover:bg-secondary-dark/40"
                    : "bg-secondary-light text-secondary-dark border border-secondary-light/80 hover:bg-secondary-light/80"
                }`}
              >
                <span className="material-icons-outlined text-sm mr-1.5">
                  school
                </span>
                {/* Dynamic level based on completed dialogues */}
                Level{" "}
                {Math.min(
                  5,
                  Math.max(1, Math.floor(completedDialogueIds.length / 2) + 1)
                )}{" "}
                Learner
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            className={`mt-4 sm:mt-0 px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-button hover:shadow-button-hover ${
              darkMode
                ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border border-neutral-600"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700 border border-neutral-300"
            }`}
          >
            <span className="material-icons-outlined text-sm">edit</span>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Card - Dynamic learning stats */}
      <div
        className={`p-8 rounded-2xl transition-all duration-300 ${
          darkMode
            ? "bg-neutral-800/90 shadow-card-dark border border-neutral-700/50 backdrop-blur-sm"
            : "bg-white/90 shadow-card border border-neutral-200/70 backdrop-blur-sm"
        }`}
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-brand-text-dark dark:text-brand-text-light">
          <span className="material-icons-outlined text-brand">bar_chart</span>{" "}
          Learning Stats
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Dialogues Done",
              value: completedDialogueIds.length.toString(),
              icon: "checklist_rtl",
            },
            {
              label: "Words Learned",
              value: learnedVocabularyIds.length.toString(),
              icon: "translate",
            },
            {
              label: "Practice Sessions",
              value: practiceSessionCount.toString(),
              icon: "record_voice_over",
            },
            {
              label: "Practice Time",
              value: `${Math.floor(totalPracticeTime / 60)}m`,
              icon: "timer",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl flex flex-col transition-transform duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-neutral-700/70 shadow-inner border border-neutral-600/70"
                  : "bg-neutral-100/70 shadow-inner border border-neutral-200/70"
              }`}
            >
              <span
                className={`material-icons-outlined text-2xl mb-3 ${
                  darkMode ? "text-brand-light" : "text-brand"
                }`}
              >
                {stat.icon}
              </span>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </p>
              <p
                className={`text-2xl font-semibold mt-1 ${
                  darkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress based on completed dialogues */}
        <div
          className={`mt-10 p-5 rounded-xl ${
            darkMode
              ? "bg-neutral-700/70 border border-neutral-600/70"
              : "bg-neutral-100/70 border border-neutral-200/70"
          }`}
        >
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
            <span className="material-icons-outlined text-brand">
              equalizer
            </span>
            Overall Progress
          </h4>

          {/* Progress bar - dynamically calculated */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {progressData ? progressData.completedDialogues : 0} of{" "}
                {dialoguesList.length} Dialogues
              </span>
              <span
                className={`text-sm font-semibold ${
                  darkMode ? "text-brand-light" : "text-brand"
                }`}
              >
                {progressData
                  ? Math.round(
                      (progressData.completedDialogues / dialoguesList.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full ${
                darkMode ? "bg-neutral-800" : "bg-neutral-200"
              } overflow-hidden`}
            >
              <div
                className="h-full bg-gradient-to-r from-brand to-secondary transition-all duration-300"
                style={{
                  width: `${
                    progressData
                      ? Math.round(
                          (progressData.completedDialogues /
                            dialoguesList.length) *
                            100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Vocabulary Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {learnedVocabularyIds.length} of {vocabularyList.length} Words
              </span>
              <span
                className={`text-sm font-semibold ${
                  darkMode ? "text-brand-light" : "text-brand"
                }`}
              >
                {Math.round(
                  (learnedVocabularyIds.length / vocabularyList.length) * 100
                )}
                %
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full ${
                darkMode ? "bg-neutral-800" : "bg-neutral-200"
              } overflow-hidden`}
            >
              <div
                className="h-full bg-gradient-to-r from-secondary to-brand transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (learnedVocabularyIds.length / vocabularyList.length) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Recent Dialogues and accuracy */}
          <div>
            <h5
              className={`text-base font-medium mb-3 ${
                darkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Recent Progress
            </h5>
            <ul className="space-y-2">
              {progressData?.accuracyByDialogue.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? "bg-neutral-700/50" : "bg-neutral-100/70"
                  }`}
                >
                  <span
                    className={`text-base font-medium ${
                      darkMode ? "text-neutral-200" : "text-neutral-800"
                    }`}
                  >
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm ${
                        item.accuracy >= 75
                          ? darkMode
                            ? "text-success"
                            : "text-success"
                          : item.accuracy >= 65
                          ? darkMode
                            ? "text-yellow-400"
                            : "text-yellow-600"
                          : darkMode
                          ? "text-error"
                          : "text-error"
                      }`}
                    >
                      {item.accuracy}%
                    </span>
                    <span
                      className={`material-icons-outlined text-lg ${
                        item.accuracy >= 75
                          ? darkMode
                            ? "text-success"
                            : "text-success"
                          : item.accuracy >= 65
                          ? darkMode
                            ? "text-yellow-400"
                            : "text-yellow-600"
                          : darkMode
                          ? "text-error"
                          : "text-error"
                      }`}
                    >
                      {item.accuracy >= 85
                        ? "sentiment_very_satisfied"
                        : item.accuracy >= 75
                        ? "sentiment_satisfied"
                        : item.accuracy >= 65
                        ? "sentiment_neutral"
                        : "sentiment_dissatisfied"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  // Render content based on the current view
  const renderContent = () => {
    // Show practice screen overlay if active
    if (showPracticeScreen) {
      return renderDialoguePracticeScreen();
    }

    switch (currentView) {
      case "Dialogues":
        return renderDialogues();
      case "Vocabulary":
        return renderVocabulary();
      case "Progress":
        return renderProgress();
      case "Settings":
        return renderSettings();
      case "Profile":
        return renderProfile();
      default:
        return renderDialogues();
    }
  };

  // useEffect Cleanup
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // If Tailwind hasn't loaded, show a loading screen
  if (appLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-neutral-900" : "bg-brand-light"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-3 border-transparent border-t-secondary border-b-secondary mb-6"></div>
          <p
            className={`${
              darkMode ? "text-neutral-300" : "text-neutral-600"
            } text-lg font-medium`}
          >
            Loading Interface...
          </p>
        </div>
      </div>
    );
  }

  // --- Main App Layout --- //
  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-neutral-900" : "bg-neutral-50"
      } text-brand-text-dark dark:text-brand-text-light transition-colors duration-300`}
      style={{ fontSize: `${fontSize}rem` }} // Apply font size
    >
      {/* Desktop Navbar - Only visible on md and above */}
      <header
        className={`sticky top-0 z-30 h-16 md:h-20 flex items-center px-4 md:px-8 shadow-smooth ${
          darkMode
            ? "bg-neutral-800/90 border-b border-neutral-700/80 backdrop-blur-md"
            : "bg-white/90 border-b border-neutral-200/80 backdrop-blur-md"
        } ${
          showPracticeScreen ? "opacity-0 pointer-events-none" : ""
        } transition-opacity`} // Hide header when practice screen is open
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <span
              className={`material-icons-outlined text-2xl md:text-3xl ${
                darkMode
                  ? "text-brand drop-shadow-md"
                  : "text-brand drop-shadow"
              }`}
            >
              record_voice_over
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-brand-text-dark dark:text-brand-text-light tracking-tight">
              SpeakFluent
            </h1>
          </div>

          {/* Desktop Navigation - Updated for Language App */}
          <nav className="hidden md:flex items-center gap-6">
            {(["Dialogues", "Vocabulary", "Progress", "Profile"] as View[]).map(
              (view) => {
                const isActive = currentView === view;
                let iconName = "";
                switch (view) {
                  case "Dialogues":
                    iconName = "record_voice_over";
                    break;
                  case "Vocabulary":
                    iconName = "translate";
                    break;
                  case "Progress":
                    iconName = "assessment";
                    break;
                  case "Profile":
                    iconName = "person";
                    break;
                }

                return (
                  <button
                    key={view}
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? darkMode
                          ? `text-brand font-medium bg-brand/10 shadow-inner-smooth`
                          : `text-brand font-medium bg-brand/5 shadow-inner-smooth`
                        : darkMode
                        ? "text-neutral-300 hover:text-brand-light hover:bg-neutral-700/40"
                        : "text-neutral-600 hover:text-brand hover:bg-neutral-100"
                    }`}
                    onClick={() => {
                      setCurrentView(view);
                      setShowPracticeScreen(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="material-icons-outlined text-lg">
                      {iconName}
                    </span>
                    <span>{view}</span>
                  </button>
                );
              }
            )}
          </nav>

          {/* Theme Toggle and Settings Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-all duration-200 ${
                darkMode
                  ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white shadow-button hover:shadow-button-hover"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 hover:text-neutral-800 shadow-button hover:shadow-button-hover"
              }`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <span className="material-icons-outlined">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              onClick={() => {
                setCurrentView("Settings");
                setShowPracticeScreen(false);
              }}
              className={`p-3 rounded-full transition-all duration-200 ${
                darkMode
                  ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white shadow-button hover:shadow-button-hover"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 hover:text-neutral-800 shadow-button hover:shadow-button-hover"
              }`}
              aria-label="Settings"
            >
              <span className="material-icons-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* Conditional rendering handles the practice screen overlay */}
      <main
        className={`flex-grow overflow-auto ${
          showPracticeScreen ? "" : "pb-20 md:pb-0"
        }`}
      >
        {/* Render main content only if practice screen isn't shown OR render practice screen */}
        {renderContent()}
      </main>

      {/* Desktop Footer - Only visible on md and above */}
      <footer
        className={`hidden md:block py-12 px-8 border-t ${
          darkMode
            ? "bg-neutral-800 border-neutral-700"
            : "bg-white border-neutral-200"
        } ${
          showPracticeScreen ? "opacity-0 pointer-events-none" : ""
        } transition-opacity`} // Hide footer when practice screen is open
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-brand-text-dark dark:text-brand-text-light">
                About SpeakFluent
              </h3>
              <p
                className={`text-base leading-relaxed ${
                  darkMode ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                Enhance your speaking proficiency with interactive dialogues and
                feedback. Built with React, TypeScript, and Tailwind CSS.
              </p>
            </div>

            {/* Column 2 - Quick Links - Updated */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-brand-text-dark dark:text-brand-text-light">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {["Dialogues", "Vocabulary", "Progress", "Profile"].map(
                  (item) => (
                    <li key={item}>
                      <button
                        onClick={() => {
                          setCurrentView(item as View);
                          setShowPracticeScreen(false);
                        }}
                        className={`text-base hover:underline transition-colors duration-200 ${
                          darkMode
                            ? "text-neutral-300 hover:text-brand"
                            : "text-neutral-600 hover:text-brand"
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Column 3 - Resources */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-brand-text-dark dark:text-brand-text-light">
                Resources
              </h3>
              <ul className="space-y-3">
                {["Help Center", "Blog", "Community", "FAQ"].map((item) => (
                  <li key={item}>
                    <button
                      className={`text-base hover:underline transition-colors duration-200 ${
                        darkMode
                          ? "text-neutral-300 hover:text-brand"
                          : "text-neutral-600 hover:text-brand"
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-brand-text-dark dark:text-brand-text-light">
                Contact
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    label: "Email",
                    icon: "email",
                    value: "support@speakfluent.app",
                  },
                  {
                    label: "GitHub",
                    icon: "code",
                    value: "github.com/speakfluent",
                  },
                  { label: "Twitter", icon: "chat", value: "@speakfluent" },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 group"
                  >
                    <span
                      className={`material-icons-outlined ${
                        darkMode ? "text-brand" : "text-brand"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-base transition-colors duration-200 group-hover:text-brand ${
                        darkMode ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div
            className={`mt-12 pt-8 border-t text-center text-base ${
              darkMode
                ? "border-neutral-700 text-neutral-400"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            © {new Date().getFullYear()} SpeakFluent. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Global Toast Container */}
      {toastState && (
        <div
          className={`fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg shadow-xl z-[60] animate-fade-in max-w-sm w-11/12 text-center text-base font-medium border ${
            toastState.type === "success"
              ? "bg-success text-white border-success/20"
              : toastState.type === "error"
              ? "bg-error text-white border-error/20"
              : "bg-info text-white border-info/20"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="material-icons-outlined text-sm">
              {toastState.type === "success"
                ? "check_circle"
                : toastState.type === "error"
                ? "error"
                : "info"}
            </span>
            {toastState.message}
          </div>
        </div>
      )}

      {/* Bottom Navigation - Only visible on mobile */}
      <nav
        className={`fixed md:hidden bottom-0 left-0 right-0 h-16 flex items-stretch justify-around px-1 border-t z-40 ${
          darkMode
            ? "bg-neutral-800/90 border-neutral-700 backdrop-blur-md"
            : "bg-white/90 border-neutral-200 backdrop-blur-md"
        } shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] ${
          showPracticeScreen ? "opacity-0 pointer-events-none" : ""
        } transition-opacity`}
      >
        {(
          [
            "Dialogues",
            "Vocabulary",
            "Progress",
            "Profile",
            "Settings",
          ] as View[]
        ).map((view) => {
          const isActive = currentView === view;
          let iconName = "";
          switch (view) {
            case "Dialogues":
              iconName = "record_voice_over";
              break;
            case "Vocabulary":
              iconName = "translate";
              break;
            case "Progress":
              iconName = "assessment";
              break;
            case "Profile":
              iconName = "person";
              break;
            case "Settings":
              iconName = "settings";
              break;
          }

          return (
            <button
              key={view}
              className={`flex flex-col items-center justify-center flex-grow basis-0 transition-all duration-200 ${
                isActive
                  ? darkMode
                    ? `text-brand bg-brand/10`
                    : `text-brand bg-brand/5`
                  : darkMode
                  ? "text-neutral-400 hover:text-brand-light"
                  : "text-neutral-500 hover:text-brand"
              }`}
              onClick={() => {
                setCurrentView(view);
                setShowPracticeScreen(false);
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`material-icons-outlined text-2xl ${
                  isActive ? "animate-pulse-soft" : ""
                }`}
              >
                {iconName}
              </span>
              <span className="text-xs mt-1 font-medium">{view}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
