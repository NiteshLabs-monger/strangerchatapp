import './App.css'
import { RouterProvider } from 'react-router-dom'
import {router} from './routes/approutes.tsx'
import { useEffect } from 'react';
import { useTouchDeviceStore as useStore } from './store/usechatstore.ts';

function App() {
  const setIsTouchDevice = useStore((state) => state.setIsTouchDevice);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, [setIsTouchDevice]);


  return <RouterProvider router={router} />;
  
}

export default App
