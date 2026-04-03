import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        
        if (me.account_id) {
          const accounts = await base44.entities.Account.filter({ id: me.account_id });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        }
      } catch (e) {
        console.error('Error loading user:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { user, account, loading };
}