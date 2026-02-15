export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
  gradient: boolean;
}

export const themeCategories = [
  { id: 'all', label: 'All' },
  { id: 'clean', label: 'Clean & Minimal' },
  { id: 'dark', label: 'Dark' },
  { id: 'colorful', label: 'Colorful' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'neon', label: 'Neon & Cyber' },
  { id: 'nature', label: 'Nature' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'retro', label: 'Retro & Vintage' },
  { id: 'luxury', label: 'Luxury' },
] as const;

export const themePresets: ThemePreset[] = [
  // ─── CLEAN & MINIMAL (10) ──────────────────────
  { id: 'minimal', name: 'Minimal', category: 'clean', bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a1a', cardBg: '#f5f5f5', gradient: false },
  { id: 'snow', name: 'Snow', category: 'clean', bg: '#fafafa', text: '#18181b', accent: '#71717a', cardBg: '#ffffff', gradient: false },
  { id: 'paper', name: 'Paper', category: 'clean', bg: '#fefdfb', text: '#292524', accent: '#a8a29e', cardBg: '#ffffff', gradient: false },
  { id: 'cloud', name: 'Cloud', category: 'clean', bg: '#f8fafc', text: '#0f172a', accent: '#64748b', cardBg: '#ffffff', gradient: false },
  { id: 'bone', name: 'Bone', category: 'clean', bg: '#f5f0eb', text: '#1c1917', accent: '#78716c', cardBg: '#faf8f5', gradient: false },
  { id: 'cotton', name: 'Cotton', category: 'clean', bg: '#f9fafb', text: '#111827', accent: '#9ca3af', cardBg: '#ffffff', gradient: false },
  { id: 'pearl', name: 'Pearl', category: 'clean', bg: '#f5f3f0', text: '#1c1917', accent: '#57534e', cardBg: '#faf9f7', gradient: false },
  { id: 'silk', name: 'Silk', category: 'clean', bg: '#faf5ff', text: '#3b0764', accent: '#a855f7', cardBg: '#ffffff', gradient: false },
  { id: 'linen', name: 'Linen', category: 'clean', bg: '#fdf8f0', text: '#422006', accent: '#b45309', cardBg: '#fffcf5', gradient: false },
  { id: 'frost', name: 'Frost', category: 'clean', bg: '#f0f9ff', text: '#0c4a6e', accent: '#0284c7', cardBg: '#ffffff', gradient: false },

  // ─── DARK (12) ──────────────────────────────────
  { id: 'dark', name: 'Dark Mode', category: 'dark', bg: '#0a0a0a', text: '#fafafa', accent: '#ffffff', cardBg: '#171717', gradient: false },
  { id: 'slate', name: 'Slate', category: 'dark', bg: '#0f172a', text: '#f1f5f9', accent: '#3b82f6', cardBg: '#1e293b', gradient: false },
  { id: 'charcoal', name: 'Charcoal', category: 'dark', bg: '#18181b', text: '#fafafa', accent: '#a1a1aa', cardBg: '#27272a', gradient: false },
  { id: 'obsidian', name: 'Obsidian', category: 'dark', bg: '#09090b', text: '#e4e4e7', accent: '#8b5cf6', cardBg: '#18181b', gradient: false },
  { id: 'onyx', name: 'Onyx', category: 'dark', bg: '#0c0a09', text: '#fafaf9', accent: '#f97316', cardBg: '#1c1917', gradient: false },
  { id: 'graphite', name: 'Graphite', category: 'dark', bg: '#111827', text: '#f9fafb', accent: '#6366f1', cardBg: '#1f2937', gradient: false },
  { id: 'carbon', name: 'Carbon', category: 'dark', bg: '#0d0d0d', text: '#e5e5e5', accent: '#22d3ee', cardBg: '#1a1a1a', gradient: false },
  { id: 'void', name: 'Void', category: 'dark', bg: '#000000', text: '#d4d4d4', accent: '#ef4444', cardBg: '#141414', gradient: false },
  { id: 'iron', name: 'Iron', category: 'dark', bg: '#1a1a2e', text: '#eaeaf0', accent: '#e94560', cardBg: '#16213e', gradient: false },
  { id: 'shadow', name: 'Shadow', category: 'dark', bg: '#0f0f0f', text: '#e2e8f0', accent: '#f472b6', cardBg: '#1e1e1e', gradient: false },
  { id: 'midnight', name: 'Midnight', category: 'dark', bg: '#020617', text: '#e2e8f0', accent: '#38bdf8', cardBg: '#0f172a', gradient: false },
  { id: 'eclipse', name: 'Eclipse', category: 'dark', bg: '#0b0b1a', text: '#c7d2fe', accent: '#818cf8', cardBg: '#15152a', gradient: false },

  // ─── COLORFUL (10) ──────────────────────────────
  { id: 'blush', name: 'Blush', category: 'colorful', bg: '#fdf2f8', text: '#831843', accent: '#ec4899', cardBg: '#ffffff', gradient: false },
  { id: 'sky', name: 'Sky', category: 'colorful', bg: '#e0f2fe', text: '#0c4a6e', accent: '#0284c7', cardBg: '#f0f9ff', gradient: false },
  { id: 'lime', name: 'Lime', category: 'colorful', bg: '#ecfccb', text: '#365314', accent: '#65a30d', cardBg: '#f7fee7', gradient: false },
  { id: 'sunflower', name: 'Sunflower', category: 'colorful', bg: '#fef9c3', text: '#713f12', accent: '#ca8a04', cardBg: '#fefce8', gradient: false },
  { id: 'ruby', name: 'Ruby', category: 'colorful', bg: '#7f1d1d', text: '#fecaca', accent: '#f87171', cardBg: '#991b1b', gradient: false },
  { id: 'sapphire', name: 'Sapphire', category: 'colorful', bg: '#1e3a5f', text: '#dbeafe', accent: '#60a5fa', cardBg: '#1e40af', gradient: false },
  { id: 'amethyst', name: 'Amethyst', category: 'colorful', bg: '#3b0764', text: '#e9d5ff', accent: '#c084fc', cardBg: '#4c1d95', gradient: false },
  { id: 'emerald', name: 'Emerald', category: 'colorful', bg: '#064e3b', text: '#d1fae5', accent: '#34d399', cardBg: '#065f46', gradient: false },
  { id: 'coral', name: 'Coral', category: 'colorful', bg: '#fff1f2', text: '#881337', accent: '#fb7185', cardBg: '#ffffff', gradient: false },
  { id: 'indigo', name: 'Indigo Night', category: 'colorful', bg: '#1e1b4b', text: '#e0e7ff', accent: '#a5b4fc', cardBg: '#312e81', gradient: false },

  // ─── GRADIENT (18) ──────────────────────────────
  { id: 'neon-nights', name: 'Neon Nights', category: 'gradient', bg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)', text: '#ffffff', accent: '#f472b6', cardBg: 'rgba(15,15,35,0.9)', gradient: true },
  { id: 'cyber-punk', name: 'Cyber Punk', category: 'gradient', bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 100%)', text: '#00ff88', accent: '#00ff88', cardBg: 'rgba(20,20,20,0.95)', gradient: true },
  { id: 'sunset-glow', name: 'Sunset Glow', category: 'gradient', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', text: '#4a1942', accent: '#c2185b', cardBg: 'rgba(255,255,255,0.92)', gradient: true },
  { id: 'ocean-breeze', name: 'Ocean Breeze', category: 'gradient', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#c4b5fd', cardBg: 'rgba(30,30,60,0.85)', gradient: true },
  { id: 'mint-fresh', name: 'Mint Fresh', category: 'gradient', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#134e4a', accent: '#0d9488', cardBg: 'rgba(255,255,255,0.9)', gradient: true },
  { id: 'purple-haze', name: 'Purple Haze', category: 'gradient', bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', text: '#e0e7ff', accent: '#c4b5fd', cardBg: 'rgba(30,27,75,0.88)', gradient: true },
  { id: 'coral-reef', name: 'Coral Reef', category: 'gradient', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#4a1525', accent: '#be185d', cardBg: 'rgba(255,255,255,0.9)', gradient: true },
  { id: 'aurora', name: 'Aurora', category: 'gradient', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)', text: '#0f2b1d', accent: '#059669', cardBg: 'rgba(255,255,255,0.88)', gradient: true },
  { id: 'rose-gold', name: 'Rose Gold', category: 'gradient', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#7c2d12', accent: '#ea580c', cardBg: 'rgba(255,255,255,0.9)', gradient: true },
  { id: 'electric-blue', name: 'Electric Blue', category: 'gradient', bg: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #3b82f6 100%)', text: '#dbeafe', accent: '#60a5fa', cardBg: 'rgba(30,58,138,0.88)', gradient: true },
  { id: 'emerald-glow', name: 'Emerald Glow', category: 'gradient', bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)', text: '#d1fae5', accent: '#34d399', cardBg: 'rgba(6,78,59,0.88)', gradient: true },
  { id: 'warm-sunset', name: 'Warm Sunset', category: 'gradient', bg: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f97316 100%)', text: '#fff7ed', accent: '#fbbf24', cardBg: 'rgba(124,45,18,0.88)', gradient: true },
  { id: 'lavender-dream', name: 'Lavender Dream', category: 'gradient', bg: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 50%, #a78bfa 100%)', text: '#1e1b4b', accent: '#7c3aed', cardBg: 'rgba(255,255,255,0.9)', gradient: true },
  { id: 'northern-lights', name: 'Northern Lights', category: 'gradient', bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #065f46 70%, #064e3b 100%)', text: '#d1fae5', accent: '#5eead4', cardBg: 'rgba(15,23,42,0.88)', gradient: true },
  { id: 'berry-crush', name: 'Berry Crush', category: 'gradient', bg: 'linear-gradient(135deg, #831843 0%, #6b21a8 50%, #4c1d95 100%)', text: '#fce7f3', accent: '#f9a8d4', cardBg: 'rgba(107,33,168,0.85)', gradient: true },
  { id: 'golden-hour', name: 'Golden Hour', category: 'gradient', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)', text: '#78350f', accent: '#d97706', cardBg: 'rgba(255,255,255,0.88)', gradient: true },
  { id: 'deep-ocean', name: 'Deep Ocean', category: 'gradient', bg: 'linear-gradient(180deg, #020617 0%, #0c4a6e 50%, #164e63 100%)', text: '#cffafe', accent: '#22d3ee', cardBg: 'rgba(12,74,110,0.85)', gradient: true },
  { id: 'fire-opal', name: 'Fire Opal', category: 'gradient', bg: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 30%, #f97316 70%, #ea580c 100%)', text: '#7c2d12', accent: '#dc2626', cardBg: 'rgba(255,255,255,0.88)', gradient: true },

  // ─── PASTEL (10) ────────────────────────────────
  { id: 'pastel-pink', name: 'Pastel Pink', category: 'pastel', bg: '#fce7f3', text: '#831843', accent: '#ec4899', cardBg: '#fdf2f8', gradient: false },
  { id: 'pastel-blue', name: 'Pastel Blue', category: 'pastel', bg: '#dbeafe', text: '#1e3a8a', accent: '#3b82f6', cardBg: '#eff6ff', gradient: false },
  { id: 'pastel-green', name: 'Pastel Green', category: 'pastel', bg: '#d1fae5', text: '#064e3b', accent: '#10b981', cardBg: '#ecfdf5', gradient: false },
  { id: 'pastel-purple', name: 'Pastel Purple', category: 'pastel', bg: '#e9d5ff', text: '#4c1d95', accent: '#8b5cf6', cardBg: '#f3e8ff', gradient: false },
  { id: 'pastel-yellow', name: 'Pastel Yellow', category: 'pastel', bg: '#fef9c3', text: '#854d0e', accent: '#eab308', cardBg: '#fefce8', gradient: false },
  { id: 'pastel-orange', name: 'Pastel Orange', category: 'pastel', bg: '#ffedd5', text: '#9a3412', accent: '#f97316', cardBg: '#fff7ed', gradient: false },
  { id: 'pastel-teal', name: 'Pastel Teal', category: 'pastel', bg: '#ccfbf1', text: '#134e4a', accent: '#14b8a6', cardBg: '#f0fdfa', gradient: false },
  { id: 'pastel-rose', name: 'Pastel Rose', category: 'pastel', bg: '#ffe4e6', text: '#9f1239', accent: '#f43f5e', cardBg: '#fff1f2', gradient: false },
  { id: 'pastel-cyan', name: 'Pastel Cyan', category: 'pastel', bg: '#cffafe', text: '#155e75', accent: '#06b6d4', cardBg: '#ecfeff', gradient: false },
  { id: 'pastel-lavender', name: 'Pastel Lavender', category: 'pastel', bg: '#ede9fe', text: '#5b21b6', accent: '#7c3aed', cardBg: '#f5f3ff', gradient: false },

  // ─── NEON & CYBER (10) ──────────────────────────
  { id: 'neon-green', name: 'Neon Green', category: 'neon', bg: '#020617', text: '#4ade80', accent: '#22c55e', cardBg: '#0a1628', gradient: false },
  { id: 'neon-pink', name: 'Neon Pink', category: 'neon', bg: '#0a0012', text: '#f0abfc', accent: '#e879f9', cardBg: '#1a0a2e', gradient: false },
  { id: 'neon-blue', name: 'Neon Blue', category: 'neon', bg: '#000814', text: '#7dd3fc', accent: '#0ea5e9', cardBg: '#001d3d', gradient: false },
  { id: 'neon-orange', name: 'Neon Orange', category: 'neon', bg: '#0c0a09', text: '#fdba74', accent: '#f97316', cardBg: '#1c1917', gradient: false },
  { id: 'neon-yellow', name: 'Neon Yellow', category: 'neon', bg: '#0a0a0a', text: '#fde047', accent: '#eab308', cardBg: '#1a1a1a', gradient: false },
  { id: 'cyber-red', name: 'Cyber Red', category: 'neon', bg: '#0c0000', text: '#fca5a5', accent: '#ef4444', cardBg: '#1a0505', gradient: false },
  { id: 'matrix', name: 'Matrix', category: 'neon', bg: '#001a00', text: '#00ff41', accent: '#00cc33', cardBg: '#002600', gradient: false },
  { id: 'synthwave', name: 'Synthwave', category: 'neon', bg: '#0d001a', text: '#e0aaff', accent: '#c77dff', cardBg: '#1a0033', gradient: false },
  { id: 'vaporwave', name: 'Vaporwave', category: 'neon', bg: '#1a0a2e', text: '#c4b5fd', accent: '#a78bfa', cardBg: '#2d1b69', gradient: false },
  { id: 'tron', name: 'Tron', category: 'neon', bg: '#000511', text: '#67e8f9', accent: '#06b6d4', cardBg: '#001125', gradient: false },

  // ─── NATURE (10) ────────────────────────────────
  { id: 'forest', name: 'Forest', category: 'nature', bg: '#052e16', text: '#dcfce7', accent: '#22c55e', cardBg: '#14532d', gradient: false },
  { id: 'ocean', name: 'Ocean', category: 'nature', bg: '#0c4a6e', text: '#e0f2fe', accent: '#0ea5e9', cardBg: '#075985', gradient: false },
  { id: 'desert', name: 'Desert', category: 'nature', bg: '#fef3c7', text: '#78350f', accent: '#b45309', cardBg: '#fffbeb', gradient: false },
  { id: 'autumn', name: 'Autumn', category: 'nature', bg: '#431407', text: '#fed7aa', accent: '#f97316', cardBg: '#7c2d12', gradient: false },
  { id: 'moss', name: 'Moss', category: 'nature', bg: '#1a2e1a', text: '#bbf7d0', accent: '#4ade80', cardBg: '#264026', gradient: false },
  { id: 'arctic', name: 'Arctic', category: 'nature', bg: '#ecfeff', text: '#164e63', accent: '#0891b2', cardBg: '#ffffff', gradient: false },
  { id: 'volcano', name: 'Volcano', category: 'nature', bg: '#1c0a00', text: '#fdba74', accent: '#ea580c', cardBg: '#2d1600', gradient: false },
  { id: 'meadow', name: 'Meadow', category: 'nature', bg: '#f0fdf4', text: '#14532d', accent: '#16a34a', cardBg: '#ffffff', gradient: false },
  { id: 'twilight', name: 'Twilight', category: 'nature', bg: '#1e1b4b', text: '#c7d2fe', accent: '#818cf8', cardBg: '#312e81', gradient: false },
  { id: 'stone', name: 'Stone', category: 'nature', bg: '#292524', text: '#e7e5e4', accent: '#a8a29e', cardBg: '#44403c', gradient: false },

  // ─── WARM (8) ───────────────────────────────────
  { id: 'cream', name: 'Cream', category: 'warm', bg: '#fefdf8', text: '#292524', accent: '#78716c', cardBg: '#ffffff', gradient: false },
  { id: 'terracotta', name: 'Terracotta', category: 'warm', bg: '#7c2d12', text: '#fed7aa', accent: '#fb923c', cardBg: '#9a3412', gradient: false },
  { id: 'honey', name: 'Honey', category: 'warm', bg: '#fffbeb', text: '#78350f', accent: '#d97706', cardBg: '#ffffff', gradient: false },
  { id: 'peach', name: 'Peach', category: 'warm', bg: '#fff7ed', text: '#7c2d12', accent: '#f97316', cardBg: '#ffffff', gradient: false },
  { id: 'amber', name: 'Amber', category: 'warm', bg: '#451a03', text: '#fde68a', accent: '#f59e0b', cardBg: '#78350f', gradient: false },
  { id: 'cinnamon', name: 'Cinnamon', category: 'warm', bg: '#3b1106', text: '#fecaca', accent: '#dc2626', cardBg: '#5c1a0a', gradient: false },
  { id: 'clay', name: 'Clay', category: 'warm', bg: '#f5ebe0', text: '#3e2723', accent: '#8d6e63', cardBg: '#faf5ef', gradient: false },
  { id: 'copper', name: 'Copper', category: 'warm', bg: '#2a1506', text: '#fbbf24', accent: '#d97706', cardBg: '#3d200a', gradient: false },

  // ─── COOL (6) ───────────────────────────────────
  { id: 'ice', name: 'Ice', category: 'cool', bg: '#f0f9ff', text: '#0c4a6e', accent: '#0284c7', cardBg: '#ffffff', gradient: false },
  { id: 'steel', name: 'Steel', category: 'cool', bg: '#1e293b', text: '#cbd5e1', accent: '#94a3b8', cardBg: '#334155', gradient: false },
  { id: 'glacier', name: 'Glacier', category: 'cool', bg: '#ecfeff', text: '#155e75', accent: '#06b6d4', cardBg: '#f8fffe', gradient: false },
  { id: 'navy', name: 'Navy', category: 'cool', bg: '#172554', text: '#bfdbfe', accent: '#3b82f6', cardBg: '#1e3a8a', gradient: false },
  { id: 'silver', name: 'Silver', category: 'cool', bg: '#f1f5f9', text: '#334155', accent: '#64748b', cardBg: '#ffffff', gradient: false },
  { id: 'cobalt', name: 'Cobalt', category: 'cool', bg: '#1e3a8a', text: '#dbeafe', accent: '#60a5fa', cardBg: '#1e40af', gradient: false },

  // ─── RETRO & VINTAGE (8) ────────────────────────
  { id: 'retro-cream', name: 'Retro Cream', category: 'retro', bg: '#faf3e0', text: '#3e2723', accent: '#e65100', cardBg: '#fff8e1', gradient: false },
  { id: 'vintage-green', name: 'Vintage Green', category: 'retro', bg: '#1b3a2d', text: '#c8e6c9', accent: '#81c784', cardBg: '#2e5140', gradient: false },
  { id: 'sepia', name: 'Sepia', category: 'retro', bg: '#f5ebe0', text: '#4e342e', accent: '#795548', cardBg: '#faf0e6', gradient: false },
  { id: 'typewriter', name: 'Typewriter', category: 'retro', bg: '#f5f5dc', text: '#1a1a1a', accent: '#333333', cardBg: '#fafad2', gradient: false },
  { id: 'polaroid', name: 'Polaroid', category: 'retro', bg: '#fdfcfb', text: '#2c1810', accent: '#8b4513', cardBg: '#ffffff', gradient: false },
  { id: 'film-noir', name: 'Film Noir', category: 'retro', bg: '#111111', text: '#c9c9c9', accent: '#888888', cardBg: '#1e1e1e', gradient: false },
  { id: 'art-deco', name: 'Art Deco', category: 'retro', bg: '#1a1a2e', text: '#ffd700', accent: '#daa520', cardBg: '#2a2a4a', gradient: false },
  { id: 'cassette', name: 'Cassette', category: 'retro', bg: '#2d1b2e', text: '#ff6b9d', accent: '#c44569', cardBg: '#3d2b3e', gradient: false },

  // ─── LUXURY (8) ─────────────────────────────────
  { id: 'black-gold', name: 'Black & Gold', category: 'luxury', bg: '#0a0a0a', text: '#fde68a', accent: '#f59e0b', cardBg: '#1a1a1a', gradient: false },
  { id: 'royal-purple', name: 'Royal Purple', category: 'luxury', bg: '#1a0033', text: '#e9d5ff', accent: '#a855f7', cardBg: '#2d0055', gradient: false },
  { id: 'champagne', name: 'Champagne', category: 'luxury', bg: '#f5f0e6', text: '#3d3225', accent: '#b8860b', cardBg: '#faf7f0', gradient: false },
  { id: 'platinum', name: 'Platinum', category: 'luxury', bg: '#e8e8e8', text: '#1a1a1a', accent: '#4a4a4a', cardBg: '#f5f5f5', gradient: false },
  { id: 'velvet', name: 'Velvet', category: 'luxury', bg: '#2d0a1e', text: '#ffc0cb', accent: '#ff69b4', cardBg: '#3d1a2e', gradient: false },
  { id: 'marble', name: 'Marble', category: 'luxury', bg: '#f2f0ed', text: '#2c2c2c', accent: '#8b7d6b', cardBg: '#faf9f7', gradient: false },
  { id: 'noir', name: 'Noir', category: 'luxury', bg: '#0a0a0a', text: '#d4d4d4', accent: '#737373', cardBg: '#171717', gradient: false },
  { id: 'diamond', name: 'Diamond', category: 'luxury', bg: '#f8fafc', text: '#0f172a', accent: '#0ea5e9', cardBg: '#ffffff', gradient: false },
];
