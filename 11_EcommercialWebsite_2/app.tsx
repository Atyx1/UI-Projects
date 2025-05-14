"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";

interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images: ProductImage[];
  description: string;
  isTopSeller: boolean;
}

interface Artisan {
  id: number;
  name: string;
  story: string;
  image: string;
  craft: string;
}

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const HomePage: React.FC = () => {
  const featuredProducts: Product[] = [
    {
      id: 1,
      name: "Hand-carved Wooden Bowl",
      price: 78.99,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1628245612384-6d8bf598a2e4?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Hand-carved wooden bowl with smooth finish",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1661446569716-86e93bf267d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Hand-carved wooden bowl from above",
        },
        {
          id: 3,
          url: "https://plus.unsplash.com/premium_photo-1666663151830-f900bdbecc47?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Hand-carved wooden bowl with fruits",
        },
      ],
      description:
        "Meticulously crafted by local artisans using sustainable hardwood, each bowl features unique grain patterns and a food-safe finish. Perfect for serving salads or as a decorative centerpiece.",
      isTopSeller: true,
    },
    {
      id: 2,
      name: "Ceramic Tea Set",
      price: 124.99,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1651841664269-909986d0a136?q=80&w=2024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Complete ceramic tea set with teapot and cups",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Ceramic tea cups arranged in a circle",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1563826904577-6b72c5d75e53?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Person pouring tea from ceramic teapot",
        },
      ],
      description:
        "Each piece in this elegant tea set is uniquely glazed with natural dyes and hand-finished. The set includes a teapot, four cups, and a serving tray - perfect for your tea ceremony or daily enjoyment.",
      isTopSeller: true,
    },
    {
      id: 3,
      name: "Woven Wall Hanging",
      price: 65.5,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1567696154083-9547fd0c8e1d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Intricate woven wall hanging in earthy tones",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1718939042031-6c6b5a99ebaa?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Close-up of wall hanging textile detail",
        },
        {
          id: 3,
          url: "https://plus.unsplash.com/premium_photo-1664277022150-4de05baea164?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Wall hanging displayed in modern living room",
        },
      ],
      description:
        "Intricate patterns created with traditional techniques and natural fibers. This wall hanging adds texture and warmth to any space, with each piece reflecting the unique artistic vision of the weaver.",
      isTopSeller: false,
    },
    {
      id: 4,
      name: "Handmade Leather Journal",
      price: 45.0,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Closed leather journal with embossed design",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1518893883800-45cd0954574b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Open leather journal showing handmade paper",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Person writing in leather journal",
        },
      ],
      description:
        "Bound by hand with locally sourced leather and recycled paper. Each journal features 120 pages of acid-free paper, perfect for sketching, journaling, or preserving memories.",
      isTopSeller: true,
    },
    {
      id: 5,
      name: "Hand-forged Kitchen Knife",
      price: 189.99,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1687863919633-e3fc8b2765a9?q=80&w=2115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Chef's knife with wooden handle",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1687864182658-c6e4f310ee6c?q=80&w=2120&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Close-up of knife blade showing damascus pattern",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1654011011654-a90a68bacf12?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Knife being used to chop vegetables",
        },
      ],
      description:
        "Meticulously crafted by master bladesmiths, this kitchen knife features a Damascus steel blade and ergonomic walnut handle. Perfectly balanced and razor-sharp, it's an heirloom-quality tool for serious cooks.",
      isTopSeller: false,
    },
    {
      id: 6,
      name: "Handblown Glass Vase",
      price: 112.5,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1740859783411-e2a55ba0e844?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Blue and clear handblown glass vase",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1725559389885-78ea2d4f3c7a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Glass vase with flowers",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1617916487369-e0bb123f3637?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Collection of glass vases in different colors",
        },
      ],
      description:
        "Each vase is individually blown using traditional techniques, resulting in a one-of-a-kind piece with subtle variations in color and form. The organic shapes catch and refract light beautifully.",
      isTopSeller: true,
    },

    {
      id: 7,
      name: "Handcrafted Wooden Cutting Board",
      price: 68.5,
      images: [
        {
          id: 1,
          url: "https://plus.unsplash.com/premium_photo-1677700640123-beeeffce4944?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Wooden cutting board with handle",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Close-up of wood grain pattern",
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1732575886697-0ddcbce961dd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Cutting board with sliced bread and cheese",
        },
      ],
      description:
        "Crafted from sustainably harvested hardwood, this cutting board combines functionality and beauty. The end-grain construction is gentle on knife edges and the integrated handle makes serving easy.",
      isTopSeller: true,
    },
    {
      id: 8,
      name: "Hand-loomed Wool Throw Blanket",
      price: 129.0,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1600285037594-86159871705f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Wool throw blanket folded on couch",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1715866568589-ac5a406eda54?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Close-up of wool weave texture",
        },
        {
          id: 3,
          url: "https://plus.unsplash.com/premium_photo-1667480979050-e2e4a0256ddf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Person wrapped in wool blanket",
        },
      ],
      description:
        "This luxurious throw blanket is hand-loomed from 100% natural wool, creating a soft, warm layer that's perfect for cool evenings. The classic herringbone pattern and fringed edges add timeless style to any space.",
      isTopSeller: false,
    },
    {
      id: 9,
      name: "Handmade Beeswax Candles",
      price: 32.0,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1579167728798-a1cf3d595960?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          alt: "Set of beeswax pillar candles",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1732117924212-39bfaec174c9?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Lit beeswax candle close-up",
        },
        {
          id: 3,
          url: "https://plus.unsplash.com/premium_photo-1736517207265-4192638d9dd8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Beeswax candles in minimalist interior",
        },
      ],
      description:
        "This set of three pure beeswax candles is hand-poured and naturally scented with essential oils. Beeswax burns cleaner and longer than paraffin, with a subtle honey aroma and warm, golden light.",
      isTopSeller: true,
    },
  ];

  const topSellers = featuredProducts.filter((product) => product.isTopSeller);

  const artisans: Artisan[] = [
    {
      id: 1,
      name: "Elena Rodriguez",
      story:
        "Fourth-generation woodworker from Barcelona who combines traditional Spanish techniques with contemporary design. Each piece tells a story of heritage, craftsmanship, and innovation.",
      image:
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Woodworking",
    },
    {
      id: 2,
      name: "Marcus Chen",
      story:
        "Former engineer who discovered ceramics during a sabbatical in Japan. His pieces blend precise geometric patterns with the wabi-sabi philosophy of finding beauty in imperfection.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Ceramics",
    },
    {
      id: 3,
      name: "Amara Johnson",
      story:
        "Textile artist from Ghana whose vibrant weavings and tapestries incorporate traditional Kente patterns while addressing contemporary social themes. Her work has been exhibited internationally.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Textiles",
    },
    {
      id: 4,
      name: "Hiroshi Tanaka",
      story:
        "Master knifemaker who spent 15 years apprenticing with bladesmiths across Japan before establishing his own workshop. Each knife requires over 100 hours of meticulous craftsmanship.",
      image:
        "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Bladesmithing",
    },
    {
      id: 5,
      name: "Sofia Mendoza",
      story:
        "Glass artist who combines traditional blowing techniques with innovative materials. Her luminous sculptures capture and transform light in unexpected ways, inspired by the landscapes of her native Chile.",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Glassblowing",
    },
    {
      id: 6,
      name: "Kwame Osei",
      story:
        "Self-taught leatherworker who uses traditional vegetable tanning methods passed down through generations. His commitment to sustainable practices means each piece ages beautifully and lasts for decades.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Leatherwork",
    },
    {
      id: 7,
      name: "Aria Patel",
      story:
        "Jewelry designer who combines traditional Indian metalworking techniques with contemporary minimalist aesthetics. Each piece is handcrafted using recycled precious metals and ethically sourced gemstones.",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Jewelry",
    },
    {
      id: 8,
      name: "Thiago Santos",
      story:
        "Formerly an architect, Thiago now creates functional ceramic pieces that blur the line between art and utility. His work is influenced by the modernist architecture of his hometown São Paulo.",
      image:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Ceramics",
    },
    {
      id: 9,
      name: "Ingrid Johansson",
      story:
        "After studying traditional Scandinavian weaving for a decade, Ingrid now creates contemporary textiles that honor ancient patterns while exploring modern themes of sustainability and connection.",
      image:
        "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Weaving",
    },
    {
      id: 10,
      name: "Omar Hassan",
      story:
        "Calligraphy artist who bridges traditional Arabic script with contemporary abstract expressionism. His work explores the intersection of language, identity, and visual poetry.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
      craft: "Calligraphy",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah M.",
      text: "The craftsmanship is beyond compare. I've purchased several items and each one has a story and soul.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 2,
      name: "James T.",
      text: "Not only are the products beautiful, but knowing I'm supporting local artisans makes each purchase special.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 3,
      name: "Maya K.",
      text: "The ceramic set I purchased has become the centerpiece of my dining room. Absolutely stunning work!",
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
  ];

  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentTopSellerSlide, setCurrentTopSellerSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // State for inline product details
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Refs for carousels
  const heroCarouselRef = useRef<HTMLDivElement>(null);
  // TopSeller carousel ref will be used in future iterations
  const topSellerCarouselRef = useRef<HTMLDivElement>(null);

  // Combined hero content (products and artisans)
  const heroContent = [
    ...featuredProducts.map((product) => ({
      type: "product" as const,
      data: product,
    })),
    ...artisans.map((artisan) => ({
      type: "artisan" as const,
      data: artisan,
    })),
  ];

  // Function to get optimized hero image based on item type
  const getHeroImage = (item: (typeof heroContent)[0]) => {
    if (item.type === "product") {
      return {
        url: item.data.images[0].url,
        alt: item.data.images[0].alt,
        portrait: true,
      };
    } else {
      return {
        url: item.data.image,
        alt: item.data.name,
        portrait: true,
      };
    }
  };

  // Add state for selected artisan
  const [selectedArtisan, setSelectedArtisan] = useState<number | null>(null);

  // Add state for current product image
  const [activeImageIndex, setActiveImageIndex] = useState<{
    [key: number]: number;
  }>({});

  // Add this state for artisan carousel
  const [artisanSlide, setArtisanSlide] = useState(0);
  // Add this state for modal
  const [artisanModalOpen, setArtisanModalOpen] = useState(false);

  // Add state for product carousel and modal
  const [productSlide, setProductSlide] = useState(0);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Add state for active link (defaulting to "Home")
  const [activeLink, setActiveLink] = useState("Home");

  // Add state for toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // Handle theme toggling
  useEffect(() => {
    // Check if user has a stored preference
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    } else {
      // If no stored preference, check system preference
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  // Apply theme effect (separate from initial setting)
  useEffect(() => {
    // Store user preference
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auto-advance hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroContent.length]);

  // Handle hero carousel navigation
  const navigateHeroCarousel = (index: number) => {
    setCurrentHeroSlide(index);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Add to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    // Show toast notification
    setToast({ message: `${product.name} added to cart`, visible: true });

    // Hide toast after 4 seconds
    setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 4000);
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Toggle favorites
  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={
          i < rating ? "text-[#CB997E]" : "text-gray-300 dark:text-gray-600"
        }
      >
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  // Function to get the current product image
  const getCurrentProductImage = (product: Product, imageIndex?: number) => {
    const index =
      imageIndex !== undefined ? imageIndex : activeImageIndex[product.id] || 0;

    return product.images[index] || product.images[0];
  };

  // Calculate how many artisans to show per slide based on screen size
  const artisansPerSlide = 4; // Default for desktop
  const totalArtisanSlides = Math.ceil(artisans.length / artisansPerSlide);

  // Navigate artisan carousel
  const navigateArtisanCarousel = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setArtisanSlide((prev) => (prev > 0 ? prev - 1 : 0));
    } else {
      setArtisanSlide((prev) =>
        prev < totalArtisanSlides - 1 ? prev + 1 : prev
      );
    }
  };

  // Calculate number of products per slide and total slides
  const productsPerSlide = 4; // Show 4 products per slide
  const totalProductSlides = Math.ceil(
    featuredProducts.length / productsPerSlide
  );

  // Navigate product carousel
  const navigateProductCarousel = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setProductSlide((prev) => (prev > 0 ? prev - 1 : 0));
    } else {
      setProductSlide((prev) =>
        prev < totalProductSlides - 1 ? prev + 1 : prev
      );
    }
  };

  return (
    <>
      <div className={`font-[Inter,sans-serif] ${darkMode ? "dark" : ""}`}>
        <Head>
          <title>Artisan Crafts | Celebrating Local Artisans</title>
          <meta
            name="description"
            content="Discover unique handcrafted items from local artisans"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        {/* Site Container */}
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-shadow duration-300 shadow-sm hover:shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold">
                  Artisan<span className="text-[#CB997E]">Crafts</span>
                </h1>
              </div>

              {/* Mobile Icons: Hamburger, Theme, Cart */}
              <div className="flex items-center space-x-4 md:order-last">
                {/* Theme toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#CB997E] focus:ring-opacity-50"
                >
                  {darkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                {/* Cart button with badge */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow relative focus:outline-none focus:ring-2 focus:ring-[#CB997E] focus:ring-opacity-50"
                  aria-label="Open cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#CB997E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* Mobile menu button */}
                <button
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#CB997E] focus:ring-opacity-50"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-label="Main Menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {menuOpen ? (
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

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {["Home", "Shop", "Artisans", "About", "Contact"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className={`font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CB997E] ${
                        activeLink === link
                          ? "text-[#CB997E] dark:text-[#E6B396]"
                          : "text-gray-700 dark:text-gray-300 hover:text-[#CB997E] dark:hover:text-[#E6B396]"
                      }`}
                      onClick={() => setActiveLink(link)}
                    >
                      {link}
                    </a>
                  )
                )}
              </nav>
            </div>

            {/* Mobile Navigation Drawer - slides from left */}
            <div
              className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 transform ${
                menuOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out md:hidden`}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">
                    Artisan<span className="text-[#CB997E]">Crafts</span>
                  </h2>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <nav className="flex flex-col items-start space-y-6 mt-4">
                  {["Home", "Shop", "Artisans", "About", "Contact"].map(
                    (link) => (
                      <a
                        key={link}
                        href="#"
                        className={`text-lg font-medium transition-colors ${
                          activeLink === link
                            ? "text-[#CB997E] dark:text-[#E6B396]"
                            : "text-gray-700 dark:text-gray-300 hover:text-[#CB997E] dark:hover:text-[#E6B396]"
                        }`}
                        onClick={() => {
                          setActiveLink(link);
                          setMenuOpen(false);
                        }}
                      >
                        {link}
                      </a>
                    )
                  )}
                </nav>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Hero Carousel */}
            <section className="mb-16 relative overflow-hidden rounded-xl shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
                ref={heroCarouselRef}
              >
                {heroContent.map((item) => {
                  const heroImage = getHeroImage(item);
                  return (
                    <div
                      key={`${item.type}-${item.data.id}`}
                      className="relative flex-shrink-0 w-full flex flex-col md:flex-row bg-white dark:bg-gray-800"
                    >
                      {/* Left side - Portrait Image */}
                      <div className="md:w-1/2 h-[300px] md:h-[600px] relative overflow-hidden">
                        <img
                          src={heroImage.url}
                          alt={heroImage.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Right side - Content Area */}
                      <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                        <div className="max-w-xl">
                          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                            {item.data.name}
                          </h2>

                          {item.type === "product" ? (
                            <>
                              <p className="text-xl mb-4 text-[#CB997E] font-bold">
                                {formatPrice(item.data.price)}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3">
                                {item.data.description}
                              </p>
                              <button
                                className="bg-[#CB997E] hover:bg-[#A3B18A] px-6 py-3 rounded-md text-white font-medium transition-colors inline-flex items-center"
                                onClick={() => setSelectedProduct(item.data.id)}
                              >
                                View Details
                                <svg
                                  className="ml-2 h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-xl mb-4 text-[#CB997E] font-bold">
                                {item.data.craft} Artisan
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3">
                                {item.data.story}
                              </p>
                              <button
                                className="bg-[#CB997E] hover:bg-[#A3B18A] px-6 py-3 rounded-md text-white font-medium transition-colors inline-flex items-center"
                                onClick={() => {
                                  setSelectedArtisan(item.data.id);
                                  setArtisanModalOpen(true);
                                }}
                              >
                                Meet the Artisan
                                <svg
                                  className="ml-2 h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {heroContent.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentHeroSlide === idx
                        ? "bg-[#CB997E] w-8"
                        : "bg-white/50 hover:bg-white/80 dark:bg-gray-700/50 dark:hover:bg-gray-700/80"
                    }`}
                    onClick={() => navigateHeroCarousel(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Previous/Next Buttons */}
              <button
                onClick={() =>
                  navigateHeroCarousel(
                    currentHeroSlide > 0
                      ? currentHeroSlide - 1
                      : heroContent.length - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={() =>
                  navigateHeroCarousel(
                    (currentHeroSlide + 1) % heroContent.length
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Next slide"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </section>

            {/* Artisan Section */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#CB997E]">
                Meet Our Artisans
              </h2>

              {artisanModalOpen && selectedArtisan ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => {
                      setArtisanModalOpen(false);
                      setSelectedArtisan(null);
                    }}
                  ></div>

                  <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                    {(() => {
                      const artisan = artisans.find(
                        (a) => a.id === selectedArtisan
                      );
                      if (!artisan) return null;

                      return (
                        <>
                          <button
                            onClick={() => {
                              setArtisanModalOpen(false);
                              setSelectedArtisan(null);
                            }}
                            className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>

                          <div className="md:w-5/12 h-60 md:h-auto">
                            <img
                              src={artisan.image}
                              alt={artisan.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="md:w-7/12 p-6 md:p-8 overflow-y-auto">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                              {artisan.name}
                            </h3>
                            <p className="text-lg font-medium text-[#CB997E] dark:text-[#E6B396] mb-4">
                              {artisan.craft} Artisan
                            </p>

                            <div className="prose prose-lg dark:prose-invert max-w-none">
                              <p className="text-gray-600 dark:text-gray-400 mb-6 font-light leading-relaxed">
                                {artisan.story}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 mb-6 font-light leading-relaxed">
                                With a passion for {artisan.craft.toLowerCase()}{" "}
                                that spans over a decade,{" "}
                                {artisan.name.split(" ")[0]} has developed a
                                unique approach that honors traditional
                                techniques while exploring contemporary themes
                                and aesthetics.
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                Each piece is carefully handcrafted in{" "}
                                {artisan.name.split(" ")[0]}&apos;s studio,
                                reflecting both technical mastery and artistic
                                vision. The result is a collection of items that
                                are not only beautiful and functional, but also
                                carry the story of their maker.
                              </p>
                            </div>

                            <div className="mt-8 flex space-x-4">
                              <a
                                href="#"
                                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                Contact
                              </a>
                              <a
                                href="#"
                                className="inline-flex items-center px-4 py-2 bg-[#CB997E] rounded-md text-white hover:bg-[#A3B18A] transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                                Shop Collection
                              </a>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Carousel Navigation Buttons */}
                  <button
                    onClick={() => navigateArtisanCarousel("prev")}
                    disabled={artisanSlide === 0}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-800 dark:text-gray-200 ${
                      artisanSlide === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white dark:hover:bg-gray-800"
                    }`}
                    aria-label="Previous artisans"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigateArtisanCarousel("next")}
                    disabled={artisanSlide >= totalArtisanSlides - 1}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-800 dark:text-gray-200 ${
                      artisanSlide >= totalArtisanSlides - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white dark:hover:bg-gray-800"
                    }`}
                    aria-label="Next artisans"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Carousel Container */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${artisanSlide * 100}%)`,
                      }}
                    >
                      {/* Grouped artisans for each slide */}
                      {Array.from({ length: totalArtisanSlides }).map(
                        (_, slideIndex) => (
                          <div
                            key={`slide-${slideIndex}`}
                            className="flex-shrink-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                          >
                            {artisans
                              .slice(
                                slideIndex * artisansPerSlide,
                                (slideIndex + 1) * artisansPerSlide
                              )
                              .map((artisan) => (
                                <div
                                  key={artisan.id}
                                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                                >
                                  <div className="relative h-80">
                                    <img
                                      src={artisan.image}
                                      alt={artisan.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                      {artisan.name}
                                    </h3>
                                    <p className="text-[#CB997E] dark:text-[#E6B396] font-medium mb-3">
                                      {artisan.craft} Artisan
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3">
                                      {artisan.story}
                                    </p>
                                    <button
                                      className="w-full mt-4 bg-[#CB997E] hover:bg-[#A3B18A] text-white py-2 rounded-md font-medium transition-colors"
                                      onClick={() => {
                                        setSelectedArtisan(artisan.id);
                                        setArtisanModalOpen(true);
                                      }}
                                    >
                                      View Full Profile
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Carousel Indicators */}
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalArtisanSlides }).map(
                      (_, idx) => (
                        <button
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-all ${
                            artisanSlide === idx
                              ? "bg-[#CB997E] w-8"
                              : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                          }`}
                          onClick={() => setArtisanSlide(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Products Carousel - Replace the existing section */}
            <section className="mb-16 overflow-hidden">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#CB997E]">
                Top Sellers
              </h2>

              <div className="relative">
                {/* Carousel Navigation Buttons */}
                <button
                  onClick={() => navigateProductCarousel("prev")}
                  disabled={productSlide === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-md text-gray-800 dark:text-gray-200 ${
                    productSlide === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/80 dark:hover:bg-gray-800/80"
                  }`}
                  aria-label="Previous products"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => navigateProductCarousel("next")}
                  disabled={productSlide >= totalProductSlides - 1}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-md text-gray-800 dark:text-gray-200 ${
                    productSlide >= totalProductSlides - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/80 dark:hover:bg-gray-800/80"
                  }`}
                  aria-label="Next products"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Product Carousel */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${productSlide * 100}%)` }}
                  >
                    {/* Grouped products for each slide */}
                    {Array.from({ length: totalProductSlides }).map(
                      (_, slideIndex) => (
                        <div
                          key={`product-slide-${slideIndex}`}
                          className="flex-shrink-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                          {featuredProducts
                            .slice(
                              slideIndex * productsPerSlide,
                              (slideIndex + 1) * productsPerSlide
                            )
                            .map((product) => {
                              const currentImage =
                                getCurrentProductImage(product);

                              return (
                                <div
                                  key={product.id}
                                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col"
                                >
                                  <div className="relative aspect-square overflow-hidden">
                                    <img
                                      src={currentImage.url}
                                      alt={currentImage.alt}
                                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                    />
                                    {product.isTopSeller && (
                                      <div className="absolute top-2 left-2 bg-[#CB997E]/90 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center">
                                        <svg
                                          className="w-3.5 h-3.5 mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Top Seller
                                      </div>
                                    )}
                                    <button
                                      className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-[#CB997E] transition-colors"
                                      onClick={() => toggleFavorite(product.id)}
                                      aria-label={
                                        favorites.includes(product.id)
                                          ? "Remove from favorites"
                                          : "Add to favorites"
                                      }
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill={
                                          favorites.includes(product.id)
                                            ? "#CB997E"
                                            : "none"
                                        }
                                        viewBox="0 0 24 24"
                                        stroke={
                                          favorites.includes(product.id)
                                            ? "#CB997E"
                                            : "currentColor"
                                        }
                                        strokeWidth="2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                      {product.name}
                                    </h3>
                                    <p className="text-[#CB997E] dark:text-[#E6B396] font-bold mb-4">
                                      {formatPrice(product.price)}
                                    </p>
                                    <div className="flex space-x-2 mt-auto">
                                      <button
                                        className="flex-1 bg-[#CB997E] hover:bg-[#A3B18A] text-white py-2 rounded-md font-medium transition-colors"
                                        onClick={() => addToCart(product)}
                                      >
                                        Add to Cart
                                      </button>
                                      <button
                                        className="flex-1 border-2 border-[#CB997E] text-[#CB997E] hover:bg-[#CB997E] hover:text-white py-2 rounded-md font-medium transition-colors"
                                        onClick={() => {
                                          setSelectedProduct(product.id);
                                          setProductModalOpen(true);
                                        }}
                                      >
                                        Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: totalProductSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all border ${
                        productSlide === idx
                          ? "bg-[#CB997E] border-[#CB997E]"
                          : "bg-transparent border-white/70 dark:border-gray-600 hover:border-[#CB997E]/50 dark:hover:border-[#CB997E]/50"
                      }`}
                      onClick={() => setProductSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Product Detail Modal */}
            {productModalOpen && selectedProduct ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => {
                    setProductModalOpen(false);
                    setSelectedProduct(null);
                  }}
                ></div>

                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                  {(() => {
                    const product = featuredProducts.find(
                      (p) => p.id === selectedProduct
                    );
                    if (!product) return null;

                    const currentImage = getCurrentProductImage(product);

                    return (
                      <>
                        <button
                          onClick={() => {
                            setProductModalOpen(false);
                            setSelectedProduct(null);
                          }}
                          className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        {/* Left side - Product Images */}
                        <div className="md:w-1/2 h-60 md:h-auto">
                          <div className="h-full">
                            <img
                              src={currentImage.url}
                              alt={currentImage.alt}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Image Thumbnails */}
                          <div className="absolute bottom-4 left-0 md:bottom-4 md:left-4 flex space-x-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                            {product.images.map((image, idx) => (
                              <button
                                key={image.id}
                                className={`w-12 h-12 rounded overflow-hidden border-2 ${
                                  (activeImageIndex[product.id] || 0) === idx
                                    ? "border-[#CB997E]"
                                    : "border-transparent"
                                }`}
                                onClick={() => {
                                  setActiveImageIndex({
                                    ...activeImageIndex,
                                    [product.id]: idx,
                                  });
                                }}
                              >
                                <img
                                  src={image.url}
                                  alt={`${product.name} view ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right side - Product Details */}
                        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-bold text-[#CB997E] dark:text-[#E6B396] mb-6">
                            {formatPrice(product.price)}
                          </p>

                          <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Description
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {product.description}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Each piece tells a story of traditional
                              craftsmanship and sustainability, making it not
                              just a purchase but an investment in artisan
                              heritage and ethical practices.
                            </p>
                          </div>

                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                              Specifications
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="flex flex-col">
                                <dt className="text-sm text-gray-500 dark:text-gray-400">
                                  Material
                                </dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                  Sustainable Hardwood
                                </dd>
                              </div>
                              <div className="flex flex-col">
                                <dt className="text-sm text-gray-500 dark:text-gray-400">
                                  Origin
                                </dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                  Handcrafted in Portugal
                                </dd>
                              </div>
                              <div className="flex flex-col">
                                <dt className="text-sm text-gray-500 dark:text-gray-400">
                                  Dimensions
                                </dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                  12&quot; x 8&quot; x 3&quot;
                                </dd>
                              </div>
                              <div className="flex flex-col">
                                <dt className="text-sm text-gray-500 dark:text-gray-400">
                                  Care
                                </dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                  Hand wash only
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <button
                            className="w-full bg-[#CB997E] hover:bg-[#A3B18A] text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center"
                            onClick={() => {
                              addToCart(product);
                              setProductModalOpen(false);
                            }}
                          >
                            <svg
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            Add to Cart
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : null}

            {/* Product Details Section - Replace with null since we're using a modal now */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#CB997E]">
                Our Products
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => {
                  const currentImage = getCurrentProductImage(product);

                  return (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={currentImage.url}
                          alt={currentImage.alt}
                          className="w-full h-64 object-cover"
                        />
                        {product.isTopSeller && (
                          <div className="absolute top-2 left-2 bg-[#CB997E]/90 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center">
                            <svg
                              className="w-3.5 h-3.5 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Top Seller
                          </div>
                        )}
                        <button
                          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-400 hover:text-[#CB997E] transition-colors"
                          onClick={() => toggleFavorite(product.id)}
                          aria-label={
                            favorites.includes(product.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill={
                              favorites.includes(product.id)
                                ? "#CB997E"
                                : "none"
                            }
                            viewBox="0 0 24 24"
                            stroke={
                              favorites.includes(product.id)
                                ? "#CB997E"
                                : "currentColor"
                            }
                            strokeWidth={
                              favorites.includes(product.id) ? "0" : "2"
                            }
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                          {product.images.map((image, idx) => (
                            <button
                              key={image.id}
                              className={`w-2 h-2 rounded-full transition-all border ${
                                (activeImageIndex[product.id] || 0) === idx
                                  ? "bg-[#CB997E] border-[#CB997E]"
                                  : "bg-transparent border-white/70 dark:border-gray-600 hover:border-[#CB997E]/50 dark:hover:border-[#CB997E]/50"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex({
                                  ...activeImageIndex,
                                  [product.id]: idx,
                                });
                              }}
                              aria-label={`View image ${idx + 1} of product ${
                                product.name
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-[#CB997E] dark:text-[#E6B396] font-bold mb-4">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            className="flex-1 bg-[#CB997E] hover:bg-[#A3B18A] text-white py-2 rounded-md font-medium transition-colors"
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </button>
                          <button
                            className="flex-1 border-2 border-[#CB997E] text-[#CB997E] hover:bg-[#CB997E] hover:text-white py-2 rounded-md font-medium transition-colors"
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setProductModalOpen(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>

          {/* Cart Drawer */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg rounded-l-2xl transform ${
              cartOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Your Cart
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close cart"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Your cart is empty
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-4 px-4 py-2 bg-[#CB997E] hover:bg-[#A3B18A] text-white rounded-md transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                      >
                        <img
                          src={item.images[0].url}
                          alt={item.images[0].alt}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                            {item.name}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-[#CB997E] dark:text-[#E6B396]">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors self-start"
                          aria-label={`Remove ${item.name} from cart`}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {formatPrice(
                        cart.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                  <button className="w-full bg-[#CB997E] hover:bg-[#A3B18A] text-white py-3 rounded-md font-medium transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          <div
            className={`fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 transform transition-all duration-300 flex items-center ${
              toast.visible
                ? "translate-y-0 opacity-100"
                : "translate-y-[-20px] opacity-0 pointer-events-none"
            }`}
          >
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 dark:text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {toast.message}
            </p>
          </div>

          {/* ─── Footer (hidden on mobile) ───────────────────────── */}
          <footer className="hidden sm:block bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand */}
              <div>
                <h3 className="text-xl font-bold">
                  Artisan<span className="text-[#CB997E]">Crafts</span>
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xs">
                  Celebrating handmade artistry and sustainable craft.
                </p>
              </div>

              {/* Quick Links */}
              <nav className="space-y-2">
                {["Home", "Shop", "Artisans", "About", "Contact"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-gray-600 dark:text-gray-400 hover:text-[#CB997E] dark:hover:text-[#E6B396]"
                    >
                      {link}
                    </a>
                  )
                )}
              </nav>

              {/* Newsletter + Social */}
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Subscribe to our newsletter
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button className="px-4 py-2 rounded-md bg-[#CB997E] hover:bg-[#A3B18A] text-white">
                    Subscribe
                  </button>
                </div>
                <div className="flex space-x-4 pt-2">
                  {/* Social icons (same SVGs you already use) */}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-4 text-sm flex flex-col md:flex-row justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                © 2025 ArtisanCrafts. All rights reserved.
              </span>
              <div className="flex space-x-4 mt-2 md:mt-0">
                {/* Repeat social icons here if desired */}
              </div>
            </div>
          </footer>
          {/* ─────────────────────────────────────────────────────── */}
        </div>
      </div>
    </>
  );
};

export default HomePage;
