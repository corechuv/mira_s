import React from "react";
import { supabase } from "../api/supabase";

type SbSession = { user:{ id:string; email?:string|null; email_confirmed_at?:string|null } } | null;

type AuthCtxType = {
  session: SbSession; loading: boolean; recovery: boolean;
  signIn:(email:string,password:string)=>Promise<void>;
  signUp:(email:string,password:string)=>Promise<void>;
  signOut:()=>Promise<void>;
  resetPassword:(email:string)=>Promise<void>;
  updatePassword:(newPassword:string)=>Promise<void>;
};

const AuthCtx = React.createContext<AuthCtxType>({
  session:null, loading:false, recovery:false,
  signIn:async()=>{}, signUp:async()=>{}, signOut:async()=>{},
  resetPassword:async()=>{}, updatePassword:async()=>{}
});

function sanitizeAuthUrl(to:string = "/#/account"){
  const hasTokens = /access_token=|refresh_token=|type=recovery/.test(location.hash + location.search);
  if (hasTokens) history.replaceState({}, "", location.origin + to);
}

export function AuthProvider({ children }:{ children:React.ReactNode }){
  const [session, setSession] = React.useState<SbSession>(null);
  const [loading, setLoading] = React.useState(true);
  const [recovery, setRecovery] = React.useState(false);

  React.useEffect(()=>{
    (async ()=>{
      const { data, error } = await supabase.auth.getSession();
      if(error) console.error("[auth.getSession] error:", error);
      setSession(data?.session as any);
      setLoading(false);
      setTimeout(()=>sanitizeAuthUrl(),0);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      console.info("[auth event]", event, s?.user?.email || s?.user?.id);
      setSession(s as any);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "USER_UPDATED") setRecovery(false);
      setTimeout(()=>sanitizeAuthUrl(),0);
    });
    return () => sub.subscription.unsubscribe();
  },[]);

  async function signIn(email:string, password:string){
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if(error){ console.error("[signIn]", error); throw error; }
  }
  async function signUp(email:string, password:string){
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/" } // БЕЗ hash
    });
    setLoading(false);
    if(error){ console.error("[signUp]", error); throw error; }
  }
  async function signOut(){
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if(error){ console.error("[signOut]", error); throw error; }
  }
  async function resetPassword(email:string){
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/" // БЕЗ hash
    });
    if(error){ console.error("[resetPassword]", error); throw error; }
  }
  async function updatePassword(newPassword:string){
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if(error){ console.error("[updatePassword]", error); throw error; }
    setRecovery(false);
  }

  return (
    <AuthCtx.Provider value={{ session, loading, recovery, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = ()=> React.useContext(AuthCtx);
