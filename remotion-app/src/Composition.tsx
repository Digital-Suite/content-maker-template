import React from 'react';
import { AbsoluteFill, Img, Sequence, useVideoConfig } from 'remotion';

export type Scene = {
  id: string | number;
  image: string;
  duration: string; // e.g., '2.5s'
  caption: string;
  captionPosition: 'top' | 'center' | 'bottom';
  captionStyle: 'text_only' | 'dark_overlay' | 'blur_overlay';
  captionColor: string;
  captionCustomColor?: string;
};

export type ContentMakerProps = {
  scenes: Scene[];
};

export const ContentMakerComposition: React.FC<ContentMakerProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  const parseDurationFrames = (dur: string) => {
    if (!dur) return 3 * fps; // default 3s
    const seconds = parseFloat(dur.replace('s', ''));
    return Math.round(seconds * fps);
  };

  let currentStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene) => {
        const durationInFrames = parseDurationFrames(scene.duration);
        const startFrame = currentStartFrame;
        currentStartFrame += durationInFrames;

        const textColor = scene.captionColor === 'custom' 
          ? scene.captionCustomColor 
          : scene.captionColor;

        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill>
              <Img 
                src={scene.image} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  opacity: 0.8
                }} 
              />
              <AbsoluteFill
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '64px',
                  justifyContent: 
                    scene.captionPosition === 'top' ? 'flex-start' : 
                    scene.captionPosition === 'bottom' ? 'flex-end' : 
                    'center'
                }}
              >
                {scene.caption && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      backgroundColor: 
                        scene.captionStyle === 'dark_overlay' ? 'rgba(0,0,0,0.6)' :
                        scene.captionStyle === 'blur_overlay' ? 'rgba(0,0,0,0.4)' : 'transparent',
                      backdropFilter: scene.captionStyle === 'blur_overlay' ? 'blur(12px)' : 'none',
                      padding: scene.captionStyle !== 'text_only' ? '32px' : '0px',
                      borderRadius: '24px',
                      borderTop: scene.captionStyle === 'blur_overlay' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      borderBottom: scene.captionStyle === 'blur_overlay' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <h1
                      style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        fontSize: '64px',
                        fontWeight: 900,
                        fontFamily: 'Montserrat, Inter, sans-serif',
                        color: textColor || 'white',
                        textShadow: '0px 4px 15px rgba(0,0,0,0.8)',
                        margin: 0,
                        lineHeight: 1.1
                      }}
                    >
                      {scene.caption}
                    </h1>
                  </div>
                )}
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
