import { Composition, registerRoot } from 'remotion';
import { ContentMakerComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ContentMakerVideo-Portrait"
        component={ContentMakerComposition}
        durationInFrames={300} // Will be dynamically calculated based on props
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [
            {
              id: '1',
              image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1080&h=1920',
              duration: '3s',
              caption: 'THE SOLUTION',
              captionPosition: 'center',
              captionStyle: 'blur_overlay',
              captionColor: 'white'
            }
          ]
        }}
      />
      <Composition
        id="ContentMakerVideo-Landscape"
        component={ContentMakerComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: []
        }}
      />
      <Composition
        id="ContentMakerVideo-Square"
        component={ContentMakerComposition}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          scenes: []
        }}
      />
    </>
  );
};
