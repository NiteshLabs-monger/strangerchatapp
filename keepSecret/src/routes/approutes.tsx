// router.tsx
import { createBrowserRouter} from "react-router-dom";
import ChatRoom from "../components/textChatRoom";
import StrangerChatHero from "../components/hero";
import Navbar from "../components/navbar";
import RulesSection from "../components/communityrules";


export const router = createBrowserRouter([
  {
    path: "/text",
    element: <ChatRoom/>,
   
  },
  {
    path : "/home",
    element : <><Navbar/><StrangerChatHero/><RulesSection/></>
  }
],);


