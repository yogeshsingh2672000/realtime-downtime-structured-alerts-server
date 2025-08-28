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
	const { data, error } = await supabase.from(TABLE).insert(values).select().single();
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


