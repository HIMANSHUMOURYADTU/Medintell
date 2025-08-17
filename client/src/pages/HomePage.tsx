import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ParticlesBackground from "@/components/ui/particles-background";
import { 
  Heart, 
  MessageCircle, 
  BarChart3, 
  MapPin, 
  Phone, 
  ClipboardList,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Mic
} from "lucide-react";

export default function HomePage() {
  const scrollRevealRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    scrollRevealRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      scrollRevealRef.current?.observe(el);
    });

    return () => {
      scrollRevealRef.current?.disconnect();
    };
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Particle.js Background */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        <ParticlesBackground />
        
        {/* Multiple Floating Logo Components - Distributed Across Full Width */}
        <div className="absolute top-20 left-4 floating-logo opacity-20">
          <div className="w-16 h-16 bg-health-green/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div 
          className="absolute top-32 right-4 floating-logo opacity-20" 
          style={{ animationDelay: '-2s' }}
        >
          <div className="w-12 h-12 bg-futuristic-purple/30 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <div 
          className="absolute bottom-32 left-4 floating-logo opacity-20" 
          style={{ animationDelay: '-4s' }}
        >
          <div className="w-14 h-14 bg-warning-amber/30 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
        </div>

        <div 
          className="absolute top-1/4 left-1/4 floating-logo opacity-15" 
          style={{ animationDelay: '-1s' }}
        >
          <div className="w-10 h-10 bg-medical-blue/30 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div 
          className="absolute top-1/3 right-1/4 floating-logo opacity-15" 
          style={{ animationDelay: '-3s' }}
        >
          <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div 
          className="absolute bottom-1/4 right-1/3 floating-logo opacity-15" 
          style={{ animationDelay: '-5s' }}
        >
          <div className="w-11 h-11 bg-purple-400/30 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div 
          className="absolute top-1/2 left-12 floating-logo opacity-10" 
          style={{ animationDelay: '-6s' }}
        >
          <div className="w-8 h-8 bg-amber-400/30 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div 
          className="absolute bottom-1/3 right-12 floating-logo opacity-10" 
          style={{ animationDelay: '-7s' }}
        >
          <div className="w-9 h-9 bg-red-400/30 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-red-600" />
          </div>
        </div>

        <div 
          className="absolute top-3/4 left-1/3 floating-logo opacity-15" 
          style={{ animationDelay: '-8s' }}
        >
          <div className="w-10 h-10 bg-indigo-400/30 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div 
          className="absolute top-1/6 right-1/2 floating-logo opacity-10" 
          style={{ animationDelay: '-9s' }}
        >
          <div className="w-7 h-7 bg-teal-400/30 rounded-full flex items-center justify-center">
            <Mic className="w-3 h-3 text-teal-600" />
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Main Logo */}
          <div className="mb-8 floating-logo">
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground mb-4">
              InteliMed
            </h1>
          </div>
          
          {/* Animated Tagline */}
          <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-2xl md:text-3xl font-light text-muted-foreground mb-8 leading-relaxed">
              Intelligent Healthcare Companion for{' '}
              <span className="text-primary font-semibold">Every Generation</span>
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Bridging the gap between technology and healthcare with personalized 
              AI-powered assistance for seniors, families, and healthcare providers.
            </p>
          </div>
          
          {/* Large CTA Buttons */}
          <div className="fade-in-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.6s' }}>
            <Button 
              onClick={scrollToFeatures}
              size="lg"
              variant="outline"
              className="backdrop-blur-sm border-medical-blue/50 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-medical-blue/20 hover:border-medical-blue transition-all duration-300 shadow-lg hover:shadow-xl bg-[#3c82f6]"
              data-testid="button-explore-solutions"
            >
              🏥 Explore Healthcare Solutions
            </Button>
            <Button 
              onClick={() => window.location.href = '/chat'}
              size="lg"
              className="bg-gradient-to-r from-medical-blue via-health-green to-primary text-white px-12 py-6 rounded-xl text-xl font-bold hover:shadow-2xl hover:shadow-health-green/50 transition-all duration-300 border border-health-green/30"
              data-testid="button-go-to-main-page"
            >
              💊 Start Healthcare Chat
            </Button>
          </div>
          
          {/* Voice Interaction Indicator */}
          <div className="mt-8 voice-pulse">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <Mic className="w-5 h-5" />
              <span className="text-sm">Voice assistance available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section 
        id="features" 
        className="py-20 bg-gradient-to-br from-secondary to-blue-50"
        data-testid="features-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of healthcare technology with our integrated platform 
              designed for all generations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Chatbot Feature */}
            <Card className="medical-card scroll-reveal" data-testid="card-ai-assistant">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">AI Health Assistant</h3>
                <p className="text-muted-foreground mb-6">
                  Multi-persona chatbot providing personalized healthcare guidance for seniors, 
                  children, and caregivers using advanced AI technology.
                </p>
                <Link href="/chat">
                  <Button variant="ghost" className="text-primary font-semibold hover:text-primary/80">
                    Try Now →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Health Tracking Feature */}
            <Card className="medical-card scroll-reveal" data-testid="card-health-tracking">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Health Goal Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Set and monitor health goals with visual progress tracking, medication reminders, 
                  and personalized recommendations.
                </p>
                <Link href="/health-goals">
                  <Button variant="ghost" className="text-green-600 font-semibold hover:text-green-700">
                    Track Health →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medical Facility Finder */}
            <Card className="medical-card scroll-reveal" data-testid="card-facility-finder">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Facility Finder</h3>
                <p className="text-muted-foreground mb-6">
                  Locate nearby medical facilities, hospitals, and specialists with integrated 
                  appointment scheduling and navigation.
                </p>
                <Link href="/facilities">
                  <Button variant="ghost" className="text-purple-600 font-semibold hover:text-purple-700">
                    Find Facilities →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Services */}
            <Card className="medical-card scroll-reveal" data-testid="card-emergency">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Emergency Support</h3>
                <p className="text-muted-foreground mb-6">
                  Quick access to emergency services with 108 direct calling, emergency contacts, 
                  and medical information sharing.
                </p>
                <Link href="/emergency">
                  <Button variant="ghost" className="text-red-600 font-semibold hover:text-red-700">
                    Emergency Access →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Health Assessment */}
            <Card className="medical-card scroll-reveal" data-testid="card-assessment">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                  <ClipboardList className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Health Assessment</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive health questionnaires and risk assessments with personalized 
                  recommendations and insights.
                </p>
                <Link href="/assessment">
                  <Button variant="ghost" className="text-amber-500 font-semibold hover:text-amber-600">
                    Take Assessment →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medication Management */}
            <Card className="medical-card scroll-reveal" data-testid="card-medications">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Medication Reminders</h3>
                <p className="text-muted-foreground mb-6">
                  Smart medication management with customizable reminders, dosage tracking, 
                  and interaction warnings.
                </p>
                <Link href="/medications">
                  <Button variant="ghost" className="text-indigo-600 font-semibold hover:text-indigo-700">
                    Manage Meds →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi-Persona Interface Section */}
      <section 
        id="personas" 
        className="py-20 bg-background"
        data-testid="personas-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Personalized Care for Everyone
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI adapts to different user needs with specialized interfaces and 
              communication styles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Seniors Persona */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 text-center scroll-reveal">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-blue-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-700">Senior Care Interface</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Senior Care</h3>
                <p className="text-muted-foreground mb-6">
                  Large fonts, simple navigation, medication reminders, and emergency support 
                  designed specifically for seniors.
                </p>
                <Link href="/chat/senior">
                  <Button className="bg-primary text-white hover:bg-primary/90 w-full">
                    Access Senior Interface
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Children Persona */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 p-8 text-center scroll-reveal">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-green-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-700">Kid-Friendly Interface</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Pediatric Care</h3>
                <p className="text-muted-foreground mb-6">
                  Colorful, engaging interface with games, visual health tracking, and 
                  child-friendly medical explanations.
                </p>
                <Link href="/chat/child">
                  <Button className="bg-green-600 text-white hover:bg-green-700 w-full">
                    Kid-Friendly Mode
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Anxious Patients Persona */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 text-center scroll-reveal">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-purple-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-purple-700">Calm Interface</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Anxiety Support</h3>
                <p className="text-muted-foreground mb-6">
                  Calming colors, reassuring language, breathing exercises, and stress management 
                  tools for anxious patients.
                </p>
                <Link href="/chat/anxious">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 w-full">
                    Calm Mode
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Caregivers Persona */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 text-center scroll-reveal">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-amber-200 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-amber-700">Caregiver Dashboard</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Caregiver Tools</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive dashboards, patient monitoring, care coordination, and family 
                  communication tools.
                </p>
                <Link href="/chat/caregiver">
                  <Button className="bg-amber-500 text-white hover:bg-amber-600 w-full">
                    Caregiver Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section 
        id="timeline" 
        className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white"
        data-testid="timeline-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Healthcare Journey</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              From vision to reality - building the future of healthcare technology
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-health-green"></div>
            
            <div className="space-y-12">
              {/* Timeline Item 1 */}
              <div className="flex items-center scroll-reveal">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-2xl font-bold text-primary mb-2">Vision & Research</h3>
                  <p className="text-blue-100">Identified the need for personalized healthcare AI across different demographics</p>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full border-4 border-blue-900 relative z-10 timeline-pulse"></div>
                <div className="flex-1 pl-8"></div>
              </div>
              
              {/* Timeline Item 2 */}
              <div className="flex items-center scroll-reveal">
                <div className="flex-1 pr-8"></div>
                <div className="w-4 h-4 bg-health-green rounded-full border-4 border-blue-900 relative z-10 timeline-pulse"></div>
                <div className="flex-1 text-left pl-8">
                  <h3 className="text-2xl font-bold text-health-green mb-2">AI Development</h3>
                  <p className="text-blue-100">Built multi-persona AI system using advanced language models</p>
                </div>
              </div>
              
              {/* Timeline Item 3 */}
              <div className="flex items-center scroll-reveal">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-2xl font-bold text-futuristic-purple mb-2">Platform Launch</h3>
                  <p className="text-blue-100">Integrated comprehensive healthcare features in one accessible platform</p>
                </div>
                <div className="w-4 h-4 bg-futuristic-purple rounded-full border-4 border-blue-900 relative z-10 timeline-pulse"></div>
                <div className="flex-1 pl-8"></div>
              </div>
              
              {/* Timeline Item 4 */}
              <div className="flex items-center scroll-reveal">
                <div className="flex-1 pr-8"></div>
                <div className="w-4 h-4 bg-warning-amber rounded-full border-4 border-blue-900 relative z-10 timeline-pulse"></div>
                <div className="flex-1 text-left pl-8">
                  <h3 className="text-2xl font-bold text-warning-amber mb-2">Future Vision</h3>
                  <p className="text-blue-100">Expanding to serve millions with personalized healthcare assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section 
        id="team" 
        className="py-20 bg-background"
        data-testid="team-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Healthcare professionals and technologists working together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <Card className="medical-card text-center scroll-reveal">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">👨‍⚕️</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Dr. Healthcare AI</h3>
                <p className="text-muted-foreground mb-4">Chief Medical Officer</p>
                <p className="text-sm text-muted-foreground">Specialized in AI-driven healthcare solutions</p>
              </CardContent>
            </Card>

            {/* Team Member 2 */}
            <Card className="medical-card text-center scroll-reveal">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-health-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">👩‍💻</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Tech Lead</h3>
                <p className="text-muted-foreground mb-4">Chief Technology Officer</p>
                <p className="text-sm text-muted-foreground">Expert in scalable healthcare platforms</p>
              </CardContent>
            </Card>

            {/* Team Member 3 */}
            <Card className="medical-card text-center scroll-reveal">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-futuristic-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">👩‍⚕️</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Care Specialist</h3>
                <p className="text-muted-foreground mb-4">Head of Patient Care</p>
                <p className="text-sm text-muted-foreground">Focused on user experience and accessibility</p>
              </CardContent>
            </Card>

            {/* Team Member 4 */}
            <Card className="medical-card text-center scroll-reveal">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-warning-amber rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">👨‍💼</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Product Manager</h3>
                <p className="text-muted-foreground mb-4">Head of Product</p>
                <p className="text-sm text-muted-foreground">Bridging healthcare needs with technology</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold">InteliMed</span>
            </div>
            <p className="text-gray-400 mb-12 max-w-3xl mx-auto text-lg">
              Bridging the gap between technology and healthcare with intelligent, 
              personalized assistance for every generation.
            </p>
            
            {/* Large Go to Main Page Button */}
            <div className="mb-12">
              <Button 
                onClick={() => window.location.href = '/chat'}
                size="lg"
                className="bg-gradient-to-r from-medical-blue via-health-green to-primary text-white px-16 py-8 rounded-2xl text-2xl font-bold hover:shadow-2xl hover:shadow-health-green/30 transition-all duration-500 border-2 border-health-green/40 hover:border-health-green/60"
                data-testid="button-footer-main-page"
              >
                🩺 Start Your Healthcare Journey
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4 text-primary">Emergency</h4>
                <p className="text-gray-400">24/7 Support: 108</p>
                <p className="text-gray-500 text-sm mt-1">India Emergency Services</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-health-green">Contact</h4>
                <p className="text-gray-400">support@intelimed.com</p>
                <p className="text-gray-500 text-sm mt-1">24/7 Technical Support</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-futuristic-purple">Privacy</h4>
                <p className="text-gray-400">HIPAA Compliant</p>
                <p className="text-gray-500 text-sm mt-1">Your data is secure</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">© 2024 InteliMed. Healthcare technology for everyone. 🏥✨</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
