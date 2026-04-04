"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ArrowUpRight, 
  Code2, 
  Terminal, 
  Cpu, 
  Globe, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";

// --- Utility Components ---

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="mb-12 md:mb-20">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-slate-400 text-lg max-w-2xl"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
    {children}
  </span>
);

// --- Data ---

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Work", href: "#work" },
  { name: "Stack", href: "#stack" },
  { name: "Contact", href: "#contact" },
];

const PROJECTS = [
  {
    title: "Nexus Dashboard",
    description: "A high-performance analytics dashboard capable of visualizing 1M+ data points in real-time using WebGL.",
    tags: ["Next.js", "WebGL", "TypeScript"],
    link: "#",
    color: "from-blue-600 to-cyan-500"
  },
  {
    title: "Aura UI Kit",
    description: "An accessible, headless component library focusing on micro-interactions and developer experience.",
    tags: ["React", "Storybook", "A11y"],
    link: "#",
    color: "from-purple-600 to-pink-500"
  },
  {
    title: "Vortex Engine",
    description: "AI-powered search infrastructure allowing semantic querying over unstructured enterprise data.",
    tags: ["Python", "Rust", "OpenAI"],
    link: "#",
    color: "from-emerald-600 to-teal-500"
  },
];

const SKILLS = [
  { name: "Frontend", icon: <Globe size={20} />, skills: ["React", "Next.js", "TypeScript", "Tailwind", "Three.js"] },
  { name: "Backend", icon: <Terminal size={20} />, skills: ["Node.js", "PostgreSQL", "Redis", "Go", "GraphQL"] },
  { name: "System", icon: <Cpu size={20} />, skills: ["Docker", "AWS", "CI/CD", "System Design"] },
];

// --- Main Component ---

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Code2 size={20} />
            </div>
            <span>DevFolio</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors">
              Let's Talk
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#050505] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl">
              {NAV_LINKS.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-slate-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center pt-20 relative">
          {/* Background Glow */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Available for new projects
            </div>
            
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Crafting digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                experiences
              </span> that matter.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              I'm a creative developer specializing in building scalable applications, 
              interactive interfaces, and accessible web solutions.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
                View Work <ChevronDown size={18} />
              </button>
              <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
                <Github size={18} /> GitHub
              </button>
            </div>
          </motion.div>
        </section>

        {/* Tech Stack Section (Bento Grid Style) */}
        <section id="stack" className="py-32 relative">
          <SectionHeading subtitle="The tools and technologies I use to bring ideas to life.">
            Technical Arsenal
          </SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKILLS.map((category, idx) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 text-sm rounded-lg bg-white/5 text-slate-400 border border-white/5">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="work" className="py-32">
          <SectionHeading subtitle="A selection of projects that showcase my passion for performance and design.">
            Featured Work
          </SectionHeading>

          <div className="flex flex-col gap-20">
            {PROJECTS.map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
              >
                {/* Visual Side */}
                <div className={`order-2 ${idx % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10 bg-white/5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/20 font-bold text-6xl uppercase tracking-tighter">
                        {project.title.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className={`order-1 ${idx % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                    {project.description}
                  </p>
                  <a href={project.link} className="inline-flex items-center gap-2 text-white font-semibold border-b border-transparent hover:border-indigo-400 pb-1 transition-all group/link">
                    View Project 
                    <ArrowUpRight size={18} className="group-hover/link:-translate-y-1 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact / Footer */}
        <section id="contact" className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 -z-10" />
          
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-8"
            >
              Let's build something <br />
              <span className="text-indigo-400">extraordinary.</span>
            </motion.h2>
            <p className="text-xl text-slate-400 mb-10">
              Currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
            <a 
              href="mailto:hello@example.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <Mail size={20} />
              Say Hello
            </a>
          </div>

          <footer className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} DevFolio. Built with Next.js & Tailwind.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </footer>
        </section>

      </main>
    </div>
  );
}