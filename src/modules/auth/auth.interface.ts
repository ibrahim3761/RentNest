export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}


export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
};