import './App.css'
//import { Router } from './components/Routes/Router';
import  fire  from "../src/assets/logo/fire.png"
import {Sidebar} from "./layouts/Sidebar/Sidebar.tsx"

function App() {

  return (
      <div className="flex w-screen h-screen items-center justify-center bg-[#242424] text-white">
          <img src={fire} alt="logo" className="opacity-25"/>
          <Sidebar />
      </div>
  )
}

export default App
