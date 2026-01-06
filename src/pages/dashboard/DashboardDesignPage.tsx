import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Square,
  Image,
  Sparkles,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MobilePreview from '@/components/MobilePreview';

interface DashboardDesignPageProps {
  profile: any;
  blocks: any[];
  onUpdateProfile: (updates: any) => Promise<void>;
}

export const themePresets = [
  // Solid themes
  { id: 'minimal', name: 'Minimal', bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a1a', cardBg: '#ffffff', gradient: false },
  { id: 'dark', name: 'Dark Mode', bg: '#0f0f0f', text: '#ffffff', accent: '#ffffff', cardBg: '#1a1a1a', gradient: false },
  { id: 'cream', name: 'Cream', bg: '#fefdf8', text: '#292524', accent: '#78716c', cardBg: '#ffffff', gradient: false },
  { id: 'blush', name: 'Blush', bg: '#fdf2f8', text: '#831843', accent: '#ec4899', cardBg: '#ffffff', gradient: false },
  
  // Gradient themes (Linktree-style)
  { id: 'sunset-glow', name: 'Sunset Glow', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', text: '#1a1a1a', accent: '#ec4899', cardBg: 'rgba(255,255,255,0.95)', gradient: true },
  { id: 'ocean-breeze', name: 'Ocean Breeze', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#a78bfa', cardBg: 'rgba(30,30,60,0.9)', gradient: true },
  { id: 'mint-fresh', name: 'Mint Fresh', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#1a1a1a', accent: '#14b8a6', cardBg: 'rgba(255,255,255,0.95)', gradient: true },
  { id: 'purple-haze', name: 'Purple Haze', bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', text: '#ffffff', accent: '#c4b5fd', cardBg: 'rgba(30,27,75,0.9)', gradient: true },
  { id: 'coral-reef', name: 'Coral Reef', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#1a1a1a', accent: '#f43f5e', cardBg: 'rgba(255,255,255,0.95)', gradient: true },
  { id: 'aurora', name: 'Aurora', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)', text: '#1a1a1a', accent: '#10b981', cardBg: 'rgba(255,255,255,0.95)', gradient: true },
  { id: 'midnight-blue', name: 'Midnight', bg: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)', text: '#e2e8f0', accent: '#38bdf8', cardBg: 'rgba(15,23,42,0.95)', gradient: true },
  { id: 'rose-gold', name: 'Rose Gold', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#7c2d12', accent: '#f97316', cardBg: 'rgba(255,255,255,0.95)', gradient: true },
];

const backgroundTypes = [
  { id: 'solid', label: 'Solid Color' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'image', label: 'Image' },
];

const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'playfair', label: 'Playfair Display' },
];

const buttonStyles = [
  { 
    id: 'filled', 
    name: 'Filled', 
    description: 'Solid background color',
    preview: 'bg-primary text-primary-foreground'
  },
  { 
    id: 'outline', 
    name: 'Outline', 
    description: 'Border only, transparent fill',
    preview: 'border-2 border-current bg-transparent'
  },
  { 
    id: 'soft-shadow', 
    name: 'Soft Shadow', 
    description: 'Subtle shadow with soft edges',
    preview: 'bg-white shadow-lg'
  },
  { 
    id: 'glass', 
    name: 'Glass', 
    description: 'Frosted glass effect',
    preview: 'bg-white/50 backdrop-blur-md border border-white/30'
  },
];

export default function DashboardDesignPage({
  profile,
  blocks,
  onUpdateProfile,
}: DashboardDesignPageProps) {
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme_preset || 'default');
  const [backgroundType, setBackgroundType] = useState(profile?.background_type || 'solid');
  const [backgroundColor, setBackgroundColor] = useState(profile?.background_value || '#ffffff');
  const [buttonRadius, setButtonRadius] = useState([profile?.custom_colors?.buttonRadius || 16]);
  const [buttonStyle, setButtonStyle] = useState(profile?.custom_colors?.buttonStyle || 'filled');
  const [enableAnimations, setEnableAnimations] = useState(profile?.custom_colors?.animations !== false);

  const currentTheme = themePresets.find(t => t.id === selectedTheme) || themePresets[0];

  // When theme changes, update background to theme's bg color
  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = themePresets.find(t => t.id === themeId);
    if (theme && backgroundType === 'solid') {
      setBackgroundColor(theme.bg);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        theme_preset: selectedTheme,
        background_type: backgroundType,
        background_value: backgroundColor,
        custom_colors: {
          buttonRadius: buttonRadius[0],
          buttonStyle,
          animations: enableAnimations,
          ...currentTheme,
        },
      });
      toast.success('Design settings saved!');
    } catch (error) {
      toast.error('Failed to save design settings');
    }
    setSaving(false);
  };

  const updatedProfile = {
    ...profile,
    theme_preset: selectedTheme,
    background_type: backgroundType,
    background_value: backgroundColor,
    custom_colors: {
      ...profile?.custom_colors,
      buttonRadius: buttonRadius[0],
      buttonStyle,
      animations: enableAnimations,
      ...currentTheme,
    },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Palette className="w-7 h-7 text-primary" />
            Design & Appearance
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the look and feel of your profile
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            className="gradient-primary text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Left: Design Options */}
        <div>
          <Tabs defaultValue="themes" className="space-y-6">
            <TabsList className="glass-card p-1">
              <TabsTrigger value="themes" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Themes
              </TabsTrigger>
              <TabsTrigger value="background" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Background
              </TabsTrigger>
              <TabsTrigger value="buttons" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Buttons
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Fonts
              </TabsTrigger>
            </TabsList>

            {/* Themes Tab */}
            <TabsContent value="themes">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Theme Presets</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Choose a pre-designed theme for your profile
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {themePresets.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedTheme === theme.id 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div 
                        className="w-full h-20 rounded-lg mb-3 flex flex-col items-center justify-center gap-1 p-2"
                        style={{ backgroundColor: theme.bg }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.accent }}
                        />
                        <div 
                          className="w-full h-5 rounded"
                          style={{ backgroundColor: theme.cardBg }}
                        />
                        <div 
                          className="w-full h-5 rounded"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{theme.name}</span>
                        {selectedTheme === theme.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Background</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label>Background Type</Label>
                    <div className="flex gap-3 mt-2">
                      {backgroundTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={backgroundType === type.id ? 'default' : 'outline'}
                          onClick={() => setBackgroundType(type.id)}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {backgroundType === 'solid' && (
                    <div>
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <div 
                          className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                          style={{ backgroundColor: backgroundColor }}
                        />
                        <Input 
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#ffffff"
                          className="w-32 font-mono"
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        {['#ffffff', '#f8fafc', '#0f172a', '#1a1a2e', '#fdf2f8', '#f0fdf4'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBackgroundColor(color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              backgroundColor === color ? 'border-primary scale-110' : 'border-border'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {backgroundType === 'gradient' && (
                    <div>
                      <Label>Gradient Presets</Label>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {[
                          'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
                          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        ].map((gradient, i) => (
                          <button
                            key={i}
                            onClick={() => setBackgroundColor(gradient)}
                            className={`h-16 rounded-xl border-2 transition-all ${
                              backgroundColor === gradient ? 'border-primary scale-105 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                            }`}
                            style={{ background: gradient }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {backgroundType === 'image' && (
                    <div className="h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload background image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Buttons Tab */}
            <TabsContent value="buttons">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Button Styles</h2>
                
                <div className="space-y-6">
                  {/* Button Style Selection */}
                  <div>
                    <Label className="mb-3 block">Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {buttonStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setButtonStyle(style.id)}
                          className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                            buttonStyle === style.id 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {/* Preview */}
                          <div 
                            className={`w-full h-10 rounded-lg mb-3 flex items-center justify-center text-sm font-medium ${
                              style.id === 'filled' ? 'bg-foreground text-background' :
                              style.id === 'outline' ? 'border-2 border-foreground bg-transparent text-foreground' :
                              style.id === 'soft-shadow' ? 'bg-card shadow-lg text-foreground' :
                              'bg-white/60 backdrop-blur-md border border-white/40 text-foreground'
                            }`}
                            style={{ borderRadius: `${buttonRadius}px` }}
                          >
                            Preview
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-foreground">{style.name}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">{style.description}</p>
                            </div>
                            {buttonStyle === style.id && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div className="pt-4 border-t border-border">
                    <Label>Corner Radius: {buttonRadius}px</Label>
                    <Slider 
                      value={buttonRadius}
                      onValueChange={setButtonRadius}
                      max={32}
                      step={2}
                      className="mt-4"
                    />
                    <div className="flex gap-2 mt-3">
                      {[0, 8, 16, 24, 32].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => setButtonRadius([radius])}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            buttonRadius[0] === radius 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {radius === 0 ? 'Square' : radius === 32 ? 'Pill' : `${radius}px`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animation Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <Label>Enable Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Add hover and click effects
                      </p>
                    </div>
                    <Switch 
                      checked={enableAnimations}
                      onCheckedChange={setEnableAnimations}
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Fonts Tab */}
            <TabsContent value="fonts">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Typography</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label>Heading Font</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Body Font</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground mb-4">Preview</h3>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-display font-bold">Heading Preview</h1>
                      <p className="text-foreground">Body text looks like this paragraph.</p>
                      <p className="text-sm text-muted-foreground">Small text for descriptions.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Mobile Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
              Live Preview
            </h2>
            <div className="flex justify-center">
              <MobilePreview profile={updatedProfile} blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
