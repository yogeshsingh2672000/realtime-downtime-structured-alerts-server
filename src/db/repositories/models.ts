import { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client.js';
import { InsertModel, Model, UpdateModel } from '../../types/db.js';

function dbError(message: string, error?: PostgrestError): Error {
	const detail = error ? `: ${error.message}` : '';
	return new Error(`${message}${detail}`);
}

const TABLE = 'models';

export async function createModel(values: InsertModel): Promise<Model> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).insert(values).select().single();
	if (error) throw dbError('Failed to create model', error);
	return data as Model;
}

export async function getModelById(id: number): Promise<Model | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
	if (error) throw dbError('Failed to fetch model', error);
	return (data as Model) ?? null;
}

export async function listModels(): Promise<Model[]> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });
	if (error) throw dbError('Failed to list models', error);
	return (data as Model[]) ?? [];
}

export async function updateModel(id: number, values: UpdateModel): Promise<Model> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select().single();
	if (error) throw dbError('Failed to update model', error);
	return data as Model;
}

export async function deleteModel(id: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw dbError('Failed to delete model', error);
	return true;
}


