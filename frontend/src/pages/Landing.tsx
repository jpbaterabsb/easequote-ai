import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  Zap, 
  Globe, 
  Send, 
  Clock, 
  Shield,
  ChevronRight,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  MessageCircle,
  BarChart3,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImage from '@/assets/images/logo.png'

// ============================================================================
// MAGIC UI COMPONENTS
// ============================================================================

// Animated gradient orbs background
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  )
}

// Animated grid background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="grid-pattern" />
    </div>
  )
}

// Floating particles
function Particles() {
  return (
    <div className="particles-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  )
}

// Glowing text effect
function GlowText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`glow-text ${className}`}>
      {children}
    </span>
  )
}

// Animated border card
function MagicCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`magic-card ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="magic-card-border" />
      <div className="magic-card-content">
        {children}
      </div>
    </div>
  )
}

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const duration = 2000
          const increment = value / (duration / 16)
          
          const timer = setInterval(() => {
            start += increment
            if (start >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// Typing animation
function TypeWriter({ words }: { words: string[] }) {
  const [currentWord, setCurrentWord] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWord]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(word.substring(0, currentText.length + 1))
        if (currentText === word) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        setCurrentText(word.substring(0, currentText.length - 1))
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentWord((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWord, words])

  return (
    <span className="typewriter">
      {currentText}
      <span className="cursor">|</span>
    </span>
  )
}

// Reveal on scroll
function RevealOnScroll({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`reveal-element ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ============================================================================
// LANDING PAGE SECTIONS
// ============================================================================

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoImage} alt="EaseQuote.AI" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              How it Works
            </a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Testimonials
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 border-0">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <GradientOrbs />
      <AnimatedGrid />
      <Particles />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <RevealOnScroll>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">AI-Powered Quote Management</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">New</span>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            Create Professional
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Quotes in Minutes
            </span>
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed">
            The smart quote management platform for{' '}
            <span className="text-white font-medium">
              <TypeWriter words={['tile installers', 'flooring pros', 'contractors', 'construction pros']} />
            </span>
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Generate multilingual PDF quotes, send via WhatsApp or email, and win more jobs with a professional presence.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/30 border-0 group">
              <Link to="/register">
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30 shadow-none">
              <a href="#how-it-works">
                See How It Works
              </a>
            </Button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cyan-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cyan-400" />
              <span>30 free quotes/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cyan-400" />
              <span>Multi-language support</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* Hero visual - floating quote mockup */}
        <RevealOnScroll delay={500} className="mt-16">
          <div className="relative max-w-4xl mx-auto">
            <div className="hero-mockup">
              <div className="mockup-glow" />
              <div className="mockup-content">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">Quote #2024-0156</div>
                      <div className="text-slate-400 text-sm">Kitchen Tile Installation</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                    Accepted
                  </div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between text-slate-300">
                    <span>Ceramic Tiles (24x24)</span>
                    <span className="font-medium text-white">$1,250.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Labor & Installation</span>
                    <span className="font-medium text-white">$850.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Materials & Grout</span>
                    <span className="font-medium text-white">$180.00</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-white/10 flex justify-between">
                    <span className="text-lg text-white font-semibold">Total</span>
                    <span className="text-lg text-cyan-400 font-bold">$2,280.00</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="floating-badge badge-1">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>EN / ES / PT</span>
            </div>
            <div className="floating-badge badge-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span>WhatsApp Ready</span>
            </div>
            <div className="floating-badge badge-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>&lt; 5 min</span>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-2.5 rounded-full bg-white/50 animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: 5000, suffix: '+', label: 'Quotes Created' },
    { value: 500, suffix: '+', label: 'Active Users' },
    { value: 70, suffix: '%', label: 'Time Saved' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  ]

  return (
    <section className="relative py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <RevealOnScroll key={index} delay={index * 100} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-400">{stat.label}</div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'Professional PDF Quotes',
      description: 'Generate beautiful, branded PDF quotes that make you look professional and win more jobs.',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Create quotes in English, Spanish, or Portuguese. Communicate with any client effortlessly.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Send,
      title: 'WhatsApp & Email',
      description: 'Send quotes directly via WhatsApp or email with one click. Fast and convenient.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Under 5 Minutes',
      description: 'Create complete quotes in under 5 minutes with our intuitive guided form.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Track & Manage',
      description: 'Monitor quote status, track conversions, and manage your entire pipeline in one place.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security. Your data is encrypted and backed up automatically.',
      gradient: 'from-rose-500 to-red-500',
    },
  ]

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <br />
            <GlowText>Win More Jobs</GlowText>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed specifically for construction professionals who want to look professional and save time.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <MagicCard key={index} delay={index * 100}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Enter Customer Info',
      description: 'Add your customer details or select from your saved clients. Quick autocomplete makes it easy.',
      icon: Users,
    },
    {
      number: '02',
      title: 'Add Line Items',
      description: 'Select tile types, sizes, and quantities. Our smart calculator does the math automatically.',
      icon: FileText,
    },
    {
      number: '03',
      title: 'Generate & Send',
      description: 'Generate a professional PDF quote and send it via WhatsApp or email in one click.',
      icon: Send,
    },
  ]

  return (
    <section id="how-it-works" className="relative py-32">
      <div className="max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-20">
          <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple as <GlowText>1-2-3</GlowText>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Create your first professional quote in under 5 minutes. No training required.
          </p>
        </RevealOnScroll>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -translate-y-1/2" />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <RevealOnScroll key={index} delay={index * 150}>
                <div className="relative group">
                  <div className="step-card">
                    <div className="absolute -top-6 -left-2 text-7xl font-black text-white/5 group-hover:text-cyan-500/10 transition-colors">
                      {step.number}
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "EaseQuote AI changed my business. I used to spend 30 minutes on each quote with pen and paper. Now it takes me 3 minutes and looks 10x more professional.",
      author: "José Martinez",
      role: "Tile Installer, Miami FL",
      rating: 5,
      avatar: "JM",
    },
    {
      quote: "The multilingual feature is incredible. I can send quotes in English to my American clients and Spanish to my Latino clients. Game changer!",
      author: "Maria Santos",
      role: "Flooring Contractor, Houston TX",
      rating: 5,
      avatar: "MS",
    },
    {
      quote: "My clients love receiving professional PDF quotes via WhatsApp. I've noticed they respond faster and I'm winning more jobs.",
      author: "Carlos Oliveira",
      role: "Flooring Pro, Orlando FL",
      rating: 5,
      avatar: "CO",
    },
  ]

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-cyan-950/50" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by <GlowText>Professionals</GlowText>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join hundreds of contractors who are winning more jobs with professional quotes.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <MagicCard key={index} delay={index * 150}>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '30 quotes per month',
        'PDF generation',
        'WhatsApp & Email sending',
        'Multilingual support',
        'Customer history',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29.90',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited quotes',
        'Everything in Basic',
        'Priority support',
        'Custom branding',
        'Analytics dashboard',
        'Export data',
      ],
      cta: 'Get Pro',
      highlighted: true,
    },
  ]

  return (
    <section id="pricing" className="relative py-32">
      <div className="max-w-5xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, <GlowText>Transparent</GlowText> Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <RevealOnScroll key={index} delay={index * 150}>
              <div className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-slate-400 font-medium mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <p className="text-slate-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className={`w-full h-12 text-base font-semibold ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/25' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Link to="/register">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="cta-gradient" />
      <GradientOrbs />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Look
            <br />
            <GlowText>More Professional?</GlowText>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of construction professionals who are winning more jobs with EaseQuote AI.
            Start free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-slate-100 shadow-xl group">
              <Link to="/register">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-transparent border border-white/30 text-white hover:bg-white/10 shadow-none">
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="EaseQuote.AI" className="h-8 w-auto opacity-80" />
          </div>
          
          <div className="flex items-center gap-8 text-slate-400 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} EaseQuote AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================

export function Landing() {
  return (
    <div className="landing-page bg-slate-950 text-white min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}

