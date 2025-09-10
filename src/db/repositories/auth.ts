import { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client.js';
import { Auth, InsertAuth, UpdateAuth } from '../../types/db.js';

function dbError(message: string, error?: PostgrestError): Error {
	const detail = error ? `: ${error.message}` : '';
	return new Error(`${message}${detail}`);
}

const TABLE = 'auth';

export async function createAuth(values: InsertAuth): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	// Ensure required timestamps are provided to satisfy NOT NULL constraints
	const nowIso = new Date().toISOString();
	const insertPayload = { 
		...values, 
		created_at: nowIso, 
		// keep updated_at null on creation; DB column allows null
		updated_at: null 
	} as unknown as Auth; // shape matches table columns
	const { data, error } = await supabase.from(TABLE).insert(insertPayload as any).select().single();
	if (error) throw dbError('Failed to create auth record', error);
	return data as Auth;
}

export async function getAuthById(id: number): Promise<Auth | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
	if (error) throw dbError('Failed to fetch auth record', error);
	return (data as Auth) ?? null;
}

export async function getAuthByEmail(email: string): Promise<Auth | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('email', email).maybeSingle();
	if (error) throw dbError('Failed to fetch auth record by email', error);
	return (data as Auth) ?? null;
}

export async function getAuthByUsername(username: string): Promise<Auth | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('username', username).maybeSingle();
	if (error) throw dbError('Failed to fetch auth record by username', error);
	return (data as Auth) ?? null;
}

export async function getAuthByPhoneNumber(phoneNumber: string): Promise<Auth | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('phone_number', phoneNumber).maybeSingle();
	if (error) throw dbError('Failed to fetch auth record by phone number', error);
	return (data as Auth) ?? null;
}

export async function updateAuth(id: number, values: UpdateAuth): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select().single();
	if (error) throw dbError('Failed to update auth record', error);
	return data as Auth;
}

export async function deleteAuth(id: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw dbError('Failed to delete auth record', error);
	return true;
}

export async function incrementFailedAttempts(id: number): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	
	// First get the current failed_attempts value
	const { data: currentData, error: fetchError } = await supabase
		.from(TABLE)
		.select('failed_attempts')
		.eq('id', id)
		.single();
	
	if (fetchError) throw dbError('Failed to fetch current failed attempts', fetchError);
	
	const currentAttempts = currentData?.failed_attempts || 0;
	
	// Update with incremented value
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			failed_attempts: currentAttempts + 1,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to increment failed attempts', error);
	return data as Auth;
}

export async function resetFailedAttempts(id: number): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			failed_attempts: 0,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to reset failed attempts', error);
	return data as Auth;
}

export async function updateLastLogin(id: number): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			last_login_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to update last login', error);
	return data as Auth;
}

export async function lockAccount(id: number, lockedUntil: Date): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			locked_until: lockedUntil.toISOString(),
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to lock account', error);
	return data as Auth;
}

export async function unlockAccount(id: number): Promise<Auth> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			locked_until: null,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to unlock account', error);
	return data as Auth;
}
