import React, { useEffect, useState } from 'react';

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
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {confettiPieces.map((piece, index) => (
          <ConfettiPiece key={index} {...piece} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            Great news,{' '}
            <span className="text-primary">your application is complete!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            One of our finance executives will be in touch{' '}
            <span className="underline decoration-yellow-400 decoration-4">ASAP</span>{' '}
            to discuss your quote and the next steps.
          </p>

          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">What happens next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Review</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your application
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  We'll call you within 24 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Finance</h3>
                <p className="text-sm text-muted-foreground">
                  Get your best finance deal
                </p>
              </div>
            </div>
          </div>

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