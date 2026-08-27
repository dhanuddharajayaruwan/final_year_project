import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TeamPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const team = [
        {
            name: "MARCUS COLE",
            role: "Founder & Head Trainer",
            bio: "With over 15 years in competitive bodybuilding and elite coaching, Marcus founded Cylon Force Gym to bridge the gap between science and performance.",
            img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop",
            specialties: ["Hypertrophy", "Competition Prep"]
        },
        {
            name: "SARAH JENKINS",
            role: "Lead Fitness Coach",
            bio: "Sarah specializes in functional mobility and weight loss transformations. Her energy and meticulous attention to form make her one of our most requested coaches.",
            img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop",
            specialties: ["Mobility", "HIIT"]
        },
        {
            name: "DAVID MILLER",
            role: "Crossfit & Powerlifting Expert",
            bio: "A multi-discipline athlete, David brings unparalleled expertise in heavy lifting and explosive power. He leads our advanced strength programs.",
            img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
            specialties: ["Powerlifting", "Strength"]
        },
        {
            name: "ELENA RODRIGUEZ",
            role: "Nutrition & Wellness Consultant",
            bio: "Elena ensures our members have the fuel they need. She integrates custom meal planning with our training subscriptions for maximum results.",
            img: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop",
            specialties: ["Nutrition", "Yoga"]
        }
    ];

    return (
        <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
            <Navbar />
            
            <div className="pt-32 pb-24 px-6 md:px-16 lg:px-24">
                <div className="text-center mb-20 animate-fadeIn">
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">The Elite <span className="text-red-600">Squad</span></h1>
                    <p className="text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Meet the experts behind the movement. Our team consists of world-class athletes and certified professionals dedicated to your transformation.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-16 max-w-6xl mx-auto">
                    {team.map((member, i) => (
                        <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center animate-slideUp`}>
                            <div className="flex-1 w-full group">
                                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] border border-gray-800">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition"></div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] italic">{member.role}</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mt-2">{member.name}</h2>
                                </div>
                                <p className="text-gray-400 font-light leading-relaxed text-lg italic">"{member.bio}"</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {member.specialties.map((s, idx) => (
                                        <span key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <div className="pt-6 flex gap-4">
                                    <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition">𝕏</button>
                                    <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition">📸</button>
                                    <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition">💼</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TeamPage;
