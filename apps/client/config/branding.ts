export const brandingConfig = {
  // Basic Brand Information
  name: "Relinkr",
  tagline: "⚡ A blazingly fast, self-hosted link shortener with click tracking & QR codes",
  description: "Deploy anywhere with Docker! Create custom short links, track analytics, and generate QR codes with our modern, lightweight URL redirection service.",
  
  // URLs and Links
  githubUrl: "https://github.com/knightsri/Relinkr",
  demoUrl: process.env.NEXT_PUBLIC_DEMO_URL || "https://demo.relinkr.dev",
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.relinkr.dev",
  
  // Contact Information
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@relinkr.dev",
  authorName: "knightsri",
  authorUrl: "https://github.com/knightsri",
  
  // Brand Colors
  colors: {
    primary: "#2563eb", // Blue
    secondary: "#7c3aed", // Purple
    accent: "#059669", // Green
    warning: "#d97706", // Orange
    danger: "#dc2626", // Red
    success: "#16a34a", // Green
    muted: "#6b7280", // Gray
    background: "#ffffff",
    foreground: "#171717",
  },
  
  // Dark mode colors
  darkColors: {
    background: "#0a0a0a",
    foreground: "#ededed",
    muted: "#9ca3af",
  },
  
  // Features list for marketing pages
  features: [
    {
      title: "Custom & Case-Insensitive Slugs",
      description: "Create human-readable short URLs with your own custom slugs. All slugs are case-insensitive to prevent collisions.",
      icon: "🔗"
    },
    {
      title: "Secure Random Generation",
      description: "Automatically generate unique, non-guessable slugs using the nanoid library for maximum security.",
      icon: "🔒"
    },
    {
      title: "Click Tracking & Analytics",
      description: "Built-in analytics track click counts with optional detailed logging including timestamps, referrers, and user agents.",
      icon: "📊"
    },
    {
      title: "Dynamic QR Code Generation",
      description: "Instantly generate high-quality SVG QR codes for every link, perfect for mobile sharing and print materials.",
      icon: "📱"
    },
    {
      title: "Simple User Dashboard",
      description: "Clean, intuitive interface to view, search, paginate, and manage all your links with real-time analytics.",
      icon: "🎛️"
    },
    {
      title: "Docker Deployment",
      description: "Deploy anywhere with a single Docker command. Runs as non-root user with minimal, secure base image.",
      icon: "🐳"
    },
    {
      title: "OAuth Authentication",
      description: "Secure authentication via GitHub and Google using NextAuth.js with proper session management.",
      icon: "🔐"
    },
    {
      title: "Redis Performance",
      description: "Lightning-fast URL lookups powered by Redis in-memory storage with optional data persistence.",
      icon: "⚡"
    }
  ],
  
  // Technical specifications
  tech: {
    frontend: "Next.js (React)",
    backend: "Next.js API Routes (Node.js)",
    database: "Redis",
    auth: "NextAuth.js (OAuth)",
    validation: "Zod",
    deployment: "Docker"
  },
  
  // Navigation items
  navigation: [
    { name: "Home", href: "/" },
    { name: "GitHub", href: "https://github.com/knightsri/Relinkr", external: true },
  ],
  
  // Footer links
  footerLinks: {
    product: [
      { name: "GitHub", href: "https://github.com/knightsri/Relinkr" },
    ],
    support: [
      { name: "Issues", href: "https://github.com/knightsri/Relinkr/issues" },
      { name: "Discussions", href: "https://github.com/knightsri/Relinkr/discussions" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "License", href: "https://github.com/knightsri/Relinkr/blob/main/LICENSE" },
    ]
  },
  
  // SEO defaults
  seo: {
    title: "Relinkr - Fast Self-Hosted Link Shortener",
    description: "A blazingly fast, self-hosted link shortener with click tracking & QR codes. Deploy anywhere with Docker!",
    keywords: ["link shortener", "url shortener", "self-hosted", "docker", "redis", "nextjs", "analytics", "qr codes"],
    ogImage: "/og-image.png", // You'll need to create this
    twitterCard: "summary_large_image",
  }
};

export type BrandingConfig = typeof brandingConfig;
