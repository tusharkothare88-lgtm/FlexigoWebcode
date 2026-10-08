import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Food Delivery Partner',
    city: 'Pune',
    image: 'https://i.pravatar.cc/150?img=11',
    text: "Switched to Flexigo 3 months ago. The battery swap feature is a lifesaver. I don't waste time charging anymore, which means I can complete more orders and earn at least 30% more daily.",
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'E-commerce Courier',
    city: 'Mumbai',
    image: 'https://i.pravatar.cc/150?img=5',
    text: "The zero maintenance promise is real. Whenever there's an issue with the brakes or tyres, the hub team replaces the scooter within 10 minutes. Complete peace of mind.",
    rating: 5
  },
  {
    id: 3,
    name: 'Vikram Singh',
    role: 'Logistics Rider',
    city: 'Nagpur',
    image: 'https://i.pravatar.cc/150?img=8',
    text: "I was spending Rs 300 daily on petrol. Now with the Weekly Pro plan, my expenses are fixed and much lower. The app is also very easy to use for tracking payments.",
    rating: 4
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = testimonials.length - 1;
      if (nextIndex >= testimonials.length) nextIndex = 0;
      return nextIndex;
    });
  };

  return (
    <section className="py-24 lg:py-32 bg-flexigo-dark text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-flexigo-accent rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          <div className="w-full lg:w-1/3 text-center lg:text-left">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-flexigo-accent font-medium uppercase tracking-wider mb-4"
             >
               Rider Stories
             </motion.div>
             <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-8"
             >
               Don't just take <br className="hidden md:block"/> our word for it.
             </motion.h2>

             <div className="flex items-center justify-center lg:justify-start gap-4">
               <button 
                 onClick={() => paginate(-1)}
                 className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => paginate(1)}
                 className="w-12 h-12 rounded-full border border-flexigo-teal bg-flexigo-teal/20 text-flexigo-teal flex items-center justify-center hover:bg-flexigo-teal hover:text-white transition-all transform hover:scale-105"
               >
                 <ChevronRight className="w-6 h-6" />
               </button>
             </div>
          </div>

          <div className="w-full lg:w-2/3 min-h-[450px] sm:min-h-[400px] relative">
             <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-md h-full flex flex-col justify-between">
                     <div>
                        <Quote className="w-12 h-12 text-flexigo-teal opacity-50 mb-6" />
                        <p className="text-xl lg:text-2xl font-body leading-relaxed text-slate-200 mb-8">
                          "{testimonials[currentIndex].text}"
                        </p>
                     </div>
                     
                     <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-flexigo-teal/50">
                             <img 
                               src={testimonials[currentIndex].image} 
                               alt={testimonials[currentIndex].name} 
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div>
                             <h4 className="font-bold font-heading text-lg">{testimonials[currentIndex].name}</h4>
                             <p className="text-sm text-slate-400">{testimonials[currentIndex].role} • {testimonials[currentIndex].city}</p>
                           </div>
                        </div>
                        
                        <div className="hidden sm:flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                            />
                          ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
             </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
