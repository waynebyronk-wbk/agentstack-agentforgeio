import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, TrendingUp, Clock, DollarSign, Users, CheckCircle, ArrowRight, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";


export default function Landing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    leadType: "inquiry"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to dashboard
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit lead to backend
      const response = await fetch("/api/trpc/leads.create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
      console.log("Lead submitted successfully");
        setFormData({ name: "", email: "", phone: "", company: "", leadType: "inquiry" });
      }
    } catch (error) {
      console.error("Failed to submit lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Automated Lead Generation",
      description: "Capture qualified leads 24/7 without manual work"
    },
    {
      icon: DollarSign,
      title: "Generate $5K-$15K Monthly",
      description: "Real revenue from lead generation and commissions"
    },
    {
      icon: Clock,
      title: "30-Minute Setup",
      description: "Start generating revenue in under 30 minutes"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Tracking",
      description: "Monitor earnings and leads on your dashboard"
    },
    {
      icon: Users,
      title: "1,000+ Active Users",
      description: "Join entrepreneurs generating passive income"
    },
    {
      icon: CheckCircle,
      title: "No Technical Skills",
      description: "Works for any niche, no coding required"
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Digital Marketer",
      text: "Started 3 months ago, now making $8,000+ monthly. Best decision ever!",
      rating: 5
    },
    {
      name: "John Smith",
      title: "Lead Generation Agency",
      text: "Scaled from 0 to 100+ leads per month in just 2 weeks.",
      rating: 5
    },
    {
      name: "Emma Davis",
      title: "Entrepreneur",
      text: "The automation is incredible. I barely do anything and leads keep coming.",
      rating: 5
    }
  ];

  const steps = [
    { number: 1, title: "Connect", time: "5 min", description: "Link your Facebook/Instagram" },
    { number: 2, title: "Configure", time: "10 min", description: "Set your target audience" },
    { number: 3, title: "Launch", time: "5 min", description: "Start generating leads" },
    { number: 4, title: "Earn", time: "Ongoing", description: "Monitor revenue in real-time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AgentForge
          </div>
          <Link href="/pricing">
            <Button variant="ghost" className="text-white hover:text-blue-400">Pricing</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-6 inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full">
          <span className="text-blue-300 text-sm font-semibold">🚀 Join 1,000+ Entrepreneurs</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Generate <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">$5K-$15K Monthly</span> in Passive Income
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Automate lead generation with AI. Capture qualified leads 24/7. Get paid instantly. No technical skills required.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Link href="/pricing">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Start Generating Revenue
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg">
            Watch Demo (2 min)
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex justify-center gap-8 text-sm text-slate-400 mb-12">
          <div>⭐ 4.9/5 Rating</div>
          <div>✅ 50+ Leads This Month</div>
          <div>💰 $300-600 Revenue</div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="max-w-2xl mx-auto px-4 py-12 mb-20">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Get Started Free</CardTitle>
            <CardDescription className="text-slate-400">No credit card required. Setup takes 30 minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              <Input
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <select
                value={formData.leadType}
                onChange={(e) => setFormData({...formData, leadType: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-md"
              >
                <option value="inquiry">I'm Interested</option>
                <option value="business">I Have a Business</option>
                <option value="agency">I'm an Agency</option>
                <option value="other">Other</option>
              </select>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                {isSubmitting ? "Submitting..." : "Get Started Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose AgentForge?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card key={idx} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition">
                <CardHeader>
                  <Icon className="w-8 h-8 text-blue-400 mb-4" />
                  <CardTitle className="text-white">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm mb-2">{step.description}</p>
              <p className="text-blue-400 text-sm font-semibold">{step.time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
                <CardTitle className="text-white text-sm">{testimonial.name}</CardTitle>
                <CardDescription className="text-slate-400">{testimonial.title}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">How much does it cost?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Free to start! You only pay when you generate leads. Commission rates are 22% on verified amounts.
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">How long does setup take?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Just 30 minutes. Connect your Facebook/Instagram, set your audience, and start generating leads.
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Do I need technical skills?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              No! Our platform is completely no-code. Anyone can use it, regardless of technical background.
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Yes! No contracts, no hidden fees. Cancel anytime with one click.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Generating Revenue?</h2>
        <p className="text-xl text-slate-300 mb-8">Join 1,000+ entrepreneurs making passive income with AgentForge</p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
          Start Free Today
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 AgentForge. All rights reserved. | <Link href="/terms"><span className="hover:text-blue-400">Terms</span></Link> | <Link href="/privacy"><span className="hover:text-blue-400">Privacy</span></Link></p>
        </div>
      </footer>
    </div>
  );
}
