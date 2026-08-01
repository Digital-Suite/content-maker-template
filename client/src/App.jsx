import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { VideoCreatorWizard } from './views/VideoCreatorWizard';
import { MyVideosView } from './views/MyVideosView';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<VideoCreatorWizard />} />
          <Route path="videos" element={<MyVideosView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
