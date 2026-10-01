/**
 * ElevateVoice — Supabase Client Authentication Helper
 */
(function () {
  const SUPABASE_URL =
    (typeof window !== 'undefined' && window.__ENV && window.__ENV.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    '';
  const SUPABASE_ANON_KEY =
    (typeof window !== 'undefined' && window.__ENV && window.__ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    '';

  let client = null;

  function getClient() {
    if (client) return client;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return client;
    }
    console.error('[ElevateAuth] Supabase JS CDN is not loaded.');
    return null;
  }

  const ElevateAuth = {
    getClient,

    async getSession() {
      const c = getClient();
      if (!c) return null;
      const { data } = await c.auth.getSession();
      return data?.session || null;
    },

    async getUser() {
      const session = await this.getSession();
      return session?.user || null;
    },

    async isAuthenticated() {
      const session = await this.getSession();
      return Boolean(session && session.access_token);
    },

    async getAccessToken() {
      const session = await this.getSession();
      return session?.access_token || null;
    },

    async signIn(email, password) {
      const c = getClient();
      if (!c) throw new Error('Supabase client unavailable');
      const { data, error } = await c.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    async signUp(email, password) {
      const c = getClient();
      if (!c) throw new Error('Supabase client unavailable');
      const { data, error } = await c.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      const c = getClient();
      if (!c) return;
      const { error } = await c.auth.signOut();
      if (error) throw error;
      window.location.reload();
    },

    onAuthStateChange(callback) {
      const c = getClient();
      if (!c) return;
      return c.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },
  };

  window.ElevateAuth = ElevateAuth;
})();
