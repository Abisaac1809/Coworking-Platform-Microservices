export interface UserData {
  id: number
  name: string
  email: string
  phone: string
  role: string
  created_at?: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
  phone: string
  password?: string
}

export interface PhoneParts {
  code: string
  number: string
}
