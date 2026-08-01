import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';


import { DashboardView } from './views/DashboardView';

import { ImageStudioView } from './views/ImageStudioView';

import { StoryboardView } from './views/StoryboardView';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          
          
          <Route index element={<DashboardView />} />
          
          
          
          <Route path="image-studio" element={<ImageStudioView />} />
          
          
          
          <Route path="storyboard" element={<StoryboardView />} />
          
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
