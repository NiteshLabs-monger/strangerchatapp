// router.tsx
import { createBrowserRouter} from "react-router-dom";
import ChatRoom from "../components/textChatRoom";
import StrangerChatHero from "../components/hero";

export const router = createBrowserRouter([
  {
    path: "/text",
    element: <ChatRoom/>,
    // errorElement: <ErrorPage />,
    // children: [
    //   {
    //     path: "dashboard",
    //     element: <Dashboard />,
    //     loader: dashboardLoader, // Data loads before component renders
    //   },
    // ],
  },
  // {
  //   path : "/home",
  //   element : <StrangerChatHero/>
  // }
],);


