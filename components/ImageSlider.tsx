
import React, { useState, useEffect } from 'react';

const sliderImages = [
  {
    url: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=1600&auto=format&fit=crop',
    title: 'Precision Locker Casting',
    description: 'RQC check for premium bike and car security lock bodies'
  },
  {
    url: 'https://images.unsplash.com/photo-1542362567-b05e81799a14?q=80&w=1600&auto=format&fit=crop',
    title: 'Automotive Lock Hardware',
    description: 'Manufacturing anti-theft gear locks and steering security sets'
  },
  {
    url: 'https://images.unsplash.com/photo-1517520287167-4bda64282b54?q=80&w=1600&auto=format&fit=crop',
    title: 'Security Chain Coating',
    description: 'Incoming material testing for high-tensile security chains'
  }
];

const ImageSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[450px] overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white group">
      {sliderImages.map((img, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
          <img src={img.url} className="w-full h-full object-cover brightness-75 transition-transform duration-[5000ms] scale-110 group-hover:scale-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4 border-l-4 border-indigo-600 pl-4">Industrial Excellence</span>
            <h2 className="text-white text-5xl font-black uppercase tracking-tighter italic mb-4">{img.title}</h2>
            <p className="text-gray-300 text-lg font-medium max-w-xl">{img.description}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-12 right-12 flex gap-3">
        {sliderImages.map((_, idx) => (
          <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-indigo-500' : 'w-4 bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
