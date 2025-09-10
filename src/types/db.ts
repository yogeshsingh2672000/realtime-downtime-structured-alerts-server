export interface DbTimestamps {
	created_at: string;
	updated_at: string | null;
}

export interface User extends DbTimestamps {
	id: number;
	first_name: string | null;
	last_name: string | null;
	email: string | null;
	phone_number: number | null;
	date_of_birth: string | null; // ISO date string
	admin: boolean | null;
}

export interface Model extends DbTimestamps {
	id: number;
	model_name: string | null;
	model_provider: string | null;
	description: string | null;
	version: string | null;
	updated_by: string | null;
}

export interface UserModelMapper extends DbTimestamps {
	id: number;
	user_id: number | null;
	model_id: number[] | null;
}

export interface Auth extends DbTimestamps {
	id: number;
	email: string;
	username: string | null;
	password_hash: string;
	phone_number: string;
	email_verified: boolean | null;
	phone_verified: boolean | null;
	failed_attempts: number | null;
	last_login_at: string | null;
	locked_until: string | null;
}

export interface Session extends DbTimestamps {
	id: number;
	user_id: number | null;
	refresh_token: string;
	user_agent: string | null;
	ip_address: string | null;
	expires_at: string | null;
}

export type InsertUser = Omit<User, 'id' | keyof DbTimestamps>;
export type UpdateUser = Partial<InsertUser>;

export type InsertModel = Omit<Model, 'id' | keyof DbTimestamps>;
export type UpdateModel = Partial<InsertModel>;

export type InsertUserModelMapper = Omit<UserModelMapper, 'id' | keyof DbTimestamps>;
export type UpdateUserModelMapper = Partial<InsertUserModelMapper>;

export type InsertAuth = Omit<Auth, 'id' | keyof DbTimestamps>;
export type UpdateAuth = Partial<InsertAuth>;

export type InsertSession = Omit<Session, 'id' | keyof DbTimestamps>;
export type UpdateSession = Partial<InsertSession>;


