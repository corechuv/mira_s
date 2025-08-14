import React from "react";
import { supabase } from "../api/supabase";

type SbSession = {
  user: {
    id: string;
    email?: string | null;
    email_confirmed_at?: string | null;
  }
} | null;

type AuthCtxType = {
  session: SbSession;
  loading: boolean;
  recovery: boolean; // пришли по ссылке восстановления
  signIn: (email:string, password:string)=>Promise<void>;
  signUp: (email:string, password:string)=>Promise<void>;
  signOut: ()=>Promise<void>;
  resetPassword: (email:string)=>Promise<void>;
  updatePassword: (newPassword:string)=>Promise<void>;
};

const AuthCtx = React.createContext<AuthCtxType>({
  session:null, loading:false, recovery:false,
  signIn: async()=>{}, signUp: async()=>{}, signOut: async()=>{},
  resetPassword: async()=>{}, updatePassword: async()=>{}
});

export function AuthProvider({ children }:{ children:React.ReactNode }){
  const [session, setSession] = React.useState<SbSession>(null);
  const [loading, setLoading] = React.useState(true);
  const [recovery, setRecovery] = React.useState(false);

  React.useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session as any);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s as any);
      if(event === "PASSWORD_RECOVERY") setRecovery(true);
      if(event === "SIGNED_OUT") setRecovery(false);
    });
    return () => sub.subscription.unsubscribe();
  },[]);

  async function signIn(email:string, password:string){
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if(error) throw error;
  }
  async function signUp(email:string, password:string){
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password,
      options: { emailRedirectTo: window.location.origin + "/#/account" }
    });
    setLoading(false);
    if(error) throw error;
  }
  async function signOut(){
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if(error) throw error;
  }
  async function resetPassword(email:string){
    // Отправит письмо с ссылкой на recovery (вернёт пользователя в /#/account)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/#/account"
    });
    if(error) throw error;
  }
  async function updatePassword(newPassword:string){
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if(error) throw error;
    setRecovery(false);
  }

  return (
    <AuthCtx.Provider value={{ session, loading, recovery, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = ()=> React.useContext(AuthCtx);
