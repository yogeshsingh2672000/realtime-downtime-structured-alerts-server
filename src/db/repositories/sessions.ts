import { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client.js';
import { Session, InsertSession, UpdateSession } from '../../types/db.js';

function dbError(message: string, error?: PostgrestError): Error {
	const detail = error ? `: ${error.message}` : '';
	return new Error(`${message}${detail}`);
}

const TABLE = 'sessions';

export async function createSession(values: InsertSession): Promise<Session> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).insert(values).select().single();
	if (error) throw dbError('Failed to create session', error);
	return data as Session;
}

export async function getSessionById(id: number): Promise<Session | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
	if (error) throw dbError('Failed to fetch session', error);
	return (data as Session) ?? null;
}

export async function getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('refresh_token', refreshToken).maybeSingle();
	if (error) throw dbError('Failed to fetch session by refresh token', error);
	return (data as Session) ?? null;
}

export async function getSessionsByUserId(userId: number): Promise<Session[]> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).order('created_at', { ascending: false });
	if (error) throw dbError('Failed to fetch sessions by user ID', error);
	return (data as Session[]) ?? [];
}

export async function updateSession(id: number, values: UpdateSession): Promise<Session> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select().single();
	if (error) throw dbError('Failed to update session', error);
	return data as Session;
}

export async function deleteSession(id: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw dbError('Failed to delete session', error);
	return true;
}

export async function deleteSessionByRefreshToken(refreshToken: string): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('refresh_token', refreshToken);
	if (error) throw dbError('Failed to delete session by refresh token', error);
	return true;
}

export async function deleteAllUserSessions(userId: number): Promise<boolean> {
	const supabase = getSupabaseClient('service_role');
	const { error } = await supabase.from(TABLE).delete().eq('user_id', userId);
	if (error) throw dbError('Failed to delete all user sessions', error);
	return true;
}

export async function deleteExpiredSessions(): Promise<number> {
	const supabase = getSupabaseClient('service_role');
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from(TABLE)
		.delete()
		.lt('expires_at', now)
		.select('id');
	if (error) throw dbError('Failed to delete expired sessions', error);
	return data?.length ?? 0;
}

export async function extendSession(id: number, newExpiresAt: Date): Promise<Session> {
	const supabase = getSupabaseClient('service_role');
	const { data, error } = await supabase
		.from(TABLE)
		.update({ 
			expires_at: newExpiresAt.toISOString(),
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();
	if (error) throw dbError('Failed to extend session', error);
	return data as Session;
}
