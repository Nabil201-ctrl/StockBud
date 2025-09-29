import { useState, useEffect, FormEvent } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Waitlist(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Countdown target (example: Jan 1, 2026)
  const targetDate = new Date("2026-01-01T00:00:00Z").getTime();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (email && email.includes('@')) {
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("Thank you for joining the waitlist!");
          setName("");
          setEmail("");
        } else {
          setError(data.message || "An error occurred.");
        }
      } catch {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  const VideoModal = (): JSX.Element => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full">
        <button
          onClick={() => setShowVideoModal(false)}
          className="absolute -top-12 right-0 text-white hover:text-lime-400 text-2xl transition-colors"
        >
          ✕
        </button>
        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">▶</div>
            <p className="text-lg mb-2">Video would be embedded here</p>
            <p className="text-sm text-gray-400">(YouTube/Vimeo player)</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Wave 1 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, transparent 30%, rgba(204,255,0,0.1) 50%, transparent 70%)`,
            animation: 'wave1 8s ease-in-out infinite alternate'
          }}
        />
        
        {/* Wave 2 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(-45deg, transparent 40%, rgba(204,255,0,0.05) 60%, transparent 80%)`,
            animation: 'wave2 10s ease-in-out infinite alternate-reverse'
          }}
        />
        
        {/* Wave 3 */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 70%, rgba(204,255,0,0.1) 0%, transparent 50%)`,
            animation: 'wave3 12s ease-in-out infinite'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-lime-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <span className="bg-lime-400/20 text-lime-400 text-sm px-4 py-2 rounded-full font-medium border border-lime-400/30 backdrop-blur-sm shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              AVAILABLE IN EARLY 2026
            </span>
          </div>

          {/* Logo placeholder */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-lime-400 to-lime-300 flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_25px_rgba(204,255,0,0.4)] hover:shadow-[0_0_35px_rgba(204,255,0,0.6)] transition-all duration-300 transform hover:scale-105">
            W
          </div>

          {/* Headings */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-lime-100 to-white bg-clip-text text-transparent">
              Get early access
            </h1>
            <p className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
              Be amongst the first to experience Wait and launch a viral waitlist. 
              Sign up to be notified when we launch!
            </p>
          </div>

          {/* Email form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="px-5 py-4 rounded-xl bg-gray-800/80 backdrop-blur-sm text-white border border-gray-600 placeholder-gray-400 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-300"
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="px-5 py-4 rounded-xl bg-gray-800/80 backdrop-blur-sm text-white border border-gray-600 placeholder-gray-400 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-300"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-lime-400 to-lime-300 text-black font-bold px-8 py-4 rounded-xl hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              Join waitlist
            </button>
          </form>
          {message && <p className="text-lime-400">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* Avatars + count */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex -space-x-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-3 border-black bg-gradient-to-br from-gray-600 to-gray-800 shadow-lg hover:scale-110 transition-transform duration-200"
                  style={{
                    backgroundImage: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%) 0%, hsl(${i * 60 + 40}, 60%, 40%) 100%)`
                  }}
                />
              ))}
            </div>
            <p className="text-gray-300 font-medium">Join 12,500+ others on the waitlist</p>
          </div>

          {/* Countdown */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((item, i) => (
                <div key={i} className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <p className="text-2xl md:text-3xl font-bold text-lime-400 mb-1" style={{
                    textShadow: '0 0 10px rgba(204,255,0,0.5)'
                  }}>
                    {item.value}
                  </p>
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              LEFT UNTIL FULL RELEASE
            </p>
          </div>

          {/* Video section */}
          <div className="relative max-w-lg mx-auto">
            <button
              onClick={() => setShowVideoModal(true)}
              className="group relative w-full"
              type="button"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700 group-hover:border-lime-400/50 transition-all duration-300 overflow-hidden">
                {/* Video thumbnail background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full bg-gradient-to-br from-lime-400/20 to-transparent" />
                </div>
                
                {/* Play button */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-lime-400 to-lime-300 text-black flex items-center justify-center text-2xl group-hover:shadow-[0_0_30px_rgba(204,255,0,0.7)] transition-all duration-300 transform group-hover:scale-110">
                  <span className="ml-1">▶</span>
                </div>
              </div>
              <p className="mt-3 text-gray-300 group-hover:text-lime-400 transition-colors duration-200 font-medium">
                See how Wait works (3m)
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && <VideoModal />}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { 
            transform: translateX(-50%) translateY(-50%) rotate(0deg) scale(1);
          }
          50% { 
            transform: translateX(-30%) translateY(-30%) rotate(5deg) scale(1.1);
          }
        }
        
        @keyframes wave2 {
          0%, 100% { 
            transform: translateX(30%) translateY(30%) rotate(-10deg) scale(0.9);
          }
          50% { 
            transform: translateX(50%) translateY(50%) rotate(-5deg) scale(1.2);
          }
        }
        
        @keyframes wave3 {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          33% { 
            transform: scale(1.1) rotate(2deg);
          }
          66% { 
            transform: scale(0.9) rotate(-1deg);
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}