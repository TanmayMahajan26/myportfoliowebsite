import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function PersonalWebsite() {
  const [activeSection, setActiveSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesMeshRef = useRef(null);
  
  // Sample gallery photos - replace with your own
  const galleryPhotos = [
    {
      id: 1,
      image: '/images/IMG-20250424-WA0000.jpg' // Replace with path to your image
    },
    {
      id: 2,
      image: '/images/IMG-20250424-WA0002.jpg'// Replace with path to your image
    },
    {
      id: 3,
      image: '/images/IMG-20250424-WA0003.jpg' // Replace with path to your image
    },
    {
      id: 4,
      image: '/images/IMG-20250424-WA0004.jpg' // Replace with path to your image
    },
    {
      id: 5,
      image: '/images/IMG-20250424-WA0005.jpg'// Replace with path to your image
    },
    {
      id: 6,
      image: '/images/IMG-20250424-WA0006.jpg' // Replace with path to your image
    }
  ];
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Calculate normalized coordinates (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Set up Three.js animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    // Create variation in particles
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position in 3D space
      posArray[i] = (Math.random() - 0.5) * 5;      // x
      posArray[i + 1] = (Math.random() - 0.5) * 5;  // y
      posArray[i + 2] = (Math.random() - 0.5) * 5;  // z
      
      // Cyan color variations
      colorsArray[i] = 0.2 + Math.random() * 0.2;     // R (low)
      colorsArray[i + 1] = 0.7 + Math.random() * 0.3; // G (high)
      colorsArray[i + 2] = 0.8 + Math.random() * 0.2; // B (high)
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    // Create particle material with vertex colors for variation
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMeshRef.current = particlesMesh;
    scene.add(particlesMesh);
    
    // Position camera
    camera.position.z = 2;
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      // Rotate particles
      particlesMesh.rotation.x += 0.0003;
      particlesMesh.rotation.y += 0.0003;
      
      // Add gentle wave motion
      particlesMesh.position.y = Math.sin(Date.now() * 0.0005) * 0.1;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Dispose resources
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  // Update particles based on mouse position
  useEffect(() => {
    if (!particlesMeshRef.current) return;
    
    // Calculate target rotation based on mouse position
    const targetRotationX = mousePosition.y * 0.5;
    const targetRotationY = -mousePosition.x * 0.5;
    
    // Apply cursor influence with smooth transition
    const animate = () => {
      if (!particlesMeshRef.current) return;
      
      // Apply mouse influence with smooth easing
      particlesMeshRef.current.rotation.x += (targetRotationX - particlesMeshRef.current.rotation.x) * 0.05;
      particlesMeshRef.current.rotation.y += (targetRotationY - particlesMeshRef.current.rotation.y) * 0.05;
      
      // Create a subtle attraction effect toward the cursor
      if (Math.abs(mousePosition.x) > 0.1 || Math.abs(mousePosition.y) > 0.1) {
        particlesMeshRef.current.position.x += (mousePosition.x * 0.1 - particlesMeshRef.current.position.x) * 0.02;
        particlesMeshRef.current.position.y += (mousePosition.y * 0.1 - particlesMeshRef.current.position.y) * 0.02;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);
  
  // Monitor scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'gallery', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to section smoothly
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setMenuOpen(false);
    }
  };
  
  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-cyan-400">Tanmay's Portfolio</div>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-8">
            {['home', 'about', 'gallery', 'contact'].map((section) => (
              <li key={section}>
                <button 
                  onClick={() => scrollToSection(section)}
                  className={`capitalize ${activeSection === section ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-cyan-300'}`}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-gray-300 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="container mx-auto px-4 py-2">
              <ul className="flex flex-col space-y-2">
                {['home', 'about', 'gallery', 'contact'].map((section) => (
                  <li key={section}>
                    <button 
                      onClick={() => scrollToSection(section)}
                      className={`w-full text-left py-2 capitalize ${activeSection === section ? 'text-cyan-400 font-semibold' : 'text-gray-300'}`}
                    >
                      {section}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>
      
      {/* Home Section with 3D Background */}
      <section id="home" className="min-h-screen flex items-center justify-center text-white pt-16 relative overflow-hidden">
        {/* 3D Animation Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full z-0"
        />
        
        {/* Dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 opacity-70 z-10"></div>
        
      
        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fadeIn text-cyan-300">Tanmay Mahajan</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 text-cyan-100">Computer Engineering Student & Developer</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => scrollToSection('about')}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-all"
            >
              Learn More
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-transparent border-2 border-cyan-400 text-cyan-400 px-6 py-3 rounded-lg font-medium hover:bg-cyan-900 hover:bg-opacity-50 transition-all"
            >
              Contact Me
            </button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-300">About Me</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3">
              <div className="rounded-full overflow-hidden border-4 border-cyan-500 w-64 h-64 mx-auto">
                <img src="/images/IMG-20250424-WA0007.jpg" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-semibold mb-4 text-cyan-200">Hi, I'm Tanmay Mahajan</h3>
              <p className="text-gray-300 mb-6">
                I'm a passionate Computer Engineering student with a strong interest in web development, 
                artificial intelligence, and software engineering. Currently in my first year at 
                FRCRCE,Bandra. I'm always eager to learn new technologies and 
                contribute to innovative projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                  <h4 className="font-semibold mb-4 text-cyan-300">Skills</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> C/C++</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> HTML/CSS/JS</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> Java/Python(In Progress...)</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> Data Structures & Algorithms(In Progress...)</li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                  <h4 className="font-semibold mb-4 text-cyan-300">Education</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> Pursuing Computer Engineering</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> Fr. Conceicao Rodrigues College Of Engineering (2024-2028)</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▹</span> GPA: 8.9/10</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                <h4 className="font-semibold mb-2 text-cyan-300">Interests & Hobbies</h4>
                <p className="text-gray-300">
                  When I'm not coding, you can find me playing cricket,football, hiking, 
                  watching f1, or just listening to music.
                  I'm also passionate about open-source contributions and tech community events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-300">My Photo Gallery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-900 transition-all border border-gray-700 group">
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={photo.image} 
                    alt={photo.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity flex items-end">
                    <div className="p-4 w-full">
                      <h3 className="text-lg font-bold text-white">{photo.title}</h3>
                      <p className="text-cyan-300 text-sm">{photo.location}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">{photo.title}</h3>
                  <p className="text-cyan-400 text-sm">{photo.location}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-all">
              View More Photos
            </button>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-300">Get In Touch</h2>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
            <form
  action="https://formspree.io/f/myzwybjk" // replace this with your actual Formspree endpoint
  method="POST"
  className="space-y-6"
>
  <input type="hidden" name="_captcha" value="false" />
  <div>
    <label className="block text-sm font-medium text-gray-300">Name</label>
    <input
      type="text"
      name="name"
      required
      className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600 focus:border-cyan-400 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-300">Email</label>
    <input
      type="email"
      name="email"
      required
      className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600 focus:border-cyan-400 focus:outline-none"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-300">Message</label>
    <textarea
      name="message"
      rows="4"
      required
      className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600 focus:border-cyan-400 focus:outline-none"
    />
  </div>
  <button
    type="submit"
    className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-all"
  >
    Send Message
  </button>
</form>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-700 p-8 rounded-lg h-full border border-gray-600 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-cyan-300">Contact Information</h3>
                <p className="text-gray-300 mb-6">
                  Feel free to reach out to me through the contact form or via the information below.
                  I'm always open to discussing new projects, opportunities, or just having a chat.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-cyan-400 mr-4">✉️</span>
                    <span className="text-gray-300">tanmay261006@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-cyan-400 mr-4">📍</span>
                    <span className="text-gray-300">Kalyan , Maharashtra</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="font-medium mb-4 text-cyan-200">Follow Me</h4>
                  <div className="flex space-x-4">
                    <a href="https://github.com/TanmayMahajan26" className="text-gray-400 hover:text-cyan-400 transition-colors">
                      <span className="text-lg">GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/tanmay-mahajan-220ab826b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="text-gray-400 hover:text-cyan-400 transition-colors">
                      <span className="text-lg">LinkedIn</span>
                    </a>
                    <a href="https://www.instagram.com/tanmaymahajan26?igsh=MTlkOXh2d3ZoZWlpaQ==" className="text-gray-400 hover:text-cyan-400 transition-colors">
                      <span className="text-lg">Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold mb-2 text-cyan-400">Tanmay Mahajan</div>
              <p className="text-gray-400">Computer Science Student & Web Developer</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <a href="https://github.com/TanmayMahajan26" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <span className="text-lg">GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/tanmay-mahajan-220ab826b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <span className="text-lg">LinkedIn</span>
                </a>
                <a href="https://www.instagram.com/tanmaymahajan26?igsh=MTlkOXh2d3ZoZWlpaQ==" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <span className="text-lg">Instagram</span>
                </a>
              </div>
              <p className="text-gray-500">© 2025 Tanmay Mahajan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-700 transition-colors"
          aria-label="Scroll to top"
        >
          <span className="text-xl">↑</span>
        </button>
      )}
    </div>
  );
}