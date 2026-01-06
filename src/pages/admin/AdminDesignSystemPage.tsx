import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Square,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const colorPalettes = [
  { name: 'Indigo Dream', primary: '#6366F1', secondary: '#4F46E5', accent: '#818CF8' },
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0284C7', accent: '#38BDF8' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#EA580C', accent: '#FB923C' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6' },
  { name: 'Midnight', primary: '#1E293B', secondary: '#0F172A', accent: '#475569' },
];

const fontOptions = [
  { name: 'Inter', category: 'Sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'Sans-serif' },
  { name: 'Poppins', category: 'Sans-serif' },
  { name: 'DM Sans', category: 'Sans-serif' },
  { name: 'Space Grotesk', category: 'Sans-serif' },
  { name: 'Outfit', category: 'Sans-serif' },
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
];

export default function AdminDesignSystemPage() {
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [borderRadius, setBorderRadius] = useState([16]);
  const [shadowIntensity, setShadowIntensity] = useState([50]);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationLevel, setAnimationLevel] = useState('smooth');

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Palette className="w-7 h-7 text-primary" />
            Global Design System
          </h1>
          <p className="text-muted-foreground mt-1">
            Define platform-wide design constraints for all clients
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="gradient-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="animations" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Animations
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Color Palettes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Color Palettes</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Select a base palette that clients can customize within constraints
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {colorPalettes.map((palette, i) => (
                  <button
                    key={palette.name}
                    onClick={() => setSelectedPalette(i)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPalette === i 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{palette.name}</span>
                      {selectedPalette === i && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Custom Colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Custom Colors</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Fine-tune individual color values
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Primary Color', value: colorPalettes[selectedPalette].primary },
                  { label: 'Secondary Color', value: colorPalettes[selectedPalette].secondary },
                  { label: 'Accent Color', value: colorPalettes[selectedPalette].accent },
                  { label: 'Success Color', value: '#10B981' },
                  { label: 'Warning Color', value: '#F59E0B' },
                  { label: 'Error Color', value: '#EF4444' },
                ].map((color) => (
                  <div key={color.label} className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1">
                      <Label className="text-sm">{color.label}</Label>
                      <Input 
                        value={color.value} 
                        className="mt-1 font-mono text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Font Selection</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Choose fonts available to clients
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label>Display Font (Headings)</Label>
                  <Select defaultValue="Plus Jakarta Sans">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                          <span className="text-muted-foreground ml-2">({font.category})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Body Font</Label>
                  <Select defaultValue="Inter">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                          <span className="text-muted-foreground ml-2">({font.category})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Typography Preview</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">H1 - Display</span>
                  <h1 className="text-4xl font-display font-bold text-foreground">The quick brown fox</h1>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">H2</span>
                  <h2 className="text-2xl font-semibold text-foreground">The quick brown fox</h2>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Body</span>
                  <p className="text-foreground">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Small</span>
                  <p className="text-sm text-muted-foreground">The quick brown fox jumps over the lazy dog.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Button Styles</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Border Radius: {borderRadius}px</Label>
                  <Slider 
                    value={borderRadius}
                    onValueChange={setBorderRadius}
                    max={32}
                    step={2}
                    className="mt-4"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button style={{ borderRadius: `${borderRadius}px` }}>
                    Primary Button
                  </Button>
                  <Button variant="secondary" style={{ borderRadius: `${borderRadius}px` }}>
                    Secondary
                  </Button>
                  <Button variant="outline" style={{ borderRadius: `${borderRadius}px` }}>
                    Outline
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Card Styles</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Shadow Intensity: {shadowIntensity}%</Label>
                  <Slider 
                    value={shadowIntensity}
                    onValueChange={setShadowIntensity}
                    max={100}
                    step={10}
                    className="mt-4"
                  />
                </div>

                <div 
                  className="p-6 rounded-xl bg-card border border-border"
                  style={{ 
                    borderRadius: `${borderRadius}px`,
                    boxShadow: `0 ${shadowIntensity[0] / 5}px ${shadowIntensity[0] / 2}px rgba(0,0,0,${shadowIntensity[0] / 500})`
                  }}
                >
                  <h3 className="font-semibold text-foreground">Card Preview</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is how cards will appear with current settings
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Animation Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Global toggle for all platform animations
                  </p>
                </div>
                <Switch 
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>

              <div>
                <Label>Animation Level</Label>
                <Select value={animationLevel} onValueChange={setAnimationLevel}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off - No animations</SelectItem>
                    <SelectItem value="subtle">Subtle - Minimal transitions</SelectItem>
                    <SelectItem value="smooth">Smooth - Standard animations</SelectItem>
                    <SelectItem value="playful">Playful - Enhanced effects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">Preview</h3>
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ scale: animationsEnabled ? 1.05 : 1 }}
                    className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center"
                  >
                    <span className="text-primary font-medium">Hover</span>
                  </motion.div>
                  <motion.div
                    animate={animationsEnabled ? { y: [0, -10, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 rounded-xl bg-accent/10 flex items-center justify-center"
                  >
                    <span className="text-accent font-medium">Float</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
