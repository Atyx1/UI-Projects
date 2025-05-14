"use client";
import React, { useState, useEffect } from "react";

// Puzzle parçası için tip tanımı
interface PuzzlePiece {
  id: string; // Parça ID'si (1A, 1B, vb.)
  imgPartIndex: number; // Resmin hangi parçası (0-8 arası 3x3 için, 0-15 arası 4x4 için)
}

// Puzzle oyunu bileşeni
const ImagePuzzleGame: React.FC = () => {
  // Durum değişkenleri
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [placedPieces, setPlacedPieces] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1); // Seviye: 1=3x3, 2=4x4
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme
        ? savedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Temayı değiştir
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme ? "dark" : "light");
    }
  };

  // Sayfa yüklendiğinde tema kontrolü
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (savedTheme) {
        setDarkMode(savedTheme === "dark");
      } else if (prefersDark) {
        setDarkMode(true);
      }
    }
  }, []);

  // Sabit değerler
  const getGridSize = () => (level === 1 ? 3 : 4); // Seviyeye göre grid boyutu

  // Pozisyonları seviyeye göre belirle
  const getPositions = () => {
    if (level === 1) {
      return ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C"];
    } else {
      return [
        "A1",
        "A2",
        "A3",
        "A4",
        "B1",
        "B2",
        "B3",
        "B4",
        "C1",
        "C2",
        "C3",
        "C4",
        "D1",
        "D2",
        "D3",
        "D4",
      ];
    }
  };

  const positions = getPositions();

  // Selectable images (level 1)
  const level1Images = [
    { id: 0, name: "Mountain Landscape" },
    { id: 1, name: "Ocean" },
    { id: 2, name: "City" },
  ];

  // Selectable images (level 2)
  const level2Images = [
    { id: 0, name: "Forest" },
    { id: 1, name: "Desert" },
    { id: 2, name: "Space" },
  ];

  // Aktif seviyedeki resimler
  const puzzleImages = level === 1 ? level1Images : level2Images;

  // Başlangıçta parçaları oluştur
  useEffect(() => {
    initializeGame();
  }, [selectedImage, level]);

  // Tema renkleri
  const theme = {
    background: darkMode
      ? "linear-gradient(180deg, #121212 0%, #1f1f1f 100%)"
      : "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    card: darkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(22, 33, 62, 0.95)",
    highlight: darkMode ? "#bb86fc" : "#e94560",
    secondaryHighlight: darkMode ? "#03dac6" : "#4ecca3",
    text: darkMode ? "#e0e0e0" : "#ffffff",
    secondaryText: darkMode ? "#bbbbbb" : "#cccccc",
    primary: darkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(15, 52, 96, 0.7)",
    secondary: darkMode ? "rgba(45, 45, 45, 0.8)" : "rgba(22, 33, 62, 0.8)",
    border: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.1)",
    cardShadow: darkMode
      ? "0 8px 32px rgba(0, 0, 0, 0.5)"
      : "0 8px 32px rgba(0, 0, 0, 0.4)",
    success: darkMode ? "rgba(3, 218, 198, 0.9)" : "rgba(78, 204, 163, 0.9)",
    error: darkMode ? "rgba(207, 102, 121, 0.9)" : "rgba(233, 69, 96, 0.9)",
  };

  // Oyunu başlat
  const initializeGame = () => {
    const currentPositions = getPositions();

    // Grid boyutuna göre parça oluştur (3x3 için 9, 4x4 için 16 parça)
    const initialPieces: PuzzlePiece[] = currentPositions.map((pos, index) => ({
      id: pos,
      imgPartIndex: index,
    }));

    // Parçaları karıştır (sadece bir kez)
    const shuffledPieces = [...initialPieces].sort(() => Math.random() - 0.5);

    setPieces(shuffledPieces);
    setPlacedPieces({});
    setSelectedPiece(null);
    setIsComplete(false);
    setInputValue("");
    setShowLevelComplete(false);
    setMessage(
      "Select a puzzle piece and enter the position you want to place it in!"
    );
  };

  // Parça seçme işlevi
  const handlePieceSelect = (piece: PuzzlePiece) => {
    // Zaten yerleştirilmiş parça seçilemez
    if (Object.values(placedPieces).includes(piece.id)) {
      setMessage("This piece is already placed!");
      return;
    }

    setSelectedPiece(piece);
    setMessage(
      `A part has been selected. Now enter the location where you want to place it.`
    );
  };

  // Konum giriş işlevi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase());
  };

  // Parçayı yerleştirme işlevi
  const handlePlacePiece = () => {
    if (!selectedPiece) {
      setMessage("First you have to choose a track!");
      return;
    }

    const position = inputValue.trim().toUpperCase();
    const currentPositions = getPositions();

    // Konum geçerli mi?
    if (!currentPositions.includes(position)) {
      if (level === 1) {
        setMessage(
          `Invalid location! Please enter a value between 1A, 1B, ... 3C.`
        );
      } else {
        setMessage(
          `Invalid position! Please enter a value between A1, A2, ... D4.`
        );
      }
      return;
    }

    // Konum zaten dolu mu?
    if (placedPieces[position]) {
      setMessage(
        `${position} location is already full! Please choose another location.`
      );
      return;
    }

    // Parçayı yerleştir
    const newPlacedPieces = { ...placedPieces, [position]: selectedPiece.id };
    setPlacedPieces(newPlacedPieces);
    setSelectedPiece(null);
    setInputValue("");
    setMessage(`The piece was successfully ${position}  placed in position.`);

    // Oyun tamamlandı mı kontrol et
    const totalPieces = level === 1 ? 9 : 16;
    if (Object.keys(newPlacedPieces).length === totalPieces) {
      let isCorrect = true;
      // Her parçanın doğru konumda olup olmadığını kontrol et
      currentPositions.forEach((pos) => {
        if (newPlacedPieces[pos] !== pos) {
          isCorrect = false;
        }
      });

      if (isCorrect) {
        setIsComplete(true);
        if (level === 1) {
          setShowLevelComplete(true);
          setMessage(
            "CONGRATULATIONS! You have completed Level 1! You can move on to Level 2."
          );
        } else {
          setMessage(
            "CONGRATULATIONS! You have successfully completed all levels!"
          );
        }
      }
    }
  };

  // Parçayı kaldırma işlevi
  const handleRemovePiece = (position: string) => {
    if (!placedPieces[position]) {
      return; // Konumda parça yoksa bir şey yapma
    }

    const updatedPieces = { ...placedPieces };
    delete updatedPieces[position];
    setPlacedPieces(updatedPieces);
    setMessage(`Part removed from ${position}.`);
  };

  // Enter tuşuna basıldığında yerleştir
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePlacePiece();
    }
  };

  // Oyunu sıfırla
  const resetGame = () => {
    initializeGame();
  };

  // Sonraki seviyeye geç
  const goToNextLevel = () => {
    if (level === 1 && isComplete) {
      setLevel(2);
      setSelectedImage(0);
      setShowLevelComplete(false);
    }
  };

  // Resim değiştir
  const changeImage = (imageId: number) => {
    setSelectedImage(imageId);
  };

  // Yardım panelini aç/kapat
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  // Dağ manzarası resmi
  const renderMountain = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #add8e6 0%, #b19cd9 100%)",
      }}
    >
      {/* Gökyüzü */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "60%",
          background: "linear-gradient(180deg, #87ceeb 0%, #add8e6 100%)",
        }}
      />

      {/* Bulutlar */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "20%",
          height: "8%",
          borderRadius: "50px",
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow:
            "10px 5px 0 0 rgba(255, 255, 255, 0.6), -10px 5px 0 0 rgba(255, 255, 255, 0.6)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "25%",
          right: "10%",
          width: "15%",
          height: "6%",
          borderRadius: "50px",
          background: "rgba(255, 255, 255, 0.7)",
          boxShadow:
            "8px 5px 0 0 rgba(255, 255, 255, 0.5), -8px 5px 0 0 rgba(255, 255, 255, 0.5)",
          zIndex: 1,
        }}
      />

      {/* Kuşlar */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "35%",
          width: "3%",
          height: "1%",
          background: "#333",
          clipPath:
            "polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 100%, 20% 30%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "40%",
          width: "2%",
          height: "1%",
          background: "#333",
          clipPath:
            "polygon(0% 30%, 50% 0%, 100% 30%, 80% 30%, 50% 100%, 20% 30%)",
          zIndex: 1,
        }}
      />

      {/* Büyük dağ - karlı zirve */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          width: "80%",
          height: "60%",
          background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
          clipPath: "polygon(0% 100%, 30% 30%, 50% 50%, 70% 30%, 100% 100%)",
          zIndex: 2,
        }}
      />

      {/* Karlı zirve */}
      <div
        style={{
          position: "absolute",
          bottom: "40%",
          left: "30%",
          width: "40%",
          height: "20%",
          background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
          clipPath: "polygon(0% 100%, 30% 0%, 50% 40%, 70% 0%, 100% 100%)",
          zIndex: 3,
        }}
      />

      {/* Orta dağ - ağaçlı */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          width: "60%",
          height: "50%",
          background: "linear-gradient(135deg, #9795f0 0%, #e0c3fc 100%)",
          clipPath: "polygon(0% 100%, 40% 40%, 60% 40%, 100% 100%)",
          zIndex: 3,
        }}
      />

      {/* Ağaçlar */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "25%",
          width: "50%",
          height: "10%",
          background:
            "repeating-linear-gradient(to right, transparent, transparent 5px, #2e7d32 5px, #2e7d32 10px)",
          clipPath:
            "polygon(0% 100%, 5% 80%, 10% 100%, 15% 60%, 20% 100%, 25% 70%, 30% 100%, 35% 80%, 40% 100%, 45% 50%, 50% 100%, 55% 70%, 60% 100%, 65% 60%, 70% 100%, 75% 80%, 80% 100%, 85% 50%, 90% 100%, 95% 80%, 100% 100%)",
          zIndex: 4,
        }}
      />

      {/* Küçük dağ - kayalık */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "30%",
          width: "40%",
          height: "40%",
          background: "linear-gradient(135deg, #bdc2e8 0%, #e6dee9 100%)",
          clipPath: "polygon(0% 100%, 50% 20%, 100% 100%)",
          zIndex: 4,
        }}
      />

      {/* Kayalık detaylar */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "40%",
          width: "20%",
          height: "10%",
          background: "#9E9E9E",
          clipPath:
            "polygon(0% 100%, 20% 80%, 30% 100%, 45% 60%, 60% 100%, 80% 80%, 100% 100%)",
          zIndex: 5,
        }}
      />

      {/* Güneş */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "20%",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#ffeb3b",
          boxShadow: "0 0 20px #ffeb3b",
          zIndex: 1,
        }}
      />

      {/* Güneş ışınları */}
      <div
        style={{
          position: "absolute",
          top: "13%",
          right: "19.5%",
          width: "50px",
          height: "50px",
          background:
            "radial-gradient(circle, transparent 40%, rgba(255, 235, 59, 0.3) 40%, transparent 60%, rgba(255, 235, 59, 0.3) 60%, transparent 80%)",
          zIndex: 1,
        }}
      />

      {/* Zemin */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "15%",
          background: "linear-gradient(180deg, #81c784 0%, #66bb6a 100%)",
          zIndex: 5,
        }}
      />

      {/* Göl */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "60%",
          width: "30%",
          height: "8%",
          background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
          borderRadius: "50%",
          transform: "skew(30deg, 0deg)",
          zIndex: 6,
        }}
      />

      {/* Göldeki parıltılar */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "70%",
          width: "3%",
          height: "1%",
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
          zIndex: 7,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "7%",
          left: "75%",
          width: "2%",
          height: "1%",
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
          zIndex: 7,
        }}
      />

      {/* Çiçekler */}
      <div
        style={{
          position: "absolute",
          bottom: "3%",
          left: "10%",
          width: "40%",
          height: "2%",
          background:
            "repeating-linear-gradient(to right, #FF5252, #FF5252 2px, transparent 2px, transparent 15px, #FFEB3B 15px, #FFEB3B 17px, transparent 17px, transparent 30px, #7C4DFF 30px, #7C4DFF 32px, transparent 32px, transparent 45px)",
          zIndex: 6,
        }}
      />
    </div>
  );

  // Okyanus resmi
  const renderOcean = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)",
      }}
    >
      {/* Gökyüzü */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background: "linear-gradient(180deg, #fa709a 30%, #fee140 100%)",
          zIndex: 1,
        }}
      />

      {/* Bulutlar */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "10%",
          width: "25%",
          height: "10%",
          borderRadius: "50px",
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow:
            "15px 10px 0 0 rgba(255, 255, 255, 0.6), -10px 15px 0 0 rgba(255, 255, 255, 0.6)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "15%",
          width: "18%",
          height: "8%",
          borderRadius: "40px",
          background: "rgba(255, 255, 255, 0.7)",
          boxShadow:
            "10px 8px 0 0 rgba(255, 255, 255, 0.5), -8px 10px 0 0 rgba(255, 255, 255, 0.5)",
          zIndex: 2,
        }}
      />

      {/* Uçak */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "60%",
          width: "4%",
          height: "1%",
          background: "#FFFFFF",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "61%",
          width: "1%",
          height: "3%",
          background: "#FFFFFF",
          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "7.5%",
          left: "63%",
          width: "2%",
          height: "2%",
          background: "#FFFFFF",
          clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
          zIndex: 3,
        }}
      />

      {/* Uçak izi */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "64%",
          width: "15%",
          height: "1%",
          background:
            "linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0))",
          zIndex: 2,
        }}
      />

      {/* Deniz */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60%",
          background: "linear-gradient(180deg, #00c6fb 0%, #005bea 100%)",
          zIndex: 2,
        }}
      />

      {/* Dalgalar */}
      <div
        style={{
          position: "absolute",
          bottom: "45%",
          left: 0,
          width: "100%",
          height: "4%",
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "100%",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "35%",
          left: 0,
          width: "100%",
          height: "3%",
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "100%",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: 0,
          width: "100%",
          height: "2%",
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "100%",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: 0,
          width: "100%",
          height: "1%",
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "100%",
          zIndex: 3,
        }}
      />

      {/* Güneş */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)",
          boxShadow: "0 0 30px rgba(255, 154, 158, 0.7)",
          zIndex: 3,
        }}
      />

      {/* Güneş Işınları */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "48%",
          width: "70px",
          height: "70px",
          background:
            "radial-gradient(circle, transparent 40%, rgba(255, 154, 158, 0.3) 40%, transparent 60%, rgba(255, 154, 158, 0.3) 60%, transparent 80%)",
          zIndex: 2,
        }}
      />

      {/* Ada */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "15%",
          width: "20%",
          height: "15%",
          background: "linear-gradient(45deg, #56ab2f 0%, #a8e063 100%)",
          borderRadius: "50% 50% 45% 45%",
          zIndex: 4,
        }}
      />

      {/* Ada ağaçları */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          width: "2%",
          height: "8%",
          background: "#795548",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "23%",
          left: "19%",
          width: "4%",
          height: "5%",
          background: "#43a047",
          borderRadius: "50%",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "26%",
          width: "1.5%",
          height: "6%",
          background: "#795548",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "21%",
          left: "25%",
          width: "3.5%",
          height: "4%",
          background: "#43a047",
          borderRadius: "50%",
          zIndex: 5,
        }}
      />

      {/* Denizaltı */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "45%",
          width: "15%",
          height: "5%",
          background: "#FFC107",
          borderRadius: "40% 60% 60% 40% / 60% 40% 60% 40%",
          zIndex: 4,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "57%",
          width: "4%",
          height: "3%",
          background: "#FFA000",
          borderRadius: "0 50% 50% 0",
          zIndex: 4,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "13%",
          left: "46%",
          width: "2%",
          height: "2%",
          background: "#03A9F4",
          borderRadius: "50%",
          border: "1px solid #0288D1",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "13%",
          left: "50%",
          width: "2%",
          height: "2%",
          background: "#03A9F4",
          borderRadius: "50%",
          border: "1px solid #0288D1",
          zIndex: 5,
        }}
      />

      {/* Balıklar */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "30%",
          width: "4%",
          height: "2%",
          background: "#FF5722",
          clipPath:
            "polygon(0% 50%, 80% 0%, 80% 30%, 100% 30%, 100% 70%, 80% 70%, 80% 100%)",
          zIndex: 4,
          animation: "fishSwim 5s linear infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "40%",
          width: "3%",
          height: "1.5%",
          background: "#E91E63",
          clipPath:
            "polygon(0% 50%, 80% 0%, 80% 30%, 100% 30%, 100% 70%, 80% 70%, 80% 100%)",
          zIndex: 4,
          animation: "fishSwim 7s linear infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "35%",
          right: "25%",
          width: "2.5%",
          height: "1%",
          background: "#9C27B0",
          clipPath:
            "polygon(0% 50%, 80% 0%, 80% 30%, 100% 30%, 100% 70%, 80% 70%, 80% 100%)",
          zIndex: 4,
          animation: "fishSwim 6s linear infinite",
        }}
      />

      {/* Tekne */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "20%",
          width: "60px",
          height: "20px",
          borderRadius: "5px",
          background: "linear-gradient(90deg, #8D6E63 0%, #795548 100%)",
          zIndex: 5,
        }}
      />

      {/* Tekne gövdesi detayları */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "20%",
          width: "60px",
          height: "6px",
          background: "#5D4037",
          zIndex: 6,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "20%",
          width: "10px",
          height: "25px",
          background: "#3E2723",
          clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
          zIndex: 6,
        }}
      />

      {/* Tekne insanı */}
      <div
        style={{
          position: "absolute",
          bottom: "23%",
          right: "22%",
          width: "5px",
          height: "10px",
          background: "#3949AB",
          zIndex: 7,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "26%",
          right: "22%",
          width: "5px",
          height: "5px",
          background: "#FFECB3",
          borderRadius: "50%",
          zIndex: 7,
        }}
      />

      {/* Tekne yelkeni */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "25%",
          width: "3px",
          height: "40px",
          background: "#a1887f",
          zIndex: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "23%",
          width: "30px",
          height: "30px",
          background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
          clipPath: "polygon(0% 100%, 100% 50%, 0% 0%)",
          zIndex: 6,
        }}
      />
    </div>
  );

  // Şehir resmi
  const renderCity = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)",
      }}
    >
      {/* Arka plan gökyüzü */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)",
          zIndex: 1,
        }}
      />

      {/* Ay */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "20%",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
          zIndex: 2,
        }}
      />

      {/* Yıldızlar */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow:
            "0 0 5px rgba(255, 255, 255, 0.8), 20px 30px 0 0 #ffffff, 50px 10px 0 0 #ffffff, 80px 40px 0 0 #ffffff, 100px 15px 0 0 #ffffff, 130px 25px 0 0 #ffffff, 160px 5px 0 0 #ffffff",
          zIndex: 2,
        }}
      />

      {/* Binalar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "70%",
          zIndex: 2,
        }}
      >
        {/* Bina 1 - Modern ofis binası */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "5%",
            width: "8%",
            height: "60%",
            background: "linear-gradient(180deg, #4A4A4A 0%, #2C2C2C 100%)",
            borderRadius: "3px 3px 0 0",
            zIndex: 3,
          }}
        >
          {/* Pencereler */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "10%",
              width: "80%",
              height: "90%",
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 6px, rgba(173, 216, 230, 0.8) 6px, rgba(173, 216, 230, 0.8) 12px)",
            }}
          />

          {/* Bina çatısı */}
          <div
            style={{
              position: "absolute",
              top: "-5%",
              left: "0",
              width: "100%",
              height: "5%",
              background: "#333333",
              borderRadius: "3px 3px 0 0",
            }}
          />

          {/* Anten */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "40%",
              width: "5%",
              height: "10%",
              background: "#111111",
            }}
          />
        </div>

        {/* Bina 2 - Gökdelen */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "15%",
            width: "10%",
            height: "90%",
            background: "linear-gradient(90deg, #303030 50%, #3A3A3A 50%)",
            zIndex: 4,
          }}
        >
          {/* Pencereler */}
          <div
            style={{
              position: "absolute",
              top: "2%",
              left: "5%",
              width: "90%",
              height: "96%",
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(255, 215, 0, 0.5) 3px, rgba(255, 215, 0, 0.5) 6px)",
            }}
          />

          {/* Helikopter pisti */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "3%",
              background: "#505050",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "1%",
              left: "30%",
              width: "40%",
              height: "1%",
              background: "#ffffff",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Bina 3 - Üçgen çatılı bina */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "28%",
            width: "15%",
            height: "70%",
            background: "#212121",
            zIndex: 3,
          }}
        >
          {/* Pencereler - büyük kareler */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "10%",
              width: "80%",
              height: "85%",
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 15px, rgba(135, 206, 235, 0.7) 15px, rgba(135, 206, 235, 0.7) 30px)",
            }}
          />

          {/* Billboard */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "-20%",
              width: "30%",
              height: "20%",
              background: "#E74C3C",
              border: "2px solid #FFFFFF",
              zIndex: 5,
            }}
          />

          {/* Billboard içeriği */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "-15%",
              width: "20%",
              height: "2%",
              background: "#FFFFFF",
              zIndex: 6,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "-15%",
              width: "20%",
              height: "2%",
              background: "#FFFFFF",
              zIndex: 6,
            }}
          />
        </div>

        {/* Bina 4 - Cam cepheli yüksek bina */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "45%",
            width: "12%",
            height: "85%",
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            borderRadius: "5px 5px 0 0",
            zIndex: 4,
          }}
        >
          {/* Cam pencereler - geometrik desen */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "5%",
              width: "90%",
              height: "95%",
              background:
                "repeating-conic-gradient(rgba(173, 216, 230, 0.6) 0% 25%, rgba(135, 206, 250, 0.6) 0% 50%)",
            }}
          />

          {/* Bina tepesi */}
          <div
            style={{
              position: "absolute",
              top: "-3%",
              left: "25%",
              width: "50%",
              height: "3%",
              background: "#104E8B",
              borderRadius: "3px 3px 0 0",
            }}
          />

          {/* Çanak anten */}
          <div
            style={{
              position: "absolute",
              top: "-5%",
              right: "20%",
              width: "20%",
              height: "5%",
              borderRadius: "50% 50% 0 0",
              background: "#DDDDDD",
              transform: "rotate(45deg)",
            }}
          />
        </div>

        {/* Bina 5 - Köprülü kompleks */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "60%",
            width: "25%",
            height: "65%",
            background: "linear-gradient(180deg, #616161 0%, #757575 100%)",
            zIndex: 3,
          }}
        >
          {/* Pencereler - küçük kareler */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "5%",
              width: "90%",
              height: "90%",
              background:
                "repeating-linear-gradient(to right, transparent, transparent 8px, rgba(255, 255, 255, 0.3) 8px, rgba(255, 255, 255, 0.3) 16px), repeating-linear-gradient(to bottom, transparent, transparent 8px, rgba(255, 255, 255, 0.3) 8px, rgba(255, 255, 255, 0.3) 16px)",
            }}
          />

          {/* İkiz kuleler */}
          <div
            style={{
              position: "absolute",
              top: "-15%",
              right: "10%",
              width: "15%",
              height: "15%",
              background: "#424242",
              borderRadius: "2px 2px 0 0",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "-15%",
              right: "30%",
              width: "15%",
              height: "15%",
              background: "#424242",
              borderRadius: "2px 2px 0 0",
            }}
          />

          {/* Köprü */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "-10%",
              width: "20%",
              height: "5%",
              background: "#9E9E9E",
              zIndex: 5,
            }}
          />

          {/* Köprü korkulukları */}
          <div
            style={{
              position: "absolute",
              top: "28%",
              left: "-10%",
              width: "20%",
              height: "1%",
              background:
                "repeating-linear-gradient(90deg, #DDDDDD, #DDDDDD 2px, transparent 2px, transparent 6px)",
              zIndex: 6,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "36%",
              left: "-10%",
              width: "20%",
              height: "1%",
              background:
                "repeating-linear-gradient(90deg, #DDDDDD, #DDDDDD 2px, transparent 2px, transparent 6px)",
              zIndex: 6,
            }}
          />
        </div>

        {/* Bina 6 - Uzun ve ince bina */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "88%",
            width: "7%",
            height: "75%",
            background: "linear-gradient(90deg, #4A148C 0%, #7B1FA2 100%)",
            zIndex: 3,
          }}
        >
          {/* Pencereler - yatay şeritler */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "10%",
              width: "80%",
              height: "95%",
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 10px, rgba(255, 255, 255, 0.5) 10px, rgba(255, 255, 255, 0.5) 13px)",
            }}
          />

          {/* Tepe ışığı */}
          <div
            style={{
              position: "absolute",
              top: "-5%",
              left: "30%",
              width: "40%",
              height: "5%",
              background: "#FF0000",
              borderRadius: "50%",
              boxShadow: "0 0 10px #FF0000",
              animation: "blink 2s infinite",
            }}
          />
        </div>
      </div>

      {/* Ön plan - sokak seviyesi */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "5%",
          background: "#333333",
          zIndex: 6,
        }}
      />

      {/* Sokak lambaları */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "20%",
          width: "1%",
          height: "10%",
          background: "#111111",
          zIndex: 7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          width: "3%",
          height: "1%",
          background: "#111111",
          zIndex: 7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "21%",
          width: "1%",
          height: "1%",
          background: "#FFEB3B",
          borderRadius: "50%",
          boxShadow: "0 0 5px #FFEB3B",
          zIndex: 7,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "70%",
          width: "1%",
          height: "10%",
          background: "#111111",
          zIndex: 7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "70%",
          width: "3%",
          height: "1%",
          background: "#111111",
          zIndex: 7,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "71%",
          width: "1%",
          height: "1%",
          background: "#FFEB3B",
          borderRadius: "50%",
          boxShadow: "0 0 5px #FFEB3B",
          zIndex: 7,
        }}
      />
    </div>
  );

  // Seviye 2 görselleri

  // Orman resmi (4x4 puzzle için)
  const renderForest = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)",
      }}
    >
      {/* Gökyüzü */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background: "linear-gradient(180deg, #64B5F6 0%, #90CAF9 100%)",
          zIndex: 1,
        }}
      />

      {/* Güneş ışınları */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "80%",
          width: "50px",
          height: "50px",
          background: "radial-gradient(circle, #FFEB3B 20%, transparent 70%)",
          boxShadow: "0 0 30px #FFEB3B",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />

      {/* Bulutlar */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "25%",
          height: "10%",
          borderRadius: "50px",
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow:
            "10px 5px 0 0 rgba(255, 255, 255, 0.6), -10px 5px 0 0 rgba(255, 255, 255, 0.6)",
          zIndex: 2,
        }}
      />

      {/* Uzak arka orman - en arkadaki ağaçlar */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: 0,
          width: "100%",
          height: "30%",
          background: "#2E7D32",
          clipPath:
            "polygon(0% 100%, 5% 80%, 10% 95%, 15% 75%, 20% 85%, 25% 70%, 30% 90%, 35% 80%, 40% 95%, 45% 75%, 50% 90%, 55% 80%, 60% 95%, 65% 85%, 70% 95%, 75% 75%, 80% 90%, 85% 80%, 90% 95%, 95% 85%, 100% 100%)",
          zIndex: 3,
        }}
      />

      {/* Orta orman - ortadaki ağaçlar */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: 0,
          width: "100%",
          height: "40%",
          background: "#1B5E20",
          clipPath:
            "polygon(0% 100%, 4% 90%, 8% 95%, 12% 85%, 16% 95%, 20% 80%, 24% 90%, 28% 85%, 32% 95%, 36% 85%, 40% 95%, 44% 80%, 48% 90%, 52% 95%, 56% 85%, 60% 95%, 64% 90%, 68% 95%, 72% 80%, 76% 90%, 80% 95%, 84% 85%, 88% 95%, 92% 90%, 96% 95%, 100% 100%)",
          zIndex: 4,
        }}
      />

      {/* Yakın orman - ön ağaçlar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "35%",
          background: "#004D40",
          clipPath:
            "polygon(0% 100%, 3% 85%, 6% 95%, 9% 80%, 12% 95%, 15% 85%, 18% 95%, 21% 80%, 24% 90%, 27% 95%, 30% 85%, 33% 95%, 36% 80%, 39% 95%, 42% 90%, 45% 95%, 48% 85%, 51% 95%, 54% 85%, 57% 95%, 60% 90%, 63% 95%, 66% 85%, 69% 95%, 72% 90%, 75% 95%, 78% 85%, 81% 95%, 84% 85%, 87% 95%, 90% 85%, 93% 95%, 96% 90%, 100% 100%)",
          zIndex: 5,
        }}
      />

      {/* Büyük ağaç (sol) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "15%",
          width: "10%",
          height: "45%",
          background: "#5D4037",
          zIndex: 6,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "35%",
          left: "8%",
          width: "24%",
          height: "25%",
          background: "#388E3C",
          borderRadius: "50% 50% 50% 50%",
          zIndex: 7,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "45%",
          left: "10%",
          width: "20%",
          height: "15%",
          background: "#4CAF50",
          borderRadius: "50% 50% 50% 50%",
          zIndex: 8,
        }}
      />

      {/* Büyük ağaç (sağ) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: "20%",
          width: "8%",
          height: "40%",
          background: "#6D4C41",
          zIndex: 6,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "14%",
          width: "20%",
          height: "20%",
          background: "#43A047",
          borderRadius: "50% 50% 50% 50%",
          zIndex: 7,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "40%",
          right: "16%",
          width: "16%",
          height: "15%",
          background: "#66BB6A",
          borderRadius: "50% 50% 50% 50%",
          zIndex: 8,
        }}
      />

      {/* Geyik */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "48%",
          width: "12%",
          height: "18%",
          zIndex: 9,
        }}
      >
        {/* Geyik vücudu */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            width: "60%",
            height: "60%",
            background: "#8D6E63",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          }}
        />

        {/* Geyik başı */}
        <div
          style={{
            position: "absolute",
            bottom: "50%",
            left: "65%",
            width: "30%",
            height: "50%",
            background: "#8D6E63",
            borderRadius: "50% 50% 45% 45%",
          }}
        />

        {/* Geyik boynuzları */}
        <div
          style={{
            position: "absolute",
            bottom: "85%",
            left: "70%",
            width: "5%",
            height: "30%",
            background: "#795548",
            transform: "rotate(-20deg)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "85%",
            left: "80%",
            width: "5%",
            height: "35%",
            background: "#795548",
            transform: "rotate(20deg)",
          }}
        />

        {/* Geyik bacakları */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "30%",
            width: "5%",
            height: "40%",
            background: "#795548",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "60%",
            width: "5%",
            height: "40%",
            background: "#795548",
          }}
        />
      </div>

      {/* Yer zemin */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "5%",
          background: "#33691E",
          zIndex: 6,
        }}
      />

      {/* Ön plan çimenler */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "3%",
          background:
            "repeating-linear-gradient(90deg, #558B2F, #558B2F 1px, transparent 1px, transparent 4px, #7CB342 4px, #7CB342 5px, transparent 5px, transparent 9px)",
          zIndex: 10,
        }}
      />

      {/* Çiçekler */}
      <div
        style={{
          position: "absolute",
          bottom: "2%",
          left: "5%",
          width: "90%",
          height: "1%",
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 10px, #F44336 10px, #F44336 12px, transparent 12px, transparent 30px, #FFEB3B 30px, #FFEB3B 32px, transparent 32px, transparent 50px, #9C27B0 50px, #9C27B0 52px, transparent 52px, transparent 70px)",
          zIndex: 11,
        }}
      />
    </div>
  );

  // Çöl resmi (4x4 puzzle için)
  const renderDesert = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #FFB74D 0%, #FF9800 100%)",
      }}
    >
      {/* Gökyüzü */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "55%",
          background: "linear-gradient(180deg, #40C4FF 0%, #FFAB40 100%)",
          zIndex: 1,
        }}
      />

      {/* Parlak Güneş */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "70%",
          width: "60px",
          height: "60px",
          background: "#FFEB3B",
          borderRadius: "50%",
          boxShadow: "0 0 50px #FFD600",
          zIndex: 2,
        }}
      />

      {/* Güneş ışınları */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "68%",
          width: "70px",
          height: "70px",
          background:
            "radial-gradient(circle, transparent 30%, rgba(255, 235, 59, 0.3) 30%, transparent 50%, rgba(255, 235, 59, 0.3) 50%, transparent 70%)",
          zIndex: 2,
        }}
      />

      {/* Uzak kumul tepeleri */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: 0,
          width: "100%",
          height: "25%",
          background: "linear-gradient(180deg, #FFA726 0%, #FFB74D 100%)",
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          zIndex: 3,
        }}
      />

      {/* Orta kumul tepeleri */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "10%",
          width: "30%",
          height: "20%",
          background: "linear-gradient(180deg, #FF9800 0%, #FFA726 100%)",
          borderRadius: "60% 40% 0 0 / 100% 100% 0 0",
          zIndex: 4,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "40%",
          height: "30%",
          background: "linear-gradient(180deg, #FF9800 0%, #FFA726 100%)",
          borderRadius: "40% 60% 0 0 / 100% 100% 0 0",
          zIndex: 4,
        }}
      />

      {/* Kaktüs 1 */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          width: "3%",
          height: "15%",
          background: "#2E7D32",
          borderRadius: "2px",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "16%",
          width: "8%",
          height: "3%",
          background: "#2E7D32",
          borderRadius: "0 2px 2px 0",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "23%",
          width: "6%",
          height: "3%",
          background: "#2E7D32",
          borderRadius: "2px 0 0 2px",
          zIndex: 5,
        }}
      />

      {/* Kaktüs 2 */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "25%",
          width: "4%",
          height: "20%",
          background: "#388E3C",
          borderRadius: "3px",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "29%",
          width: "8%",
          height: "4%",
          background: "#388E3C",
          borderRadius: "3px 0 0 3px",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "25%",
          right: "25%",
          width: "10%",
          height: "3%",
          background: "#388E3C",
          borderRadius: "0 3px 3px 0",
          zIndex: 5,
        }}
      />

      {/* Kumul çukurları ve gölgeler */}
      <div
        style={{
          position: "absolute",
          bottom: "1%",
          left: "30%",
          width: "40%",
          height: "15%",
          background:
            "radial-gradient(ellipse at center, rgba(255, 152, 0, 0.7) 0%, transparent 70%)",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "70%",
          width: "20%",
          height: "10%",
          background:
            "radial-gradient(ellipse at center, rgba(255, 152, 0, 0.7) 0%, transparent 70%)",
          zIndex: 5,
        }}
      />

      {/* Piramit */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "65%",
          width: "20%",
          height: "25%",
          background: "linear-gradient(135deg, #FFD54F 0%, #F57F17 100%)",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          zIndex: 4,
        }}
      />

      {/* Piramit gölgesi */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "85%",
          width: "10%",
          height: "25%",
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%)",
          clipPath: "polygon(0% 100%, 0% 0%, 100% 100%)",
          zIndex: 3,
        }}
      />

      {/* Kumul desenleri */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "5%",
          width: "90%",
          height: "8%",
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255, 152, 0, 0.5) 30px, rgba(255, 152, 0, 0.5) 60px)",
          borderRadius: "50%",
          transform: "rotate(1deg)",
          zIndex: 4,
        }}
      />

      {/* Deve */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "40%",
          width: "15%",
          height: "10%",
          background: "#D68D00",
          borderRadius: "60% 40% 40% 60% / 60% 40% 60% 40%",
          zIndex: 6,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "16%",
          left: "50%",
          width: "8%",
          height: "6%",
          background: "#D68D00",
          borderRadius: "40% 60% 20% 80% / 40% 60% 20% 80%",
          zIndex: 6,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "43%",
          width: "2%",
          height: "8%",
          background: "#D68D00",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "48%",
          width: "2%",
          height: "8%",
          background: "#D68D00",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "38%",
          width: "2%",
          height: "9%",
          background: "#D68D00",
          transform: "rotate(10deg)",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: "52%",
          width: "2%",
          height: "9%",
          background: "#D68D00",
          transform: "rotate(-10deg)",
          zIndex: 5,
        }}
      />

      {/* Devenin hörgücü */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "44%",
          width: "6%",
          height: "5%",
          background: "#BF7D00",
          borderRadius: "50% 50% 30% 30% / 80% 80% 20% 20%",
          zIndex: 6,
        }}
      />

      {/* Zemin/kum */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "15%",
          background: "linear-gradient(180deg, #FFA726 0%, #FF9800 100%)",
          zIndex: 3,
        }}
      />
    </div>
  );

  // Uzay resmi (4x4 puzzle için)
  const renderSpace = () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #000051 0%, #1A237E 100%)",
      }}
    >
      {/* Arka plan yıldızlar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `radial-gradient(1px 1px at ${
            Math.random() * 100
          }% ${Math.random() * 100}%, white, transparent),
            radial-gradient(1px 1px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(2px 2px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(1px 1px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(2px 2px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(1px 1px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(1px 1px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent),
            radial-gradient(1px 1px at ${Math.random() * 100}% ${
            Math.random() * 100
          }%, white, transparent)`,
          zIndex: 1,
        }}
      />

      {/* Büyük Gezegen (Gas Dev) */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #8E24AA 0%, #5E35B1 100%)",
          boxShadow:
            "inset -15px -15px 40px rgba(0, 0, 0, 0.5), 0 0 20px #9C27B0",
          zIndex: 2,
        }}
      />

      {/* Gezegen halkası */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          right: "8%",
          width: "45%",
          height: "10%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(179, 157, 219, 0.5) 30%, rgba(179, 157, 219, 0.7) 50%, rgba(179, 157, 219, 0.5) 70%, transparent 100%)",
          borderRadius: "100%",
          transform: "rotate(-20deg)",
          zIndex: 3,
        }}
      />

      {/* Gezegen yüzey detayları */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "20%",
          width: "25%",
          height: "10%",
          background:
            "linear-gradient(45deg, rgba(103, 58, 183, 0.8) 0%, transparent 100%)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "15%",
          width: "15%",
          height: "15%",
          background:
            "linear-gradient(45deg, rgba(142, 36, 170, 0.8) 0%, transparent 100%)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Küçük gezegen (Mars benzeri) */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "15%",
          width: "15%",
          height: "15%",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #FF5722 0%, #E64A19 100%)",
          boxShadow:
            "inset -5px -5px 20px rgba(0, 0, 0, 0.5), 0 0 10px #FF5722",
          zIndex: 2,
        }}
      />

      {/* Kraterler */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: "17%",
          width: "4%",
          height: "4%",
          borderRadius: "50%",
          background: "rgba(136, 14, 79, 0.5)",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "65%",
          left: "20%",
          width: "3%",
          height: "3%",
          borderRadius: "50%",
          background: "rgba(136, 14, 79, 0.5)",
          zIndex: 3,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "68%",
          left: "19%",
          width: "5%",
          height: "5%",
          borderRadius: "50%",
          background: "rgba(136, 14, 79, 0.5)",
          zIndex: 3,
        }}
      />

      {/* Ay (küçük gezegen uydusu) */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "25%",
          width: "4%",
          height: "4%",
          borderRadius: "50%",
          background: "#BDBDBD",
          boxShadow: "inset -2px -2px 5px rgba(0, 0, 0, 0.5)",
          zIndex: 3,
        }}
      />

      {/* Uzay gemisi */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "40%",
          width: "10%",
          height: "5%",
          background: "#CFD8DC",
          clipPath:
            "polygon(0% 50%, 30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%)",
          zIndex: 5,
        }}
      />

      {/* Kokpit */}
      <div
        style={{
          position: "absolute",
          top: "41%",
          left: "43%",
          width: "4%",
          height: "3%",
          background: "#40C4FF",
          borderRadius: "50%",
          zIndex: 6,
        }}
      />

      {/* İtici */}
      <div
        style={{
          position: "absolute",
          top: "41.5%",
          left: "36%",
          width: "3%",
          height: "2%",
          background: "#FF5722",
          clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)",
          animation: "thrusterPulse 1s infinite alternate",
          zIndex: 5,
        }}
      />

      {/* Kuyruk ışığı */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "30%",
          width: "10%",
          height: "5%",
          background:
            "linear-gradient(90deg, rgba(255, 87, 34, 0.1) 0%, rgba(255, 87, 34, 0.8) 100%)",
          clipPath: "polygon(0% 0%, 100% 40%, 100% 60%, 0% 100%)",
          zIndex: 4,
        }}
      />

      {/* Kuyruklu yıldız */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "20%",
          width: "3%",
          height: "3%",
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 0 10px #FFFFFF",
          zIndex: 4,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "10%",
          width: "15%",
          height: "7%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 100%)",
          zIndex: 3,
        }}
      />

      {/* Nebula */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "30%",
          height: "30%",
          background:
            "radial-gradient(ellipse at center, rgba(33, 150, 243, 0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "25%",
          height: "25%",
          background:
            "radial-gradient(ellipse at center, rgba(233, 30, 99, 0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />

      {/* Başka bir küçük gezegen */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "60%",
          width: "8%",
          height: "8%",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #2196F3 0%, #0D47A1 100%)",
          boxShadow: "inset -2px -2px 10px rgba(0, 0, 0, 0.5)",
          zIndex: 3,
        }}
      />
    </div>
  );

  // Tam resmi göster
  const renderFullImage = () => {
    if (level === 1) {
      switch (selectedImage) {
        case 0:
          return renderMountain();
        case 1:
          return renderOcean();
        case 2:
          return renderCity();
        default:
          return renderMountain();
      }
    } else {
      switch (selectedImage) {
        case 0:
          return renderForest();
        case 1:
          return renderDesert();
        case 2:
          return renderSpace();
        default:
          return renderForest();
      }
    }
  };

  // Resmin belirli bir parçasını göster
  const renderPiecePart = (imgPartIndex: number) => {
    const gridSize = getGridSize();
    const row = Math.floor(imgPartIndex / gridSize);
    const col = imgPartIndex % gridSize;

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "8px",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: `${gridSize * 100}%`,
            height: `${gridSize * 100}%`,
            top: `${-row * 100}%`,
            left: `${-col * 100}%`,
            pointerEvents: "none",
          }}
        >
          {renderFullImage()}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#121212" : "#1a1a2e",
        padding: "1rem 0.5rem",
        fontFamily: "Arial, sans-serif",
        color: theme.text,
        backgroundImage: darkMode
          ? "radial-gradient(circle at 30% 20%, #2d2d2d 0%, #121212 80%)"
          : "radial-gradient(circle at 30% 20%, #242763 0%, #1a1a2e 80%)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          backgroundColor: theme.card,
          borderRadius: "16px",
          boxShadow: theme.cardShadow,
          overflow: "hidden",
          padding: "1.5rem 1rem",
          border: `1px solid ${theme.border}`,
          position: "relative",
        }}
      >
        {/* Tema değiştirme butonu */}
        <div
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: theme.highlight,
            color: theme.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
            zIndex: 100,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {darkMode ? "☀" : "☾"}
        </div>

        {/* Bilgi butonu */}
        <div
          onClick={toggleHelp}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: theme.highlight,
            color: theme.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
            zIndex: 100,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          i
        </div>

        {/* Yardım paneli */}
        {showHelp && (
          <div
            style={{
              position: "absolute",
              top: "4rem",
              right: "1rem",
              width: "300px",
              backgroundColor: theme.secondary,
              borderRadius: "12px",
              padding: "1.2rem",
              zIndex: 99,
              boxShadow: theme.cardShadow,
              border: `1px solid ${theme.border}`,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <h3
              style={{
                color: theme.highlight,
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              🧩 How to Play
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000" : "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    <b>Select</b> a puzzle piece from the pieces section
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000" : "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    <b>Enter position</b> in the input field{" "}
                    {level === 1 ? "(e.g. 1A, 2B...)" : "(e.g. A1, B2...)"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000" : "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Click <b>Place</b> button to position the piece
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000" : "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  4
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    <b>Click on a placed piece</b> to remove it if placed
                    incorrectly
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000" : "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  5
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Place all pieces correctly to <b>complete the puzzle</b>
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "0.6rem",
                backgroundColor: `rgba(${
                  darkMode ? "187, 134, 252" : "233, 69, 96"
                }, 0.2)`,
                borderRadius: "8px",
                fontSize: "0.85rem",
                textAlign: "center",
                border: `1px solid rgba(${
                  darkMode ? "187, 134, 252" : "233, 69, 96"
                }, 0.3)`,
              }}
            >
              Click the info button again to close this panel.
            </div>
          </div>
        )}

        {/* Seviye Tamamlandı Modal */}
        {showLevelComplete && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeIn 0.5s ease",
            }}
          >
            <div
              style={{
                backgroundColor: theme.secondary,
                width: "90%",
                maxWidth: "500px",
                borderRadius: "16px",
                padding: "2.5rem",
                textAlign: "center",
                boxShadow: `0 8px 32px rgba(${
                  darkMode ? "187, 134, 252" : "233, 69, 96"
                }, 0.3)`,
                border: `2px solid rgba(${
                  darkMode ? "187, 134, 252" : "233, 69, 96"
                }, 0.5)`,
              }}
            >
              <h2
                style={{
                  fontSize: "2rem",
                  color: theme.highlight,
                  marginBottom: "1.25rem",
                }}
              >
                🎉 Congratulations! 🎉
              </h2>
              <p
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "2rem",
                  lineHeight: "1.6",
                }}
              >
                You have successfully completed Level 1! Do you want to move on
                to a more challenging 4x4 puzzle?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1.25rem",
                }}
              >
                <button
                  onClick={goToNextLevel}
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000000" : "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = `0 8px 16px rgba(${
                      darkMode ? "187, 134, 252" : "233, 69, 96"
                    }, 0.5)`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span aria-label="Next Level">→</span> Go to Level 2
                </button>
                <button
                  onClick={() => setShowLevelComplete(false)}
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: theme.text,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span aria-label="Close">✕</span> Close
                </button>
              </div>
            </div>
          </div>
        )}

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            color: theme.highlight,
            marginBottom: "1.5rem",
            marginTop: "0.5rem",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          Visual Puzzle Game
        </h1>

        {/* Seviye bilgisi */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: theme.primary,
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "1rem",
              color: theme.text,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              border: `1px solid ${theme.border}`,
            }}
          >
            Level {level}: {level === 1 ? "3x3 Puzzle" : "4x4 Puzzle"}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Top Row: Combined Image Selection, Preview, and Input Area */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            {/* Left Side: Image Selection & Input Controls */}
            <div
              style={{
                backgroundColor: theme.secondary,
                borderRadius: "12px",
                border: `1px solid ${theme.border}`,
                padding: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
                flex: "0 1 auto",
                minWidth: "280px",
                maxWidth: "400px",
                marginRight: "0.25rem",
              }}
            >
              {/* Image Selection Row */}
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: theme.secondaryHighlight,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Select Image
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {puzzleImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => changeImage(img.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor:
                          selectedImage === img.id
                            ? theme.highlight
                            : theme.primary,
                        color:
                          selectedImage === img.id && darkMode
                            ? "#000000"
                            : theme.text,
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.2s ease",
                        transform:
                          selectedImage === img.id
                            ? "translateY(-2px)"
                            : "translateY(0)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <hr
                style={{
                  border: "none",
                  height: "1px",
                  background: `${theme.border}50`,
                  margin: "0.2rem 0",
                }}
              />

              {/* Position Controls */}
              <div>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: theme.secondaryHighlight,
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Position Your Piece
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedPiece && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        color: darkMode ? "#03dac6" : "#ffcc29",
                        padding: "0.3rem 0.5rem",
                        backgroundColor: `${theme.primary}80`,
                        borderRadius: "4px",
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      Selected
                    </div>
                  )}

                  <div style={{ flex: "1", minWidth: "120px" }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        level === 1
                          ? "Enter position (e.g. 1A)"
                          : "Enter position (e.g. A1)"
                      }
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.6rem",
                        backgroundColor: theme.primary,
                        border: selectedPiece
                          ? `1px solid ${theme.highlight}`
                          : `1px solid ${theme.primary}`,
                        borderRadius: "4px",
                        color: theme.text,
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    onClick={handlePlacePiece}
                    style={{
                      padding: "0.5rem 0.8rem",
                      backgroundColor: selectedPiece ? theme.highlight : "#555",
                      color: selectedPiece && darkMode ? "#000000" : theme.text,
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      cursor: selectedPiece ? "pointer" : "not-allowed",
                      boxShadow: selectedPiece
                        ? `0 2px 4px rgba(${
                            darkMode ? "187, 134, 252" : "233, 69, 96"
                          }, 0.3)`
                        : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Place
                  </button>
                </div>

                {/* Message */}
                {message && (
                  <div
                    style={{
                      padding: "0.6rem 0.8rem",
                      marginTop: "0.5rem",
                      backgroundColor: isComplete ? theme.success : theme.error,
                      color: darkMode && isComplete ? "#000000" : "#ffffff",
                      borderRadius: "4px",
                      textAlign: "center",
                      width: "100%",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      animation: isComplete ? "pulse 2s infinite" : "none",
                      border: isComplete
                        ? "1px solid rgba(255, 255, 255, 0.3)"
                        : "none",
                    }}
                  >
                    {message}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                <button
                  onClick={resetGame}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: theme.highlight,
                    color: darkMode ? "#000000" : "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: `0 4px 8px rgba(${
                      darkMode ? "187, 134, 252" : "233, 69, 96"
                    }, 0.4)`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Restart
                </button>

                {level === 2 && (
                  <button
                    onClick={() => setLevel(1)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: theme.primary,
                      color: theme.text,
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span aria-label="Return">←</span> Level 1
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Image Preview */}
            <div
              style={{
                backgroundColor: theme.secondary,
                borderRadius: "12px",
                border: `1px solid ${theme.border}`,
                padding: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: "180px",
                flex: "0 1 auto",
                marginLeft: "0.25rem",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  color: theme.secondaryHighlight,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Full Image Preview
              </h3>
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  border: `2px solid ${theme.border}`,
                }}
              >
                {renderFullImage()}
              </div>
            </div>
          </div>

          {/* Bottom Row: Game Board and Puzzle Pieces side by side */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Puzzle Grid - Left */}
            <div
              style={{
                backgroundColor: theme.primary,
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                width: "100%",
                maxWidth: "450px",
                border: `1px solid ${theme.border}`,
                display: "flex",
                flexDirection: "column",
                flex: "1",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: theme.highlight,
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  textAlign: "center",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                }}
              >
                🎯 Puzzle Board
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${getGridSize()}, 1fr)`,
                  gap: "8px",
                  aspectRatio: "1/1",
                }}
              >
                {positions.map((position) => {
                  const pieceId = placedPieces[position];
                  const piece = pieces.find((p) => p.id === pieceId);
                  const isPiecePlaced = !!piece;

                  return (
                    <div
                      key={position}
                      onClick={() =>
                        isPiecePlaced ? handleRemovePiece(position) : null
                      }
                      style={{
                        position: "relative",
                        backgroundColor: theme.secondary,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        aspectRatio: "1/1",
                        cursor: isPiecePlaced ? "pointer" : "default",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        borderBottom: isPiecePlaced
                          ? `3px solid ${theme.secondaryHighlight}`
                          : `3px solid ${theme.highlight}`,
                      }}
                    >
                      {/* Konum etiketi */}
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: theme.text,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          zIndex: 5,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {position}
                      </div>

                      {/* Yerleştirilmiş parça */}
                      {piece && (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "fadeIn 0.3s ease",
                          }}
                        >
                          {renderPiecePart(piece.imgPartIndex)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Puzzle Parçaları - Right */}
            <div
              style={{
                backgroundColor: theme.primary,
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                border: `1px solid ${theme.border}`,
                width: "100%",
                maxWidth: "450px",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                flex: "1",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: theme.highlight,
                  fontWeight: "bold",
                  marginBottom: "0.25rem",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                }}
              >
                🧩 Puzzle Pieces
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  justifyContent: "center",
                  backgroundColor: `${theme.secondary}50`,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  flex: "1",
                  minHeight: level === 1 ? "210px" : "160px",
                  alignContent: "flex-start",
                }}
              >
                {pieces
                  .filter((p) => !Object.values(placedPieces).includes(p.id))
                  .map((piece) => (
                    <button
                      key={piece.id}
                      onClick={() => handlePieceSelect(piece)}
                      style={{
                        width: level === 1 ? "70px" : "60px",
                        height: level === 1 ? "70px" : "60px",
                        backgroundColor:
                          selectedPiece?.id === piece.id
                            ? theme.highlight
                            : theme.secondary,
                        border:
                          selectedPiece?.id === piece.id
                            ? `3px solid ${darkMode ? "#03dac6" : "#ffcc29"}`
                            : `2px solid ${theme.border}`,
                        borderRadius: "8px",
                        padding: "0",
                        overflow: "hidden",
                        position: "relative",
                        cursor: "pointer",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        transform:
                          selectedPiece?.id === piece.id
                            ? "scale(1.1)"
                            : "scale(1)",
                        boxShadow:
                          selectedPiece?.id === piece.id
                            ? `0 6px 12px rgba(${
                                darkMode ? "3, 218, 198" : "255, 204, 41"
                              }, 0.4)`
                            : "0 2px 4px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {renderPiecePart(piece.imgPartIndex)}
                    </button>
                  ))}
                {pieces.filter(
                  (p) => !Object.values(placedPieces).includes(p.id)
                ).length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      color: theme.secondaryText,
                      fontStyle: "italic",
                      width: "100%",
                    }}
                  >
                    All pieces have been placed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animasyonları */}
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.03);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes blink {
            0% {
              opacity: 1;
              box-shadow: 0 0 10px #ff0000;
            }
            50% {
              opacity: 0.3;
              box-shadow: 0 0 2px #ff0000;
            }
            100% {
              opacity: 1;
              box-shadow: 0 0 10px #ff0000;
            }
          }

          @keyframes fishSwim {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(-50px);
            }
            100% {
              transform: translateX(0);
            }
          }

          @keyframes thrusterPulse {
            from {
              background: #ff5722;
            }
            to {
              background: #ffeb3b;
              box-shadow: 0 0 10px #ffeb3b;
            }
          }

          @media (max-width: 768px) {
            h1 {
              font-size: 1.8rem !important;
              margin-bottom: 1rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ImagePuzzleGame;
