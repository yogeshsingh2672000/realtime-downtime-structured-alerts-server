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

export type InsertUser = Omit<User, 'id' | keyof DbTimestamps>;
export type UpdateUser = Partial<InsertUser>;

export type InsertModel = Omit<Model, 'id' | keyof DbTimestamps>;
export type UpdateModel = Partial<InsertModel>;

export type InsertUserModelMapper = Omit<UserModelMapper, 'id' | keyof DbTimestamps>;
export type UpdateUserModelMapper = Partial<InsertUserModelMapper>;


