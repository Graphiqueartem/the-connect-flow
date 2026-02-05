import React, { useEffect, useState } from 'react';
import { Timer } from "lucide-react";
import carfinancedHeaderLogo from "@/assets/carfinanced-header-logo.svg";
import trustpilotLogo from "@/assets/trustpilot-logo.png";
import confettiTexture from "@/assets/confetti-texture.svg";

interface ConfettiPieceProps {
  color: string;
  width: number;
  height: number;
  borderRadius: string;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
  rotation: number;
  driftX: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ 
  color, 
  width, 
  height,
  borderRadius,
  left, 
  top,
  animationDelay, 
  animationDuration,
  rotation,
  driftX
}) => {
  return (
    <div
      className="absolute"
      style={{
        backgroundColor: color,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius,
        left: `${left}%`,
        top: `${top}px`,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`,
        animation: `confetti-fall ${animationDuration}s ${animationDelay}s ease-out forwards`,
        ["--confetti-rotate" as any]: `${rotation}deg`,
        ["--confetti-dx" as any]: `${driftX}vw`,
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

    // Generate confetti pieces across the full screen for a colorful burst
    const pieces: ConfettiPieceProps[] = [];
    const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF7EB6', '#22C1C3'];
    
    for (let i = 0; i < 200; i++) {
      const size = Math.random() * 10 + 6;
      const shape = Math.random();
      const isCircle = shape > 0.7;
      const isSquare = !isCircle && shape > 0.4;
      const width = isCircle ? size : isSquare ? size * 0.9 : size * 1.4;
      const height = isCircle ? size : isSquare ? size * 0.9 : size * 0.45;
      const borderRadius = isCircle ? "50%" : "3px";
      const left = Math.random() * 100;
      const driftX = (Math.random() * 2 - 1) * (8 + Math.random() * 10);
      pieces.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        width,
        height,
        borderRadius,
        left,
        top: -30 - Math.random() * 40,
        driftX,
        animationDelay: Math.random() * 0.6,
        animationDuration: Math.random() * 2.4 + 2.4,
        rotation: Math.random() * 360,
      });
    }
    
    setConfettiPieces(pieces);
  }, [formData, utmParams]);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Header matching application steps */}
      <div
        className="relative pb-[75px] overflow-hidden"
        style={{
          backgroundColor: "#FF585E",
        }}
      >
        <img
          src={confettiTexture}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-0 w-[70px] sm:w-[160px] md:w-[200px] h-auto"
        />
        <img
          src={confettiTexture}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 z-0 w-[70px] sm:w-[160px] md:w-[200px] h-auto"
        />

        {/* Logo Centered */}
        <div className="relative z-10 pt-4 sm:pt-6 pb-2 sm:pb-3 px-4 sm:px-6 text-center">
          <a href="https://carfinanced.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src={carfinancedHeaderLogo} 
              alt="Car Financed Logo" 
              className="h-7 sm:h-8 md:h-10"
            />
          </a>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-white font-semibold">
            <span>Thank you for applying with CarFinanced!</span>
          </div>
        </div>

        {/* Curved arch bottom to match main header */}
        <svg
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: "-4px",
            left: "0",
            width: "100%",
            height: "94px",
          }}
        >
          {/* White arch */}
          <path
            d="M 0,180 L 0,100 Q 720,0 1440,100 L 1440,180 Z"
            fill="#ffffff"
          />
          {/* White seam cover to avoid red hairline at the curve */}
          <path
            d="M 0,100 Q 720,0 1440,100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Yellow accent line */}
          <path
            d="M 0,100 Q 720,0 1440,100"
            fill="none"
            stroke="#FFD700"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {confettiPieces.map((piece, index) => (
          <ConfettiPiece key={index} {...piece} />
        ))}
      </div>

      {/* Main Content with White Background */}
      <main className="bg-white py-6 md:py-10 min-h-[calc(100vh-200px)] -mt-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-start flex-grow">
          {/* Checkmark Circle */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FF6B8A] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-12 md:h-12">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-center px-4">
            <span className="text-gray-900">Great news, </span>
            <span className="text-[#FF585E]">your application is complete!</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 text-center px-4 mb-6 md:mb-8">
            One of our finance executives will be in touch ASAP to discuss your quote and the next steps.
          </p>
        
          <div className="mt-4 w-full">
            <div className="flex justify-center pb-2">
              <a
                href="https://uk.trustpilot.com/review/carfinanced.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <img
                  src={trustpilotLogo}
                  alt="Trustpilot rating"
                  className="h-4 sm:h-5 md:h-6 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes confetti-fall {
            0% {
              transform: translate(0, 0) rotate(var(--confetti-rotate));
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--confetti-dx, 0vw), 110vh) rotate(calc(var(--confetti-rotate) + 720deg));
              opacity: 0;
            }
          }
        `
      }} />
    </div>
  );
};

export default ThankYouPage;
