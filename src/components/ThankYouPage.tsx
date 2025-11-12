import React, { useEffect, useState } from 'react';
import carfinancedLogoNew from "@/assets/carfinanced-logo-new.png";
import trustpilotLogo from "@/assets/trustpilot-logo.png";

interface ConfettiPieceProps {
  color: string;
  size: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
  rotation: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ 
  color, 
  size, 
  left, 
  animationDelay, 
  animationDuration,
  rotation
}) => {
  return (
    <div
      className="absolute"
      style={{
        backgroundColor: color,
        width: `${size * 1.5}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: '-20px',
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`,
        animation: `fall-down ${animationDuration}s ${animationDelay}s ease-in forwards`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `0 0 ${size/3}px ${color}`,
        borderRadius: '2px',
      }}
    />
  );
};

interface ThankYouPageProps {
  formData: any;
  utmParams?: Record<string, string>;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ formData, utmParams = {} }) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPieceProps[]>([]);

  useEffect(() => {
    console.log('🎉 ===== THANK YOU PAGE LOADED SUCCESSFULLY =====');
    console.log('✅ Form submission completed - user reached thank you page');
    console.log('📊 Final Form Data received:', JSON.stringify(formData, null, 2));
    console.log('🏷️ UTM Parameters received:', JSON.stringify(utmParams, null, 2));
    console.log('⏰ Thank you page loaded at:', new Date().toISOString());
    
    // Send form data to webhook automatically (backend functionality)
    const sendToWebhook = async () => {
      console.log('📋 Preparing additional webhook data...');
      
      try {
        const submissionData = {
          ...formData,
          utmParams,
          submissionTime: new Date().toISOString(),
          page: 'thankyou'
        };

        // Webhook integration happens here - configure your webhook URL
        console.log('📤 Form data ready for webhook submission:', JSON.stringify(submissionData, null, 2));
        
        // Uncomment and configure when ready:
        // await fetch(webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   mode: 'no-cors',
        //   body: JSON.stringify(submissionData),
        // });
      } catch (error) {
        console.error('❌ Webhook error:', error);
      }
    };

    sendToWebhook();

    // Generate confetti pieces that fall from top
    const pieces: ConfettiPieceProps[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    
    // Create confetti pieces that fall from the top
    for (let i = 0; i < 150; i++) {
      pieces.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: Math.random() * 3 + 3,
        rotation: Math.random() * 360,
      });
    }
    
    setConfettiPieces(pieces);
  }, [formData, utmParams]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header Section with confetti background */}
      <div className="relative bg-[#FF6B8A] overflow-hidden py-6">
        {/* Confetti Decorations */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-8 left-[5%] w-3 h-8 bg-blue-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-12 left-[15%] w-4 h-4 bg-yellow-300 rotate-12 rounded-sm"></div>
          <div className="absolute top-6 left-[25%] w-2 h-6 bg-green-400 -rotate-12 rounded-sm"></div>
          <div className="absolute top-16 left-[35%] w-3 h-3 bg-purple-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-10 left-[45%] w-2 h-8 bg-pink-300 -rotate-45 rounded-sm"></div>
          <div className="absolute top-14 left-[55%] w-4 h-4 bg-orange-400 rotate-12 rounded-sm"></div>
          <div className="absolute top-8 left-[65%] w-3 h-6 bg-cyan-400 -rotate-12 rounded-sm"></div>
          <div className="absolute top-12 left-[75%] w-2 h-4 bg-red-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-6 left-[85%] w-4 h-8 bg-indigo-400 -rotate-45 rounded-sm"></div>
          <div className="absolute top-16 left-[95%] w-2 h-3 bg-lime-400 rotate-12 rounded-sm"></div>
          
          {/* Additional confetti for density */}
          <div className="absolute top-4 left-[10%] w-2 h-4 bg-yellow-400 rotate-45 rounded-sm"></div>
          <div className="absolute top-18 left-[20%] w-3 h-3 bg-blue-300 -rotate-12 rounded-sm"></div>
          <div className="absolute top-7 left-[40%] w-2 h-5 bg-green-300 rotate-12 rounded-sm"></div>
          <div className="absolute top-15 left-[60%] w-4 h-3 bg-pink-400 -rotate-45 rounded-sm"></div>
          <div className="absolute top-5 left-[80%] w-2 h-6 bg-purple-300 rotate-45 rounded-sm"></div>
          <div className="absolute top-11 left-[90%] w-3 h-4 bg-orange-300 -rotate-12 rounded-sm"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* Logo - Transparent Style */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white rounded-full px-8 py-2.5">
              <span className="text-white font-bold text-xl tracking-wide">carfinanced</span>
            </div>
            
            {/* Trustpilot Section with Boxed Stars */}
            <div className="flex items-center gap-2">
              <img 
                src={trustpilotLogo} 
                alt="Trustpilot" 
                className="h-5"
              />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-[#00B67A] flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                ))}
              </div>
              <a 
                href="https://www.trustpilot.com/review/carfinanced.co.uk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white text-sm hover:underline ml-1"
              >
                Based on <span className="font-semibold underline">456 reviews</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy Divider */}
      <div className="relative h-24 bg-[#FF6B8A] overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,120 L0,120 Z"
            fill="#FFEB3B"
          />
        </svg>
      </div>
      
      {/* Confetti Animation - Full screen */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiPieces.map((piece, index) => (
          <ConfettiPiece key={index} {...piece} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 text-center -mt-12">
        <div className="max-w-2xl mx-auto">
          {/* Checkmark Circle */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-[#FF6B8A] rounded-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Thank You!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-900 mb-3">
            Your form has been successfully submitted.
          </p>
          
          <p className="text-lg md:text-xl text-gray-900">
            We appreciate your enquiry, and we will get back to you shortly.
          </p>
        </div>
        
        {/* Privacy Policy Text at Bottom */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <p className="text-muted-foreground text-sm text-center max-w-3xl mx-auto">
            The personal information we have collected from you will be shared with fraud prevention agencies who will use it to prevent fraud and money laundering and to verify your identity. If fraud is detected, you could be refused finance{" "}
            <a href="https://carfinanced.co.uk/privacy?_gl=1*1cbkk17*_ga*MTIwNDU0ODg5Ni4xNzU3Njc4ODIx*_ga_6ZQ951WRXK*czE3NTc3MDAzMzckbzMkZzEkdDE3NTc3MDQ4NjgkajU4JGwwJGgw" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fall-down {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0.3;
            }
          }
        `
      }} />
    </div>
  );
};

export default ThankYouPage;