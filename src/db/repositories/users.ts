import { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client.js';
import { InsertUser, UpdateUser, User } from '../../types/db.js';

function dbError(message: string, error?: PostgrestError): Error {
	const detail = error ? `: ${error.message}` : '';
	return new Error(`${message}${detail}`);
}

const TABLE = 'users';

export async function createUser(values: InsertUser): Promise<User> {
	const supabase = getSupabaseClient('service_role');
	// Ensure required timestamps are provided to satisfy NOT NULL constraints
	const nowIso = new Date().toISOString();
	const insertPayload = { 
		...values, 
		created_at: nowIso, 
		// keep updated_at null on creation; DB column allows null
		updated_at: null 
	} as unknown as User; // shape matches table columns
	const { data, error } = await supabase.from(TABLE).insert(insertPayload as any).select().single();
	if (error) throw dbError('Failed to create user', error);
	return data as User;
}

export async function getUserById(id: number): Promise<User | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
	if (error) throw dbError('Failed to fetch user', error);
	return (data as User) ?? null;
}

export async function listUsers(): Promise<User[]> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });
	if (error) throw dbError('Failed to list users', error);
	return (data as User[]) ?? [];
}

// Debug function to check all phone numbers
export async function debugPhoneNumbers(): Promise<void> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('id, phone_number').order('id', { ascending: true });
	if (error) {
		console.error('Debug phone numbers error:', error);
		return;
	}
	console.log('All phone numbers in database:', data);
}

export async function updateUser(id: number, values: UpdateUser): Promise<User> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select().single();
	if (error) throw dbError('Failed to update user', error);
	return data as User;
}

export async function deleteUser(id: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw dbError('Failed to delete user', error);
	return true;
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('email', email)
		.maybeSingle();
	if (error) throw dbError('Failed to fetch user by email', error);
	return (data as User) ?? null;
}

export async function createUserIfNotExists(values: InsertUser): Promise<User> {
	const existing = values.email ? await getUserByEmail(values.email) : null;
	if (existing) return existing;
	return await createUser(values);
}

// Authentication-related functions
export async function getUserByUsername(username: string): Promise<User | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('username', username).maybeSingle();
	if (error) throw dbError('Failed to fetch user by username', error);
	return (data as User) ?? null;
}

export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
	const supabase = getSupabaseClient('service_role');
	console.log('Searching for phone number:', phoneNumber);
	const { data, error } = await supabase.from(TABLE).select('*').eq('phone_number', phoneNumber).limit(1);
	if (error) {
		console.error('Database error for phone number lookup:', error);
		throw dbError('Failed to fetch user by phone number', error);
	}
	console.log('Phone number lookup result:', data);
	return (data && data.length > 0) ? (data[0] as User) : null;
}

export async function incrementFailedAttempts(id: number): Promise<User> {
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
	return data as User;
}

export async function resetFailedAttempts(id: number): Promise<User> {
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
	return data as User;
}

export async function updateLastLogin(id: number): Promise<User> {
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
	return data as User;
}

export async function lockAccount(id: number, lockedUntil: Date): Promise<User> {
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
	return data as User;
}

export async function unlockAccount(id: number): Promise<User> {
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
	return data as User;
}


