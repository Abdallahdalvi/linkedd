import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Link as LinkIcon,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
  Palette,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { icon: Zap, title: 'Lightning Fast', description: 'Optimized for speed with Lighthouse 90+ scores' },
  { icon: Palette, title: 'Fully Customizable', description: 'Design your page with powerful customization tools' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Track views, clicks, and conversion rates' },
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-level security for your data' },
  { icon: Globe, title: 'Custom Domains', description: 'Use your own domain for maximum branding' },
  { icon: Star, title: 'Premium Support', description: '24/7 support from our dedicated team' },
];

const testimonials = [
  { name: 'Sarah J.', role: 'Content Creator', quote: 'The best link-in-bio tool I\'ve ever used. Clean, fast, and powerful.' },
  { name: 'Mike C.', role: 'Entrepreneur', quote: 'Switched from Linktree and never looked back. The analytics are incredible.' },
  { name: 'Emily D.', role: 'Influencer', quote: 'My click-through rate increased by 40% after switching to LinkBio.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LinkBio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button className="btn-primary" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ creators
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              One Link.
              <br />
              <span className="gradient-text">Infinite Possibilities.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create a stunning link-in-bio page that converts visitors into customers. 
              More powerful than Linktree, more beautiful than the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="btn-primary text-lg px-8" asChild>
                <Link to="/auth">
                  Create Your Page Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                See Examples
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Setup in 2 minutes
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none z-10" />
            <div className="glass-card p-8 max-w-5xl mx-auto shadow-glow">
              <div className="bg-secondary rounded-xl h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                    <LinkIcon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you grow your audience and convert more visitors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Loved by Creators
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card gradient-dark p-12 text-center rounded-3xl"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust LinkBio for their link-in-bio needs
            </p>
            <Button size="lg" className="bg-white text-foreground hover:bg-white/90 text-lg px-8" asChild>
              <Link to="/auth">
                Create Your Free Page
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">LinkBio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 LinkBio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
