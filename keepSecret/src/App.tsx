import { useState } from 'react'

import './App.css'
import Navbar from './components/navbar'
import StrangerChatHero from './components/hero'
import RulesSection from './components/communityrules'
import { RouterProvider } from 'react-router-dom'
import {router} from './routes/approutes.tsx'

function App() {


  return <RouterProvider router={router} />;
  
}

export default App
