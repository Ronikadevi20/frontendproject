import { useEffect, useRef, useState } from 'react';
import { Shield, Database, Key, FileText, CheckCircle, BarChart, Clock, Layers } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);


  // Add animation classes to elements as they come into view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };


    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    // Counter animation for stats section
    const startCounters = () => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach((counter: Element) => {
        const htmlCounter = counter as HTMLElement;
        const target = parseInt(htmlCounter.getAttribute('data-target') || '0');
        const duration = 2000; // ms
        const step = target / (duration / 16); // 16ms per frame (approx 60fps)
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            htmlCounter.innerText = Math.ceil(current).toString();
            requestAnimationFrame(updateCounter);
          } else {
            htmlCounter.innerText = target.toString();
          }
        };


        updateCounter();
      });
    };

    // Add intersection observer for stats section to trigger counter animation
    if (statsRef.current) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      statsObserver.observe(statsRef.current);
    }

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  return (
    <PageContainer>
      {/* Hero Section with Parallax Effect */}
      <section className="bg-gradient-to-b from-EncryptEase-50 to-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-[10%] w-40 h-40 bg-EncryptEase-200/30 rounded-full blur-3xl animate-pulse-light"></div>
          <div className="absolute bottom-10 right-[15%] w-60 h-60 bg-EncryptEase-100/40 rounded-full blur-3xl animate-pulse-light"></div>
        </div>

        <div className="app-container">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="max-w-xl mb-10 lg:mb-0 relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
                Secure Your <span className="text-EncryptEase-600">Vault</span> Journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Manage your job applications and secure passwords in one place. Streamline your job search with EncryptEase.
              </p>
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto hover-card-effect">Get Started</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto hover-card-effect">
                      Log In
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto hover-card-effect"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>

            <div className="w-full max-w-md lg:max-w-lg relative z-10">
              <div className="relative group">
                <div className="absolute -top-4 -right-4 w-full h-full rounded-xl bg-EncryptEase-200 transform rotate-3 group-hover:rotate-1 transition-transform duration-300"></div>
                <div className="glass-card overflow-hidden p-6 relative z-10 hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-EncryptEase-50 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-medium text-EncryptEase-700 mb-2">Job Application Tracker</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm">Frontend Developer at TechCorp</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-sm">UX Designer at DesignStudio</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                        <span className="text-sm">Product Manager at StartupX</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-EncryptEase-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-medium text-EncryptEase-700 mb-2">Password Manager</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">LinkedIn</span>
                        <span className="text-sm">••••••••••</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Indeed</span>
                        <span className="text-sm">••••••••</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Glassdoor</span>
                        <span className="text-sm">•••••••••••</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Animated counters */}
      <section className="py-16 px-4 bg-white" ref={statsRef}>
        <div className="app-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-3xl font-bold text-EncryptEase-600 mb-2">
                <span className="counter" data-target="2500">0</span>+
              </div>
              <p className="text-gray-600">Students Served</p>
            </div>
            <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-3xl font-bold text-EncryptEase-600 mb-2">
                <span className="counter" data-target="15000">0</span>+
              </div>
              <p className="text-gray-600">Applications Tracked</p>
            </div>
            <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-3xl font-bold text-EncryptEase-600 mb-2">
                <span className="counter" data-target="98">0</span>%
              </div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
            <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-3xl font-bold text-EncryptEase-600 mb-2">
                <span className="counter" data-target="1200">0</span>+
              </div>
              <p className="text-gray-600">Job Offers Received</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards and Icons */}
      <section className="py-20 px-4 bg-EncryptEase-50/30">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features That Simplify Your Job Search</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All the tools you need to organize your applications and keep your credentials secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <div className="bg-EncryptEase-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-EncryptEase-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Tracker</h3>
              <p className="text-gray-600">
                Keep track of all your job applications in one organized dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <div className="bg-EncryptEase-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-EncryptEase-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Manager</h3>
              <p className="text-gray-600">
                Securely store and manage your job portal passwords with encryption.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <div className="bg-EncryptEase-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-EncryptEase-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-gray-600">
                Your data is encrypted and protected with industry-standard security measures.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <div className="bg-EncryptEase-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-EncryptEase-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Management</h3>
              <p className="text-gray-600">
                Intuitive interface for adding, editing, and managing all your job search data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - With Steps */}
      <section className="py-20 px-4 bg-white">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How EncryptEase Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to streamline your job search process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step Line Connector (visible on md+ screens) */}
            <div className="hidden md:block absolute top-24 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-EncryptEase-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative opacity-0 animate-on-scroll">
              <div className="flex flex-col items-center">
                <div className="glass-card h-16 w-16 rounded-full flex items-center justify-center mb-4 relative z-10 bg-white shadow-md">
                  <span className="text-2xl font-bold text-EncryptEase-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Sign Up</h3>
                <p className="text-gray-600 text-center">
                  Create your free account in seconds and get access to all features
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative opacity-0 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center">
                <div className="glass-card h-16 w-16 rounded-full flex items-center justify-center mb-4 relative z-10 bg-white shadow-md">
                  <span className="text-2xl font-bold text-EncryptEase-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Add Your Data</h3>
                <p className="text-gray-600 text-center">
                  Store job applications and password information securely in one place
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative opacity-0 animate-on-scroll" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col items-center">
                <div className="glass-card h-16 w-16 rounded-full flex items-center justify-center mb-4 relative z-10 bg-white shadow-md">
                  <span className="text-2xl font-bold text-EncryptEase-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Stay Organized</h3>
                <p className="text-gray-600 text-center">
                  Track progress, manage passwords, and focus on landing your dream job
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* AI Tools Section */}
      <section className="py-20 px-4 bg-EncryptEase-50/30">
        <div className="app-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Tools to Boost Your Success</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock the power of AI to practice interviews, generate documents, and stay ahead in your job search.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">AI Interview Practice</h3>
              <p className="text-gray-600 text-sm">
                Simulate real interviews with role-based questions, feedback, and voice-to-text AI evaluation.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Resume & Cover Builder</h3>
              <p className="text-gray-600 text-sm">
                Generate tailored resumes and cover letters based on job descriptions; edit and export with ease.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 text-center">
              <div className="text-4xl mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Follow-Up Generator</h3>
              <p className="text-gray-600 text-sm">
                Use AI to write professional follow-up emails after interviews or application submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel - Mobile Friendly */}
      <section className="py-20 px-4 bg-white">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore More Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Swipe through to discover all the ways EncryptEase can help your career journey
            </p>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {/* Feature Slide 1 */}
              <CarouselItem className="md:basis-1/2">
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-EncryptEase-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-EncryptEase-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Status Tracking</h3>
                      <p className="text-gray-600 text-center">
                        Follow your application status from submitted to interview to offer
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Feature Slide 2 */}
              <CarouselItem className="md:basis-1/2">
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-EncryptEase-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <BarChart className="h-8 w-8 text-EncryptEase-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">AI Tools</h3>
                      <p className="text-gray-600 text-sm">
                        Use AI to practice interviews, generate resumes, write follow-ups, and more — all in one smart workspace.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Feature Slide 3 */}
              <CarouselItem className="md:basis-1/2">
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-EncryptEase-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-EncryptEase-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Deadline Reminders</h3>
                      <p className="text-gray-600 text-center">
                        Never miss an important application deadline or interview
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Feature Slide 4 */}
              <CarouselItem className="md:basis-1/2">
                <Card className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-EncryptEase-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Layers className="h-8 w-8 text-EncryptEase-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Multiple Categories</h3>
                      <p className="text-gray-600 text-center">
                        Organize applications by job types, locations, or companies
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-1" />
            <CarouselNext className="right-1" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section with enhanced design */}
      <section className="py-20 px-4 bg-gradient-to-r from-EncryptEase-100 to-EncryptEase-50">
        <div className="app-container">
          <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between opacity-0 animate-on-scroll bg-white/80">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to streamline your job search?</h2>
              <p className="text-xl text-gray-600 mb-0">
                Join thousands of students who use EncryptEase to organize their job search journey.
              </p>
            </div>
            {!isAuthenticated ? (
              <div className="flex-shrink-0">
                <Link to="/signup">
                  <Button size="lg" className="text-base px-6 py-5 hover-card-effect">
                    Get Started for Free
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full sm:w-auto hover-card-effect"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section with enhanced cards */}
      <section className="py-20 px-4 bg-white">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Students like you are already benefiting from EncryptEase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-EncryptEase-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-EncryptEase-700 font-medium">JD</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Jessica D.</h4>
                  <p className="text-sm text-gray-500">Computer Science Student</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600">
                "EncryptEase has been a lifesaver during my senior year job search. I applied to over 50 positions and this tool kept everything organized!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-EncryptEase-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-EncryptEase-700 font-medium">MR</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Michael R.</h4>
                  <p className="text-sm text-gray-500">Business Major</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600">
                "The password manager feature is what sold me. I have different accounts on so many job sites, and EncryptEase keeps them all secure and accessible."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-EncryptEase-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-EncryptEase-700 font-medium">AT</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Aisha T.</h4>
                  <p className="text-sm text-gray-500">Engineering Graduate</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600">
                "I love how easy it is to track the status of each application. The interface is clean and intuitive. Highly recommend for all students!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - New addition */}
      <section className="py-20 px-4 bg-EncryptEase-50/30">
        <div className="app-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about EncryptEase
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* FAQ Item 1 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Is EncryptEase free to use?</h3>
              <p className="text-gray-600">
                Yes, EncryptEase is completely free for students. We believe in supporting your career journey without any cost barriers.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How secure is my data?</h3>
              <p className="text-gray-600">
                Very secure! We use industry-standard encryption protocols and never store your passwords in plain text. Your security is our priority.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I access EncryptEase on mobile?</h3>
              <p className="text-gray-600">
                Absolutely! EncryptEase is fully responsive and works flawlessly on phones, tablets, and desktops.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="glass-card p-6 opacity-0 animate-on-scroll hover-card-effect">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How does EncryptEase use AI to help with my job search?</h3>
              <p className="text-gray-600">
                EncryptEase offers a suite of AI-powered tools to boost your job search including interview simulation with real-time feedback, resume and cover letter generation based on job descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageContainer >
  );
};

export default LandingPage;
