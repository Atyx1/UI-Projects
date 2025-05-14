import React, { useState, useEffect, useRef } from "react";

// Tailwind ve Material Icons için CDN'leri dinamik olarak yükle
const TW_CDN_URL = "https://cdn.tailwindcss.com";
const MATERIAL_ICONS_CDN_URL =
  "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";

// Tip Tanımları
interface HistoricalEvent {
  id: number;
  title: string;
  year: number;
  description: string;
  icon: string; // Material Icon name
  isFavorite: boolean; // Bookmark -> Favorite olarak değiştirildi
  // Gelecek özellikler için alanlar (Part 2+)
  audioUrl?: string;
  quiz?: {
    title: string;
    questions: {
      question: string;
      options: string[];
      correctOptionIndex: number;
    }[];
  };
  arLink?: string;
  isDownloaded?: boolean;
}

type View = "Timeline" | "Favorites" | "Downloads" | "Settings"; // Profile kısmı kaldırıldı

// Tailwind Config için renk paleti (daha modern ve estetik)
const tailwindConfig = `
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ana Marka Renkleri (Modern Tasarım)
        brand: {
          light: '#f8f9fa',
          DEFAULT: '#5D4037',
          dark: '#3E2723',
          'text-light': '#f8f9fa', // kebab-case
          'text-dark': '#212529',  // kebab-case
        },
        // İkincil Vurgu Renkleri (Amber/Altın)
        secondary: {
          light: '#FFD54F',
          DEFAULT: '#FFC107',
          dark: '#FF8F00',
        },
        // Nötr Renkler (Slate Tonları)
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Durum Renkleri
        success: '#10b981',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      },
      boxShadow: {
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'smooth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'smooth-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-smooth': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'sound-wave': {
          '0%, 100%': { height: '15px' },
          '50%': { height: '35px' },
        },
        'ping-slow': {
          '75%, 100%': {
             transform: 'scale(1.5)',
             opacity: '0'
           }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'sound-wave': 'sound-wave 1.2s infinite ease-in-out',
        'ping-slow-1': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slow-2': 'ping-slow 2.0s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s',
      }
    }
  }
}
`;

// Tam ekran görünüme sahip bileşenlerimiz için ortak arka plan classları
const fullScreenClasses = (darkMode: boolean) =>
  `${
    darkMode
      ? "bg-neutral-900 text-brand-text-light"
      : "bg-brand-light text-brand-text-dark"
  }`;

// Ana uygulama bileşeni
function App() {
  // Durum yönetimi
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [currentView, setCurrentView] = useState<View>("Timeline");
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(
    null
  );
  // Font büyüklüğü için yeni state
  const [fontSize, setFontSize] = useState<number>(1); // 1 = normal boyut

  // İndirmeler için state
  const [downloads, setDownloads] = useState<number[]>([]);

  // Sesli anlatım için yeni stateler
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);
  const playbackTimerRef = useRef<number | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [showAudio, setShowAudio] = useState<boolean>(false); // Sesli anlatım görünümü için yeni state

  // Quiz için state'ler
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);

  const scriptsLoaded = useRef(false);
  const answerFeedbackTimerRef = useRef<number | null>(null);

  // Tailwind ve Material Icons CDN'lerini yükle (Doğru sıra ve type ile)
  useEffect(() => {
    if (scriptsLoaded.current) return;

    const iconsLink = document.createElement("link");
    iconsLink.rel = "stylesheet";
    iconsLink.href = MATERIAL_ICONS_CDN_URL;
    document.head.appendChild(iconsLink);

    // 1. Tailwind Config Script (type eklendi, CDN'den önce)
    const twConfigScript = document.createElement("script");
    twConfigScript.innerHTML = tailwindConfig;
    twConfigScript.setAttribute("type", "text/tailwindcss"); // << TÜR EKLENDİ
    document.head.appendChild(twConfigScript); // << CDN SCRIPT'TEN ÖNCE

    // 2. Tailwind CDN Script (config'ten sonra)
    const twScript = document.createElement("script");
    twScript.src = TW_CDN_URL;
    twScript.async = true;
    twScript.onload = () => {
      console.log("Tailwind CDN loaded.");
      // Ensure dark mode is applied AFTER Tailwind is ready
      if (localStorage.getItem("darkMode") === "true") {
        document.documentElement.classList.add("dark");
      }
    };
    document.head.appendChild(twScript);

    scriptsLoaded.current = true;

    // Cleanup function
    return () => {
      document.head.removeChild(iconsLink);
      // Check parentNode before removing to prevent errors
      if (twConfigScript.parentNode) {
        document.head.removeChild(twConfigScript);
      }
      if (twScript.parentNode) {
        document.head.removeChild(twScript);
      }
    };
  }, []);

  // Karanlık Modu Yükle/Kaydet (Toast tipi eklendi)
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      const isDark = savedMode === "true";
      setDarkMode(isDark);
      // Apply class immediately if Tailwind might already be loaded from cache
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      // Default to light mode if nothing is saved
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
    // Show toast message on mode change
    showToast(darkMode ? "Karanlık Mod Aktif" : "Aydınlık Mod Aktif", "info");
  }, [darkMode]);

  // LocalStorage'dan favori ve indirme verilerini yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Favoriler yüklenirken hata oluştu:", error);
        setFavorites([]);
      }
    }

    const savedDownloads = localStorage.getItem("downloads");
    if (savedDownloads) {
      try {
        setDownloads(JSON.parse(savedDownloads));
      } catch (error) {
        console.error("İndirilenler yüklenirken hata oluştu:", error);
        setDownloads([]);
      }
    }

    // Font boyutunu yükle
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      try {
        setFontSize(parseFloat(savedFontSize));
      } catch (error) {
        console.error("Font boyutu yüklenirken hata oluştu:", error);
        setFontSize(1);
      }
    }
  }, []);

  // Favorileri LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // İndirmeleri LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("downloads", JSON.stringify(downloads));
  }, [downloads]);

  // Font büyüklüğünü LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString());
  }, [fontSize]);

  // Örnek Olay Verilerini Yükle (Bookmark -> Favorite olarak değiştirildi)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const dummyEvents: HistoricalEvent[] = [
        {
          id: 1,
          title: "Piramitlerin İnşası",
          year: -2560,
          description:
            "Gize'deki Büyük Piramit, Firavun Khufu için inşa edildi. En büyük piramit olan bu yapı, yaklaşık 2.3 milyon taş blok kullanılarak inşa edildi ve yapımı 20 yıl sürdü. Antik mühendislik harikası kabul edilen bu yapı, Mısır'ın zengin tarihinin en önemli kanıtlarından biridir.",
          icon: "account_balance",
          isFavorite: favorites.includes(1),
          quiz: {
            title: "Antik Mısır Piramitleri Bilgi Yarışması",
            questions: [
              {
                question:
                  "Gize'deki Büyük Piramit hangi firavun için inşa edildi?",
                options: ["Tutankhamun", "Khufu", "Ramses II", "Nefertiti"],
                correctOptionIndex: 1,
              },
              {
                question:
                  "Büyük Piramit'in yapımında yaklaşık kaç taş blok kullanılmıştır?",
                options: ["500 bin", "1 milyon", "2.3 milyon", "5 milyon"],
                correctOptionIndex: 2,
              },
              {
                question: "Büyük Piramit'in inşası yaklaşık ne kadar sürdü?",
                options: ["5 yıl", "10 yıl", "20 yıl", "50 yıl"],
                correctOptionIndex: 2,
              },
            ],
          },
        },
        {
          id: 2,
          title: "Roma İmparatorluğu'nun Kuruluşu",
          year: -27,
          description:
            "Augustus, ilk Roma İmparatoru oldu. Roma Cumhuriyeti'nin son dönemlerinde yaşanan iç savaşlar sonrasında, MÖ 27 yılında Octavius, Senato tarafından 'Augustus' unvanı verilerek imparator ilan edildi. Böylece 500 yıldan fazla sürecek olan Roma İmparatorluğu dönemi başlamış oldu.",
          icon: "shield",
          isFavorite: favorites.includes(2),
          quiz: {
            title: "Roma İmparatorluğu Tarihi Sınavı",
            questions: [
              {
                question: "İlk Roma İmparatoru kimdir?",
                options: ["Julius Sezar", "Augustus", "Nero", "Konstantin"],
                correctOptionIndex: 1,
              },
              {
                question: "Roma İmparatorluğu hangi yılda kuruldu?",
                options: ["MÖ 100", "MÖ 27", "MS 9", "MS 50"],
                correctOptionIndex: 1,
              },
              {
                question: "Roma İmparatorluğu yaklaşık kaç yıl sürdü?",
                options: ["200 yıl", "350 yıl", "500 yıldan fazla", "1000 yıl"],
                correctOptionIndex: 2,
              },
            ],
          },
        },
        {
          id: 3,
          title: "Matbaanın İcadı",
          year: 1440,
          description:
            "Johannes Gutenberg'in hareketli harflerle baskı tekniğini geliştirmesi. Değiştirilebilir metal harfler ve baskı makinesi kullanarak, kitapların daha hızlı ve ucuza üretilmesini sağladı. Bu icat, bilginin geniş kitlelere yayılmasına ve Rönesans'ın hızlanmasına büyük katkı sağladı.",
          icon: "print",
          isFavorite: favorites.includes(3),
          quiz: {
            title: "Matbaa ve Kültürel Etkileri Testi",
            questions: [
              {
                question: "Avrupa'da modern matbaayı kim icat etmiştir?",
                options: [
                  "Leonardo da Vinci",
                  "Johannes Gutenberg",
                  "Galileo Galilei",
                  "Isaac Newton",
                ],
                correctOptionIndex: 1,
              },
              {
                question:
                  "Gutenberg'in ilk basımını yaptığı önemli eser hangisidir?",
                options: ["İncil", "İlahi Komedya", "Don Kişot", "Hamlet"],
                correctOptionIndex: 0,
              },
              {
                question: "Matbaanın icadı hangi tarihsel döneme denk gelir?",
                options: [
                  "Orta Çağ",
                  "Rönesans",
                  "Aydınlanma Çağı",
                  "Endüstri Devrimi",
                ],
                correctOptionIndex: 1,
              },
              {
                question: "Matbaanın en önemli toplumsal etkisi ne olmuştur?",
                options: [
                  "Savaşların azalması",
                  "Bilginin demokratikleşmesi",
                  "Krallıkların güçlenmesi",
                  "Ticaretin durması",
                ],
                correctOptionIndex: 1,
              },
            ],
          },
        },
        {
          id: 4,
          title: "Amerikan  Bildirgesi",
          year: 1776,
          description:
            "Amerikan kolonileri, İngiltere'den bağımsızlıklarını ilan ederek ABD'nin kuruluşunu başlattılar.",
          icon: "gavel",
          isFavorite: favorites.includes(4),
          quiz: {
            title: "Amerikan Devrimi Bilgi Yarışması",
            questions: [
              {
                question:
                  "Amerikan Bağımsızlık Bildirgesi hangi yılda ilan edildi?",
                options: ["1776", "1789", "1804", "1750"],
                correctOptionIndex: 0,
              },
              {
                question: "Bağımsızlık Bildirgesi'ni kim yazdı?",
                options: [
                  "George Washington",
                  "Thomas Jefferson",
                  "Benjamin Franklin",
                  "John Adams",
                ],
                correctOptionIndex: 1,
              },
              {
                question: "Bağımsızlık hangi ülkeye karşı ilan edilmiştir?",
                options: ["Fransa", "İspanya", "İngiltere", "Portekiz"],
                correctOptionIndex: 2,
              },
            ],
          },
        },
        {
          id: 5,
          title: "Fransız Devrimi",
          year: 1789,
          description:
            "Fransız halkının eşitlik, özgürlük ve kardeşlik idealleriyle monarşiye karşı ayaklanması.",
          icon: "emoji_flags",
          isFavorite: favorites.includes(5),
          quiz: {
            title: "Fransız Devrimi Testi",
            questions: [
              {
                question: "Fransız Devrimi hangi yıl başlamıştır?",
                options: ["1776", "1789", "1800", "1755"],
                correctOptionIndex: 1,
              },
              {
                question: "Devrimin temel sloganı nedir?",
                options: [
                  "Zafer, Barış, Ekmek",
                  "İrade, Hak, Cesaret",
                  "Özgürlük, Eşitlik, Kardeşlik",
                  "Adalet, Güç, Dayanışma",
                ],
                correctOptionIndex: 2,
              },
              {
                question: "Hangi kral devrim sırasında idam edilmiştir?",
                options: [
                  "XIV. Louis",
                  "XV. Louis",
                  "XVI. Louis",
                  "XVII. Louis",
                ],
                correctOptionIndex: 2,
              },
            ],
          },
        },
        {
          id: 6,
          title: "İstanbul'un Fethi",
          year: 1453,
          description:
            "Fatih Sultan Mehmet'in Bizans İmparatorluğu'nun başkenti olan Konstantinopolis'i fethederek Osmanlı'ya katması.",
          icon: "castle",
          isFavorite: favorites.includes(6),
          quiz: {
            title: "İstanbul'un Fethi Bilgi Yarışması",
            questions: [
              {
                question: "İstanbul'u fetheden Osmanlı padişahı kimdir?",
                options: [
                  "Yavuz Sultan Selim",
                  "Kanuni Sultan Süleyman",
                  "Orhan Gazi",
                  "Fatih Sultan Mehmet",
                ],
                correctOptionIndex: 3,
              },
              {
                question: "İstanbul'un fethi hangi yıl gerçekleşti?",
                options: ["1453", "1492", "1402", "1326"],
                correctOptionIndex: 0,
              },
              {
                question: "Fetihle sona eren imparatorluk hangisidir?",
                options: ["Osmanlı", "Selçuklu", "Bizans", "Roma"],
                correctOptionIndex: 2,
              },
            ],
          },
        },
        {
          id: 7,
          title: "Sanayi Devrimi",
          year: 1760,
          description:
            "Buhar gücünün üretimde kullanılmaya başlanmasıyla modern endüstri toplumlarının temellerinin atılması.",
          icon: "factory",
          isFavorite: favorites.includes(7),
          quiz: {
            title: "Sanayi Devrimi Testi",
            questions: [
              {
                question: "Sanayi Devrimi hangi ülkede başlamıştır?",
                options: ["Fransa", "Almanya", "ABD", "İngiltere"],
                correctOptionIndex: 3,
              },
              {
                question:
                  "Sanayi Devrimi'nde yaygın kullanılan enerji kaynağı neydi?",
                options: ["Elektrik", "Güneş", "Buhar", "Petrol"],
                correctOptionIndex: 2,
              },
              {
                question:
                  "Sanayi Devrimi hangi alanda büyük gelişmelere neden oldu?",
                options: ["Tarım", "Sanayi", "Mimari", "Edebiyat"],
                correctOptionIndex: 1,
              },
            ],
          },
        },
        // ... (Diğer olaylar için benzer şekilde quiz soruları ekleyerek devam edilebilir)
      ];
      setEvents(dummyEvents);
      setLoading(false);
    }, 1500); // Yükleme simülasyonu
  }, []);

  // Olayları kronolojik sıraya göre sıralama
  useEffect(() => {
    if (events.length > 0) {
      // Olayları yıl sırasına göre sırala (en eskiden en yeniye)
      const sortedEvents = [...events].sort((a, b) => a.year - b.year);
      setEvents(sortedEvents);
    }
  }, [events.length]);

  // Olay indirme fonksiyonu
  const handleDownload = (eventId: number) => {
    setDownloads((prevDownloads) => {
      // Eğer zaten indirilmişse, kaldır
      if (prevDownloads.includes(eventId)) {
        showToast("İndirme kaldırıldı", "info");
        return prevDownloads.filter((id) => id !== eventId);
      }

      // Değilse, indir
      showToast("İndirme tamamlandı", "success");
      return [...prevDownloads, eventId];
    });
  };

  // Favori durumunu değiştir (Bookmark -> Favorite olarak değiştirildi)
  const toggleFavorite = (eventId: number) => {
    setFavorites((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.includes(eventId);
      const updatedFavorites = isAlreadyFavorite
        ? prevFavorites.filter((id) => id !== eventId)
        : [...prevFavorites, eventId];

      // Bildirim göster
      showToast(
        isAlreadyFavorite ? "Favorilerden kaldırıldı" : "Favorilere eklendi",
        "success"
      );

      // Eğer detay modalı açıksa, oradaki event'in de durumunu güncelle
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent({
          ...selectedEvent,
          isFavorite: !isAlreadyFavorite,
        });
      }

      return updatedFavorites;
    });
  };

  // Toast Gösterimi (Tip parametresi eklendi)
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 3000); // 3 saniye sonra tostu gizle
  };

  // Bir olayı seçme (Modalı açar) - Quiz ve sesli anlatım durumlarını sıfırlar
  const handleSelectEvent = (event: HistoricalEvent) => {
    // Tüm modları ve önceki durumları sıfırla
    stopPlayback();
    setShowQuiz(false);
    setShowAudio(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowAnswerFeedback(false);

    // Seçili olayı ve güncel bookmark durumunu ayarla
    setSelectedEvent({ ...event, isFavorite: favorites.includes(event.id) });

    // Açıklamayı cümlelere böl (anlatım için)
    const eventDescription = event.description || "";
    setSentences(splitIntoSentences(eventDescription));
  };

  // Modal'ı kapatma - Quiz ve anlatım modlarını temizler
  const handleCloseModal = () => {
    // Eğer anlatım çalışıyorsa durdur
    stopPlayback();

    // Quiz geri bildirim zamanlayıcısını temizle
    if (answerFeedbackTimerRef.current) {
      clearTimeout(answerFeedbackTimerRef.current);
      answerFeedbackTimerRef.current = null;
    }

    // State temizleme
    setSelectedEvent(null);
    setShowQuiz(false);
    setShowAudio(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowAnswerFeedback(false);
  };

  // Metni cümlelere bölen yardımcı fonksiyon
  const splitIntoSentences = (text: string): string[] => {
    // Noktalarla ayır, boş cümleleri filtrele
    const raw = text.split(".").filter((sentence) => sentence.trim() !== "");

    // Her cümlenin sonuna nokta ekle (split esnasında kayboluyor)
    return raw.map((sentence) => sentence.trim() + ".");
  };

  // Anlatım başlat/durdur
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Anlatımı başlat
  const startPlayback = () => {
    if (!selectedEvent || sentences.length === 0) return;

    setIsPlaying(true);
    setCurrentSentenceIndex(0);
    setProgress(0);

    // 6 saniyede bir cümle değişecek (gerçek bir anlatım simülasyonu için)
    playbackTimerRef.current = window.setInterval(() => {
      setCurrentSentenceIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // Tüm cümleler tamamlandı mı?
        if (nextIndex >= sentences.length) {
          stopPlayback();
          return 0; // İndeksi sıfırla
        }

        // İlerleme çubuğunu güncelle (0-100 arası)
        const progressPercentage = (nextIndex / (sentences.length - 1)) * 100;
        setProgress(progressPercentage);

        return nextIndex;
      });
    }, 6000); // 6 saniye aralıklarla
  };

  // Anlatımı durdur
  const stopPlayback = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSentenceIndex(-1);
    setProgress(0);
  };

  // --- Quiz Fonksiyonları --- //

  // Quiz'i başlat
  const handleStartQuiz = () => {
    if (!selectedEvent || !selectedEvent.quiz) return;

    // Anlatımı durdur
    stopPlayback();

    // Quiz'i hazırla ve görünür yap
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowAnswerFeedback(false);
    setShowQuiz(true);
  };

  // Cevap seçme işlemi
  const handleAnswerSelect = (answerIndex: number) => {
    if (!selectedEvent || !selectedEvent.quiz || showAnswerFeedback) return;

    setSelectedAnswerIndex(answerIndex);
    setShowAnswerFeedback(true);

    // Doğru cevabı kontrol et ve skoru güncelle
    const currentQuestion = selectedEvent.quiz.questions[currentQuestionIndex];
    if (answerIndex === currentQuestion.correctOptionIndex) {
      setQuizScore((prevScore) => prevScore + 1);
    }

    // 1.5 saniye sonra sonraki soruya geç veya quiz'i tamamla
    answerFeedbackTimerRef.current = window.setTimeout(() => {
      setShowAnswerFeedback(false);

      // Son soru muydu?
      if (currentQuestionIndex >= selectedEvent.quiz!.questions.length - 1) {
        setQuizCompleted(true);
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedAnswerIndex(null);
      }
    }, 1500);
  };

  // Quiz'i tekrar başlat
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowAnswerFeedback(false);
  };

  // Quiz'den çık ve olay detaylarına dön
  const handleExitQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowAnswerFeedback(false);
  };

  // Render fonksiyonları
  const renderTimeline = () => {
    // Zaman dilimlerini tanımla
    const timeRanges = [
      {
        id: "ancient",
        name: "Antik Çağ",
        minYear: -10000,
        maxYear: 476,
        color: "from-amber-500 to-orange-600",
      },
      {
        id: "medieval",
        name: "Orta Çağ",
        minYear: 477,
        maxYear: 1453,
        color: "from-blue-500 to-indigo-600",
      },
      {
        id: "renaissance",
        name: "Rönesans ve Keşifler",
        minYear: 1454,
        maxYear: 1789,
        color: "from-purple-500 to-pink-600",
      },
      {
        id: "modern",
        name: "Modern Çağ",
        minYear: 1790,
        maxYear: 1945,
        color: "from-green-500 to-emerald-600",
      },
      {
        id: "contemporary",
        name: "Çağdaş Dönem",
        minYear: 1946,
        maxYear: 3000,
        color: "from-sky-500 to-cyan-600",
      },
    ];

    // Her dönemdeki olayları filtrele
    const eventsByTimeRange = timeRanges
      .map((range) => ({
        ...range,
        events: events.filter(
          (event) => event.year >= range.minYear && event.year <= range.maxYear
        ),
      }))
      .filter((range) => range.events.length > 0);

    return (
      <section className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-3xl font-serif font-bold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light">
          <span className="material-icons-outlined mr-3 text-4xl text-brand dark:text-secondary">
            timeline
          </span>
          Zaman Tüneli
        </h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-smooth-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Tarihi olaylar yükleniyor...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 rounded-xl text-center bg-white dark:bg-neutral-800 shadow-smooth-lg">
            <span className="material-icons-outlined text-5xl mb-3 text-neutral-400 dark:text-neutral-500">
              sentiment_dissatisfied
            </span>
            <p className="text-neutral-600 dark:text-neutral-300">
              Gösterilecek tarihi olay bulunamadı.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {eventsByTimeRange.map((timeRange) => (
              <div key={timeRange.id} className="space-y-5">
                {/* Dönem Başlığı */}
                <div className={`relative py-2`}>
                  <div
                    className={`absolute inset-0 opacity-20 bg-gradient-to-r ${timeRange.color} rounded-lg`}
                  ></div>
                  <h3 className="text-xl font-serif font-bold pl-4 relative z-10 text-brand-text-dark dark:text-brand-text-light">
                    {timeRange.name}
                    <span className="ml-2 text-sm font-normal opacity-70">
                      {timeRange.minYear < 0
                        ? `${Math.abs(timeRange.minYear)} MÖ`
                        : timeRange.minYear}{" "}
                      -
                      {timeRange.maxYear < 0
                        ? `${Math.abs(timeRange.maxYear)} MÖ`
                        : timeRange.maxYear}
                    </span>
                  </h3>
                </div>

                {/* Olaylar */}
                {timeRange.events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className="group relative p-5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden 
                              bg-white dark:bg-neutral-800 
                              shadow-smooth hover:shadow-smooth-lg 
                              hover:-translate-y-1 border border-neutral-100 dark:border-neutral-700"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Icon & Content */}
                      <div className="flex items-start gap-4 flex-grow">
                        <div
                          className={`flex-shrink-0 p-3 rounded-full 
                            ${
                              darkMode
                                ? "bg-neutral-700/70 text-secondary"
                                : "bg-secondary/10 text-brand"
                            }`}
                        >
                          <span className="material-icons-outlined text-2xl">
                            {event.icon}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-serif font-semibold text-xl text-brand-text-dark dark:text-brand-text-light">
                            {event.title}
                          </h3>
                          <p className="text-sm font-medium text-secondary-dark dark:text-secondary mb-1.5">
                            {event.year < 0
                              ? `${Math.abs(event.year)} MÖ`
                              : `${event.year} MS`}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(event.id);
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 
                                  ${
                                    darkMode
                                      ? "hover:bg-neutral-700"
                                      : "hover:bg-secondary-light/30"
                                  }
                                  ${
                                    event.isFavorite
                                      ? "text-secondary"
                                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-secondary/70"
                                  }`}
                        aria-label={
                          event.isFavorite
                            ? "Favorilerden kaldır"
                            : "Favorilere ekle"
                        }
                      >
                        <span className="material-icons-outlined">
                          {event.isFavorite ? "favorite" : "favorite_border"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderFavorites = () => (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light">
        <span className="material-icons-outlined mr-3 text-4xl text-brand dark:text-secondary-light">
          favorite
        </span>
        Favoriler
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 shadow-neumorphic-light dark:shadow-neumorphic-dark">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-300">
            Favoriler yükleniyor...
          </p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-10 rounded-2xl text-center bg-neutral-100 dark:bg-neutral-800 shadow-neumorphic-light dark:shadow-neumorphic-dark">
          <span className="material-icons-outlined text-5xl mb-3 text-neutral-400 dark:text-neutral-500">
            favorite_border
          </span>
          <p className="text-neutral-600 dark:text-neutral-300">
            Henüz favori etkinlik eklemediniz.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {events
            .filter((event) => favorites.includes(event.id))
            .map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden 
                            bg-brand-light dark:bg-neutral-800 
                            shadow-smooth dark:shadow-smooth 
                            hover:shadow-smooth-lg dark:hover:shadow-smooth-lg hover:-translate-y-1 border border-transparent hover:border-secondary/50`}
              >
                <div className="flex justify-between items-start gap-5">
                  {/* Icon & Content */}
                  <div className="flex items-start gap-4 flex-grow">
                    <div
                      className={`flex-shrink-0 p-3 rounded-full ${
                        darkMode
                          ? "bg-neutral-700 shadow-neumorphic-dark-inset"
                          : "bg-secondary-light/50 shadow-neumorphic-light-inset"
                      }`}
                    >
                      <span className="material-icons-outlined text-3xl text-brand dark:text-secondary-light">
                        {event.icon}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-serif font-semibold text-xl text-brand-text-dark dark:text-brand-text-light">
                        {event.title}
                      </h3>
                      <p className="text-sm font-medium text-brand dark:text-secondary-light mb-1">
                        {event.year < 0
                          ? `${Math.abs(event.year)} MÖ`
                          : `${event.year} MS`}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(event.id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 text-secondary dark:text-secondary-light"
                    aria-label="Favorilerden kaldır"
                  >
                    <span className="material-icons-outlined">favorite</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );

  const renderDownloads = () => (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light">
        <span className="material-icons-outlined mr-3 text-4xl text-brand dark:text-secondary-light">
          download
        </span>
        İndirilenler
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 shadow-neumorphic-light dark:shadow-neumorphic-dark">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-300">
            İndirilenler yükleniyor...
          </p>
        </div>
      ) : downloads.length === 0 ? (
        <div className="p-10 rounded-2xl text-center bg-neutral-100 dark:bg-neutral-800 shadow-neumorphic-light dark:shadow-neumorphic-dark">
          <span className="material-icons-outlined text-5xl mb-3 text-neutral-400 dark:text-neutral-500">
            download
          </span>
          <p className="text-neutral-600 dark:text-neutral-300">
            Henüz indirilmiş olay bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {events
            .filter((event) => downloads.includes(event.id))
            .map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden 
                        bg-brand-light dark:bg-neutral-800 
                        shadow-smooth dark:shadow-smooth 
                        hover:shadow-smooth-lg dark:hover:shadow-smooth-lg hover:-translate-y-1 border border-transparent hover:border-secondary/50`}
              >
                <div className="flex justify-between items-start gap-5">
                  {/* Icon & Content */}
                  <div className="flex items-start gap-4 flex-grow">
                    <div
                      className={`flex-shrink-0 p-3 rounded-full ${
                        darkMode
                          ? "bg-neutral-700 shadow-neumorphic-dark-inset"
                          : "bg-secondary-light/50 shadow-neumorphic-light-inset"
                      }`}
                    >
                      <span className="material-icons-outlined text-3xl text-brand dark:text-secondary-light">
                        {event.icon}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-serif font-semibold text-xl text-brand-text-dark dark:text-brand-text-light">
                        {event.title}
                      </h3>
                      <p className="text-sm font-medium text-brand dark:text-secondary-light mb-1">
                        {event.year < 0
                          ? `${Math.abs(event.year)} MÖ`
                          : `${event.year} MS`}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  {/* Download Status */}
                  <div className="absolute top-4 right-4 p-2 rounded-full text-blue-500 dark:text-blue-400">
                    <span className="material-icons-outlined">
                      download_done
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );

  const renderSettings = () => (
    <section className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light">
        <span className="material-icons-outlined mr-3 text-4xl text-brand dark:text-secondary-light">
          settings
        </span>
        Ayarlar
      </h2>

      {/* Görünüm Ayarları Kartı */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode
            ? "bg-neutral-800 shadow-smooth-lg"
            : "bg-white shadow-smooth-lg"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
          <span className="material-icons-outlined">visibility</span> Görünüm
        </h3>

        {/* Tema Seçimi */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-neutral-700 dark:text-neutral-300">Tema</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? "focus:ring-offset-neutral-900"
                : "focus:ring-offset-brand-light"
            } focus:ring-secondary 
                        ${darkMode ? "bg-secondary" : "bg-neutral-300"}`}
          >
            <span className="sr-only">Temayı Değiştir</span>
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out 
                          ${darkMode ? "translate-x-6" : "translate-x-1"}`}
            />
            <span
              className={`absolute left-1.5 top-1 material-icons-outlined text-xs ${
                darkMode
                  ? "text-neutral-900 opacity-0"
                  : "text-neutral-500 opacity-100"
              } transition-opacity duration-300`}
            >
              light_mode
            </span>
            <span
              className={`absolute right-1.5 top-1 material-icons-outlined text-xs ${
                darkMode
                  ? "text-white opacity-100"
                  : "text-neutral-300 opacity-0"
              } transition-opacity duration-300`}
            >
              dark_mode
            </span>
          </button>
        </div>

        {/* Yazı Boyutu Ayarı */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-neutral-700 dark:text-neutral-300">
              Font Size
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(1)}
                className={`px-3 py-2 rounded-lg ${
                  darkMode
                    ? fontSize === 1
                      ? "bg-secondary text-white"
                      : "bg-neutral-700 text-neutral-300"
                    : fontSize === 1
                    ? "bg-secondary text-white"
                    : "bg-neutral-200 text-neutral-700"
                }`}
                aria-label="Normal size"
              >
                Normal
              </button>

              <button
                onClick={() => setFontSize(1.2)}
                className={`px-3 py-2 rounded-lg ${
                  darkMode
                    ? fontSize === 1.2
                      ? "bg-secondary text-white"
                      : "bg-neutral-700 text-neutral-300"
                    : fontSize === 1.2
                    ? "bg-secondary text-white"
                    : "bg-neutral-200 text-neutral-700"
                }`}
                aria-label="Large size"
              >
                Large
              </button>
            </div>
          </div>

          {/* Yazı Boyutu Önizleme */}
          <div
            className={`mt-4 p-4 rounded-lg border ${
              darkMode
                ? "border-neutral-700 bg-neutral-900"
                : "border-neutral-300 bg-neutral-100"
            }`}
          >
            <p
              className={`${
                darkMode ? "text-neutral-400" : "text-neutral-600"
              } text-sm mb-1`}
            >
              Preview:
            </p>
            <p
              className={`${
                darkMode ? "text-neutral-200" : "text-neutral-800"
              }`}
              style={{ fontSize: `${fontSize}rem` }}
            >
              History application content sample
            </p>
          </div>
        </div>
      </div>

      {/* Uygulama Bilgisi Kartı */}
      <div
        className={`p-6 rounded-2xl ${
          darkMode
            ? "bg-neutral-800 shadow-smooth-lg"
            : "bg-white shadow-smooth-lg"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
          <span className="material-icons-outlined">info</span> Uygulama Bilgisi
        </h3>
        <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
          <li className="flex justify-between items-center">
            <span>Sürüm:</span>
            <span className="font-medium text-brand-text-dark dark:text-brand-text-light">
              v1.0.0
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span>Geliştirici:</span>
            <span className="font-medium text-brand-text-dark dark:text-brand-text-light"></span>
          </li>
        </ul>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (currentView) {
      case "Timeline":
        return renderTimeline();
      case "Favorites":
        return renderFavorites();
      case "Downloads":
        return renderDownloads();
      case "Settings":
        return renderSettings();
      default:
        return renderTimeline();
    }
  };

  // Quiz Görünümü
  const renderQuizView = () => {
    if (!selectedEvent || !selectedEvent.quiz) return null;

    const quiz = selectedEvent.quiz;
    const totalQuestions = quiz.questions.length;

    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col ${
          darkMode
            ? "bg-neutral-900 text-brand-text-light"
            : "bg-brand-light text-brand-text-dark"
        } animate-fade-in`}
      >
        {/* Üst Navigasyon */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${
            darkMode
              ? "border-neutral-700 bg-neutral-800/50"
              : "border-neutral-200 bg-brand-light"
          } backdrop-blur-sm`}
        >
          <button
            onClick={handleExitQuiz}
            className={`p-2 rounded-full flex items-center transition-colors ${
              darkMode ? "hover:bg-neutral-700/50" : "hover:bg-neutral-200/50"
            }`}
            aria-label="Quiz'den çık"
          >
            <span className="material-icons-outlined mr-1">arrow_back</span>
            <span className="text-sm">{selectedEvent.title}</span>
          </button>

          <div className="text-sm font-medium">
            {quizCompleted
              ? "Sonuçlar"
              : `${currentQuestionIndex + 1} / ${totalQuestions}`}
          </div>
        </div>

        {/* Quiz İçeriği */}
        <div className="flex-grow overflow-y-auto p-4">
          {/* Quiz Başlığı */}
          <h2 className="text-xl font-serif font-semibold text-center mb-6 text-brand-text-dark dark:text-brand-text-light">
            {quiz.title}
          </h2>

          {/* Sonuç Ekranı */}
          {quizCompleted ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className={`p-6 rounded-2xl mb-8 ${
                  darkMode ? "bg-neutral-800" : "bg-white"
                } shadow-lg text-center max-w-sm mx-auto`}
              >
                <div className="mb-4">
                  <span
                    className={`material-icons-outlined text-6xl ${
                      quizScore === totalQuestions
                        ? "text-green-500"
                        : quizScore > totalQuestions / 2
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {quizScore === totalQuestions
                      ? "emoji_events"
                      : quizScore > totalQuestions / 2
                      ? "workspace_premium"
                      : "psychology"}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-brand-text-dark dark:text-brand-text-light">
                  {quizScore === totalQuestions
                    ? "Mükemmel!"
                    : quizScore > totalQuestions / 2
                    ? "İyi İş!"
                    : "Tekrar Dene!"}
                </h3>

                <p className="text-lg font-medium mb-2 text-brand-text-dark dark:text-brand-text-light">
                  Puanınız: {quizScore}/{totalQuestions}
                </p>

                <p
                  className={`text-sm ${
                    darkMode ? "text-neutral-400" : "text-neutral-500"
                  } mb-6`}
                >
                  {quizScore === totalQuestions
                    ? "Tüm soruları doğru cevapladınız!"
                    : quizScore > totalQuestions / 2
                    ? "Bilginizi daha da geliştirebilirsiniz."
                    : "Biraz daha çalışmaya ne dersiniz?"}
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleRetryQuiz}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
                               ${
                                 darkMode
                                   ? "bg-secondary hover:bg-secondary-dark"
                                   : "bg-secondary hover:bg-yellow-600"
                               } text-white
                               shadow-md active:shadow-inner font-medium`}
                  >
                    <span className="material-icons-outlined">replay</span>
                    Tekrar Dene
                  </button>

                  <button
                    onClick={handleExitQuiz}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
                               ${
                                 darkMode
                                   ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                                   : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
                               }
                               shadow-md active:shadow-inner font-medium`}
                  >
                    <span className="material-icons-outlined">article</span>
                    Etkinliğe Dön
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {/* Soru */}
              <div
                className={`p-6 rounded-2xl mb-6 ${
                  darkMode ? "bg-neutral-800" : "bg-white"
                } shadow-lg`}
              >
                <h3 className="text-xl font-bold mb-4 text-brand-text-dark dark:text-brand-text-light">
                  {quiz.questions[currentQuestionIndex].question}
                </h3>

                {/* İlerleme Çubuğu */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${
                        (currentQuestionIndex / totalQuestions) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                <p className="text-xs text-right text-neutral-500 dark:text-neutral-400">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </p>
              </div>

              {/* Cevap Seçenekleri */}
              <div className="space-y-3">
                {quiz.questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showAnswerFeedback}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 
                                ${
                                  darkMode
                                    ? "bg-neutral-800 hover:bg-neutral-700"
                                    : "bg-white hover:bg-neutral-50"
                                } 
                                shadow-md flex items-center justify-between
                                ${
                                  selectedAnswerIndex === index &&
                                  showAnswerFeedback
                                    ? index ===
                                      quiz.questions[currentQuestionIndex]
                                        .correctOptionIndex
                                      ? "bg-green-100 dark:bg-green-900/30 border border-green-500"
                                      : "bg-red-100 dark:bg-red-900/30 border border-red-500"
                                    : "border border-transparent"
                                }`}
                    >
                      <span className="font-medium">{option}</span>

                      {/* Doğru/Yanlış göstergesi */}
                      {selectedAnswerIndex === index && showAnswerFeedback && (
                        <span
                          className={`material-icons-outlined ${
                            index ===
                            quiz.questions[currentQuestionIndex]
                              .correctOptionIndex
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {index ===
                          quiz.questions[currentQuestionIndex]
                            .correctOptionIndex
                            ? "check_circle"
                            : "cancel"}
                        </span>
                      )}

                      {/* Doğru cevap işareti (eğer kullanıcı başka bir cevap seçtiyse) */}
                      {showAnswerFeedback &&
                        selectedAnswerIndex !== index &&
                        index ===
                          quiz.questions[currentQuestionIndex]
                            .correctOptionIndex && (
                          <span className="material-icons-outlined text-green-500">
                            check_circle
                          </span>
                        )}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sesli anlatım görünümünü başlat
  const handleStartAudio = () => {
    if (!selectedEvent || !selectedEvent.audioUrl) return;

    // Quiz'i kapat eğer açıksa
    setShowQuiz(false);

    // Sesli anlatım görünümünü göster
    setShowAudio(true);

    // Anlatımı başlat (kısa bir gecikmeyle)
    setTimeout(() => {
      startPlayback();
    }, 500);
  };

  // Sesli anlatım görünümünden çık
  const handleExitAudio = () => {
    // Anlatımı durdur
    stopPlayback();

    // Görünümü kapat
    setShowAudio(false);
  };

  // Sesli Anlatım Görünümü
  const renderAudioView = () => {
    if (!selectedEvent || !selectedEvent.audioUrl) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col ${
          darkMode
            ? "bg-neutral-900 text-brand-text-light"
            : "bg-brand-light text-brand-text-dark"
        } animate-fade-in`}
      >
        {/* Üst Navigasyon */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${
            darkMode
              ? "border-neutral-700 bg-neutral-800/50"
              : "border-neutral-200 bg-brand-light"
          } backdrop-blur-sm sticky top-0 z-10`}
        >
          <button
            onClick={handleExitAudio}
            className={`p-2 rounded-full flex items-center transition-colors ${
              darkMode ? "hover:bg-neutral-700/50" : "hover:bg-neutral-200/50"
            }`}
            aria-label="Sesli anlatımdan çık"
          >
            <span className="material-icons-outlined mr-1">arrow_back</span>
            <span className="text-sm font-sans">{selectedEvent.title}</span>
          </button>

          <div className="text-sm font-medium flex items-center">
            <span className="material-icons-outlined mr-1 text-secondary">
              headphones
            </span>
            Sesli Anlatım
          </div>
        </div>

        {/* Audio İçeriği */}
        <div className="flex-grow overflow-y-auto p-4">
          <div className="max-w-lg mx-auto mt-6">
            {/* İkon ve Başlık */}
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center p-6 rounded-full mb-4 ${
                  darkMode
                    ? "bg-neutral-800 shadow-smooth-lg"
                    : "bg-white shadow-smooth-lg"
                }`}
              >
                <span
                  className={`material-icons-outlined text-6xl ${
                    darkMode ? "text-secondary" : "text-brand"
                  }`}
                >
                  {selectedEvent.icon}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-semibold text-brand-text-dark dark:text-brand-text-light">
                {selectedEvent.title}
              </h2>
              <p className="text-secondary-dark dark:text-secondary font-medium mt-1 font-serif">
                {selectedEvent.year < 0
                  ? `${Math.abs(selectedEvent.year)} MÖ`
                  : `${selectedEvent.year} MS`}
              </p>
            </div>

            {/* Ses Kontrolü */}
            <div
              className={`p-6 rounded-2xl mb-8 ${
                darkMode ? "bg-neutral-800" : "bg-white"
              } shadow-smooth-lg`}
            >
              <div className="mb-6">
                <button
                  onClick={togglePlayback}
                  className={`relative w-20 h-20 mx-auto flex items-center justify-center rounded-full shadow-xl transition-all duration-300 transform ${
                    isPlaying ? "scale-95" : "scale-100 hover:scale-105"
                  } ${
                    isPlaying
                      ? darkMode
                        ? "bg-error text-white"
                        : "bg-error text-white"
                      : darkMode
                      ? "bg-secondary text-white"
                      : "bg-secondary text-white"
                  }`}
                  aria-label={isPlaying ? "Duraklat" : "Başlat"}
                >
                  <span className="material-icons-outlined text-3xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>

                  {/* Dalgalı daireler animasyonu (ses çalınıyorsa) */}
                  {isPlaying && (
                    <>
                      <span
                        className="absolute inset-0 rounded-full animate-ping bg-secondary/30"
                        style={{ animationDuration: "1.5s" }}
                      ></span>
                      <span
                        className="absolute inset-0 rounded-full animate-ping bg-secondary/20"
                        style={{
                          animationDuration: "2s",
                          animationDelay: "0.5s",
                        }}
                      ></span>
                    </>
                  )}
                </button>
              </div>

              {/* Şu an oynatılan */}
              <div className="text-center mb-4">
                <div
                  className={`text-sm font-medium mb-1 ${
                    darkMode ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {isPlaying ? "Playing Narration" : "Play Narration"}
                </div>
                <div
                  className={`font-bold font-sans ${
                    isPlaying
                      ? "text-secondary dark:text-secondary-light"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {isPlaying
                    ? `Sentence ${currentSentenceIndex + 1}/${sentences.length}`
                    : "Duraklatıldı"}
                </div>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-sans mb-1">
                  <span
                    className={
                      darkMode ? "text-neutral-500" : "text-neutral-400"
                    }
                  >
                    {formatTime(isPlaying ? currentSentenceIndex * 3 : 0)}
                  </span>
                  <span
                    className={
                      darkMode ? "text-neutral-500" : "text-neutral-400"
                    }
                  >
                    {formatTime(sentences.length * 3)}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Ses Simülasyonu Görselleştirmesi (ses çalınıyorsa) */}
              {isPlaying && (
                <div className="mt-8 h-12 flex items-center justify-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-secondary/80 rounded-full"
                      style={{
                        animation: "sound-wave 1.2s infinite ease-in-out",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Şu anki cümle */}
            <div
              className={`p-5 rounded-xl mb-6 ${
                darkMode
                  ? "bg-secondary/10 border border-secondary/20"
                  : "bg-secondary/10 border border-secondary/20"
              } text-center`}
            >
              <p className="font-semibold font-sans text-brand-text-dark dark:text-secondary-light">
                {isPlaying && currentSentenceIndex >= 0
                  ? sentences[currentSentenceIndex]
                  : "Sesli anlatımı başlatmak için oynat düğmesine basın"}
              </p>
            </div>

            {/* Tüm metin */}
            <div
              className={`p-6 rounded-2xl ${
                darkMode ? "bg-neutral-800" : "bg-white"
              } shadow-smooth-lg mb-8`}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center font-sans text-brand-text-dark dark:text-brand-text-light">
                <span className="material-icons-outlined mr-2">subject</span>
                Tam Metin
              </h3>
              <div className="space-y-2 font-sans">
                {sentences.map((sentence, index) => (
                  <p
                    key={index}
                    className={`p-2 rounded transition-all duration-300 text-sm ${
                      index === currentSentenceIndex && isPlaying
                        ? darkMode
                          ? "bg-secondary/20 text-secondary-light font-medium"
                          : "bg-secondary/10 text-secondary-dark font-medium"
                        : darkMode
                        ? "text-neutral-300"
                        : "text-neutral-600"
                    }`}
                  >
                    {sentence}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Yardımcı fonksiyon: Saniyeyi 00:00 formatına dönüştür
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // GÜNCELLENDİ: Detay Modalı
  const renderDetailModal = () => {
    if (!selectedEvent || showQuiz || showAudio) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="event-detail-title"
      >
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleCloseModal}
          aria-hidden="true"
        ></div>

        {/* Modal Content */}
        <div
          className={`relative max-w-lg w-full rounded-t-2xl sm:rounded-2xl shadow-smooth-xl overflow-hidden flex flex-col max-h-[90vh] 
                     ${
                       darkMode
                         ? "bg-neutral-900 text-brand-text-light"
                         : "bg-white text-brand-text-dark"
                     }`}
        >
          {/* Header */}
          <div
            className={`p-5 sm:p-6 flex justify-between items-start border-b ${
              darkMode
                ? "border-neutral-700 bg-brand-dark"
                : "border-neutral-200 bg-brand"
            } text-white sticky top-0 z-10`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-full">
                <span className="material-icons-outlined text-2xl sm:text-3xl">
                  {selectedEvent.icon}
                </span>
              </div>
              <div>
                <h2
                  id="event-detail-title"
                  className="text-xl sm:text-2xl font-serif font-bold"
                >
                  {selectedEvent.title}
                </h2>
                <p className="text-sm sm:text-base text-white/80 font-serif">
                  {selectedEvent.year < 0
                    ? `${Math.abs(selectedEvent.year)} MÖ`
                    : `${selectedEvent.year} MS`}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-1 rounded-full hover:bg-white/20 transition-colors ml-4 flex-shrink-0"
              aria-label="Kapat"
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-grow">
            <div className="p-5 sm:p-6">
              {/* Ses Oynatma Kontrolü */}
              <div
                className={`mb-6 p-4 rounded-xl ${
                  darkMode ? "bg-neutral-800" : "bg-neutral-100"
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayback}
                    className={`p-3 rounded-full ${
                      isPlaying
                        ? "bg-error text-white"
                        : "bg-secondary text-white"
                    }`}
                  >
                    <span className="material-icons-outlined">
                      {isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-neutral-800"
                      }`}
                    >
                      {isPlaying ? "Anlatım Oynatılıyor" : "Sesli Anlat"}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-neutral-400" : "text-neutral-500"
                      }`}
                    >
                      {isPlaying
                        ? `Sentence ${currentSentenceIndex + 1}/${
                            sentences.length
                          }`
                        : "Click to start automatic narration"}
                    </p>
                  </div>
                </div>

                {isPlaying && (
                  <div className="w-1/2">
                    <div className="w-full bg-neutral-700 dark:bg-neutral-600 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-secondary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Açıklama */}
              <p
                className={`mb-6 text-base leading-relaxed ${
                  darkMode ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {selectedEvent.description}
              </p>

              {/* Aktif cümle vurgusu - ayrı bir element olarak */}
              {isPlaying &&
                currentSentenceIndex >= 0 &&
                sentences[currentSentenceIndex] && (
                  <div
                    className={`mb-6 p-3 rounded-lg ${
                      darkMode
                        ? "bg-secondary/10 border border-secondary/20"
                        : "bg-secondary/5 border border-secondary/10"
                    }`}
                  >
                    <p className="text-base leading-relaxed">
                      <span className="material-icons-outlined text-sm mr-2 align-middle">
                        volume_up
                      </span>
                      <span>{sentences[currentSentenceIndex]}</span>
                    </p>
                  </div>
                )}

              {/* Divider */}
              <hr
                className={`border-t ${
                  darkMode ? "border-neutral-700" : "border-neutral-200"
                } my-6`}
              />

              {/* Aksiyonlar */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold font-sans mb-3 text-brand-text-dark dark:text-brand-text-light">
                  Seçenekler
                </h3>

                {/* Sesli Anlatım Butonu */}
                {selectedEvent.audioUrl && (
                  <button
                    onClick={handleStartAudio}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      darkMode
                        ? "bg-brand text-white hover:bg-brand/80"
                        : "bg-brand text-white hover:bg-brand/90"
                    } shadow-smooth`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-icons-outlined">
                        headphones
                      </span>
                      <span className="font-medium">Sesli Anlatım Dinle</span>
                    </span>
                    <span className="material-icons-outlined text-white/70">
                      chevron_right
                    </span>
                  </button>
                )}

                {/* Quiz Butonu */}
                {selectedEvent.quiz && (
                  <button
                    onClick={handleStartQuiz}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      darkMode
                        ? "bg-secondary text-white hover:bg-secondary-dark"
                        : "bg-secondary text-white hover:bg-yellow-600"
                    } shadow-smooth`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-icons-outlined">quiz</span>
                      <span className="font-medium">İlgili Quizi Çöz</span>
                    </span>
                    <span className="material-icons-outlined text-white/70">
                      chevron_right
                    </span>
                  </button>
                )}

                {/* AR Butonu (ileride eklenecek) */}
                {selectedEvent.arLink && (
                  <button
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      darkMode
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-not-allowed opacity-60"
                        : "bg-indigo-500 text-white hover:bg-indigo-600 cursor-not-allowed opacity-60"
                    } shadow-smooth`}
                    disabled
                    aria-disabled="true"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-icons-outlined">
                        view_in_ar
                      </span>
                      <span className="font-medium">AR Deneyimi (Yakında)</span>
                    </span>
                    <span className="material-icons-outlined text-white/70">
                      chevron_right
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Favori Butonu */}
          <div
            className={`p-4 border-t ${
              darkMode ? "border-neutral-700" : "border-neutral-200"
            } bg-opacity-80 backdrop-blur-sm sticky bottom-0`}
          >
            <div className="flex gap-2">
              <button
                onClick={() => toggleFavorite(selectedEvent.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors font-medium ${
                  darkMode
                    ? selectedEvent.isFavorite
                      ? "bg-secondary/20 text-secondary"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    : selectedEvent.isFavorite
                    ? "bg-secondary/10 text-secondary-dark"
                    : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                } shadow-inner-smooth`}
                aria-live="polite"
              >
                <span className="material-icons-outlined">
                  {selectedEvent.isFavorite ? "favorite" : "favorite_border"}
                </span>
                <span>
                  {selectedEvent.isFavorite
                    ? "Favorilerden Kaldır"
                    : "Favorilere Ekle"}
                </span>
              </button>

              <button
                onClick={() => handleDownload(selectedEvent.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors font-medium ${
                  darkMode
                    ? downloads.includes(selectedEvent.id)
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    : downloads.includes(selectedEvent.id)
                    ? "bg-blue-500/10 text-blue-700"
                    : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                } shadow-inner-smooth`}
                aria-live="polite"
              >
                <span className="material-icons-outlined">
                  {downloads.includes(selectedEvent.id)
                    ? "download_done"
                    : "download"}
                </span>
                <span>
                  {downloads.includes(selectedEvent.id) ? "İndirildi" : "İndir"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // useEffect - Temizleme fonksiyonu
  useEffect(() => {
    return () => {
      // Komponent kaldırıldığında zamanlayıcıları temizle
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (answerFeedbackTimerRef.current) {
        clearTimeout(answerFeedbackTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-brand-light dark:bg-neutral-900 text-brand-text-dark dark:text-brand-text-light"
      style={{ fontSize: `${fontSize}rem` }}
    >
      {/* Ana İçerik */}
      <main className="flex-grow overflow-auto pb-20">
        {/* Sayfa İçeriği */}
        {renderContent()}

        {/* Modal */}
        {selectedEvent && renderDetailModal()}

        {/* Quiz Görünümü */}
        {showQuiz && renderQuizView()}

        {/* Sesli Anlatım Görünümü */}
        {showAudio && renderAudioView()}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-smooth z-50 animate-fade-in ${
              toast.type === "success"
                ? "bg-success text-white"
                : toast.type === "error"
                ? "bg-error text-white"
                : darkMode
                ? "bg-neutral-800 text-white"
                : "bg-white text-neutral-800"
            }`}
          >
            {toast.message}
          </div>
        )}
      </main>

      {/* Alt Navigasyon */}
      <nav
        className={`fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 border-t z-40 ${
          darkMode
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-200"
        }`}
      >
        <button
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            currentView === "Timeline"
              ? "text-secondary"
              : darkMode
              ? "text-neutral-400 hover:text-neutral-200"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setCurrentView("Timeline")}
        >
          <span className="material-icons-outlined text-xl">timeline</span>
          <span className="text-xs mt-1">Olaylar</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            currentView === "Favorites"
              ? "text-secondary"
              : darkMode
              ? "text-neutral-400 hover:text-neutral-200"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setCurrentView("Favorites")}
        >
          <span className="material-icons-outlined text-xl">favorite</span>
          <span className="text-xs mt-1">Favoriler</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            currentView === "Downloads"
              ? "text-secondary"
              : darkMode
              ? "text-neutral-400 hover:text-neutral-200"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setCurrentView("Downloads")}
        >
          <span className="material-icons-outlined text-xl">download</span>
          <span className="text-xs mt-1">İndirilenler</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center w-1/3 h-full ${
            currentView === "Settings"
              ? "text-secondary"
              : darkMode
              ? "text-neutral-400 hover:text-neutral-200"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setCurrentView("Settings")}
        >
          <span className="material-icons-outlined text-xl">settings</span>
          <span className="text-xs mt-1">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
