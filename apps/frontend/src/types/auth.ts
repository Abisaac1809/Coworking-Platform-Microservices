export interface AuthResponse {
  access_token: string
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export interface CreateUserPayload {
  name: string
  email: string
  phone: string
  password: string
  role: string
}
