import React, { useEffect, useState } from 'react';
import carfinancedLogoNew from "@/assets/carfinanced-logo-new.png";
import carfinancedHeaderLogo from "@/assets/carfinanced-header-logo.png";

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
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Pink Gradient Header with Confetti Background - Matches Home Page */}
      <div className="relative bg-gradient-to-br from-[#FF6B8A] via-[#FF7A94] to-[#FF8FA0] overflow-hidden">
        {/* Confetti Decorations */}
        <div className="absolute inset-0 opacity-40">
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

        {/* Logo Centered */}
        <div className="relative z-10 pt-8 pb-4 px-6 text-center">
          <a href="https://carfinanced.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src={carfinancedHeaderLogo} 
              alt="Car Financed Logo" 
              className="h-8 md:h-10"
            />
          </a>
        </div>

        {/* Trustpilot Stars */}
        <div className="relative z-10 pb-9 px-6 flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span className="text-white font-semibold">Trustpilot</span>
          <div className="flex gap-1 ml-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 bg-[#00B67A] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2L12.09 6.26L17 6.77L13.5 10.14L14.18 15.02L10 12.77L5.82 15.02L6.5 10.14L3 6.77L7.91 6.26L10 2Z"/>
                </svg>
              </div>
            ))}
          </div>
          <span className="text-white text-sm ml-1">Based on <span className="underline font-semibold">456 reviews</span></span>
        </div>

        {/* Wavy Bottom Edge */}
        <div className="relative" style={{ marginTop: '40px' }}>
          <svg className="w-full h-auto" style={{ display: 'block', transform: 'translateY(1px)' }} viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 Q360,10 720,40 T1440,40 L1440,100 L0,100 Z" fill="white"/>
          </svg>
        </div>
      </div>
      
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {confettiPieces.map((piece, index) => (
          <ConfettiPiece key={index} {...piece} />
        ))}
      </div>

      {/* Main Content with White Background */}
      <main className="bg-white pt-12 pb-8 min-h-screen -mt-1 flex flex-col">
        <div className="max-w-3xl mx-auto px-6 w-full flex-grow flex flex-col">
      
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center">
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
        </div>
      </main>

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