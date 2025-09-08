import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from '../utils/common.js';

type SupabaseRole = 'anon' | 'service_role';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getSupabaseClient(role: SupabaseRole = 'service_role'): SupabaseClient {
	const url = requireEnv('SUPABASE_URL');
	if (role === 'anon') {
		if (!anonClient) {
			const anonKey = requireEnv('SUPABASE_ANON_KEY');
			anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
		}
		return anonClient as SupabaseClient;
	}
	if (!serviceClient) {
		const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
		serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
	}
	return serviceClient as SupabaseClient;
}

export function resetSupabaseClients(): void {
	anonClient = null;
	serviceClient = null;
}


