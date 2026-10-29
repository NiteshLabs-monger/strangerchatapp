 export interface Message {
  id: string;
  content: string;
  sender: "user" | "stranger";
  reactions?: {user?:string,stranger?:string}
  replyTo?: { id: string; content: string; sender: "user" | "stranger" };
}