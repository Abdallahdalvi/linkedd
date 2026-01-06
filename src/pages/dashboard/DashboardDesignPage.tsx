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
  { id: 'default', name: 'Default', bg: '#ffffff', text: '#1a1a1a', accent: '#6366f1', cardBg: '#f8fafc' },
  { id: 'dark', name: 'Dark', bg: '#1a1a2e', text: '#ffffff', accent: '#6366f1', cardBg: '#2d2d44' },
  { id: 'ocean', name: 'Ocean', bg: '#0f172a', text: '#ffffff', accent: '#0ea5e9', cardBg: '#1e293b' },
  { id: 'forest', name: 'Forest', bg: '#14532d', text: '#ffffff', accent: '#22c55e', cardBg: '#166534' },
  { id: 'sunset', name: 'Sunset', bg: '#451a03', text: '#ffffff', accent: '#f97316', cardBg: '#7c2d12' },
  { id: 'rose', name: 'Rose', bg: '#fdf2f8', text: '#831843', accent: '#ec4899', cardBg: '#fce7f3' },
  { id: 'midnight', name: 'Midnight', bg: '#0c0a1d', text: '#e2e8f0', accent: '#a78bfa', cardBg: '#1e1b4b' },
  { id: 'minimal', name: 'Minimal', bg: '#fafafa', text: '#171717', accent: '#171717', cardBg: '#ffffff' },
  { id: 'neon', name: 'Neon', bg: '#0a0a0a', text: '#00ff88', accent: '#00ff88', cardBg: '#1a1a1a' },
  { id: 'lavender', name: 'Lavender', bg: '#f5f3ff', text: '#4c1d95', accent: '#8b5cf6', cardBg: '#ede9fe' },
  { id: 'coral', name: 'Coral', bg: '#fff7ed', text: '#9a3412', accent: '#fb923c', cardBg: '#ffedd5' },
  { id: 'arctic', name: 'Arctic', bg: '#f0f9ff', text: '#0c4a6e', accent: '#38bdf8', cardBg: '#e0f2fe' },
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

export default function DashboardDesignPage({
  profile,
  blocks,
  onUpdateProfile,
}: DashboardDesignPageProps) {
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme_preset || 'default');
  const [backgroundType, setBackgroundType] = useState(profile?.background_type || 'solid');
  const [backgroundColor, setBackgroundColor] = useState(profile?.background_value || '#ffffff');
  const [buttonRadius, setButtonRadius] = useState([16]);
  const [enableAnimations, setEnableAnimations] = useState(true);

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
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        ].map((gradient, i) => (
                          <button
                            key={i}
                            onClick={() => setBackgroundColor(gradient)}
                            className="h-16 rounded-lg border-2 border-border hover:border-primary transition-all"
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
                  <div>
                    <Label>Border Radius: {buttonRadius}px</Label>
                    <Slider 
                      value={buttonRadius}
                      onValueChange={setButtonRadius}
                      max={32}
                      step={2}
                      className="mt-4"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button style={{ borderRadius: `${buttonRadius}px` }}>
                      Primary Button
                    </Button>
                    <Button variant="secondary" style={{ borderRadius: `${buttonRadius}px` }}>
                      Secondary
                    </Button>
                    <Button variant="outline" style={{ borderRadius: `${buttonRadius}px` }}>
                      Outline
                    </Button>
                  </div>

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
