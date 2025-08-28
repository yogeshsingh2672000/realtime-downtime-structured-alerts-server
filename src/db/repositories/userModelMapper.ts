import { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client.js';
import { InsertUserModelMapper, UpdateUserModelMapper, UserModelMapper } from '../../types/db.js';

function dbError(message: string, error?: PostgrestError): Error {
	const detail = error ? `: ${error.message}` : '';
	return new Error(`${message}${detail}`);
}

const TABLE = 'user_model_mapper';

export async function createUserModelMap(values: InsertUserModelMapper): Promise<UserModelMapper> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).insert(values).select().single();
	if (error) throw dbError('Failed to create user_model_mapper', error);
	return data as UserModelMapper;
}

export async function getUserModelMapById(id: number): Promise<UserModelMapper | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
	if (error) throw dbError('Failed to fetch user_model_mapper', error);
	return (data as UserModelMapper) ?? null;
}

export async function listUserModelMaps(): Promise<UserModelMapper[]> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });
	if (error) throw dbError('Failed to list user_model_mapper', error);
	return (data as UserModelMapper[]) ?? [];
}

export async function updateUserModelMap(id: number, values: UpdateUserModelMapper): Promise<UserModelMapper> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select().single();
	if (error) throw dbError('Failed to update user_model_mapper', error);
	return data as UserModelMapper;
}

export async function deleteUserModelMap(id: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw dbError('Failed to delete user_model_mapper', error);
	return true;
}

export async function getUserModels(userId: number): Promise<number[] | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.select('model_id')
		.eq('user_id', userId)
		.maybeSingle();
	if (error) throw dbError('Failed to fetch user models', error);
	return (data?.model_id as number[] | null) ?? null;
}


