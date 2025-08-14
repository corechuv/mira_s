import React from "react";
import { supabase } from "../api/supabase";

type Session = { user: { id: string; email?: string | null } } | null;

const AuthCtx = React.createContext<{
  session: Session;
  signIn: (email:string, password:string)=>Promise<void>;
  signUp: (email:string, password:string)=>Promise<void>;
  signOut: ()=>Promise<void>;
}>({ session:null, signIn: async()=>{}, signUp: async()=>{}, signOut: async()=>{} });

export function AuthProvider({ children }:{ children:React.ReactNode }){
  const [session, setSession] = React.useState<Session>(null);

  React.useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session as any));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s as any));
    return () => sub.subscription.unsubscribe();
  },[]);

  async function signIn(email:string, password:string){
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) throw error;
  }
  async function signUp(email:string, password:string){
    const { error } = await supabase.auth.signUp({ email, password });
    if(error) throw error;
  }
  async function signOut(){
    const { error } = await supabase.auth.signOut();
    if(error) throw error;
  }

  return <AuthCtx.Provider value={{ session, signIn, signUp, signOut }}>{children}</AuthCtx.Provider>;
}
export const useAuth = ()=> React.useContext(AuthCtx);
