export interface FetchUser {
  _id: string;
  credits: number;
}

export interface UserRegister {
  username: string;
  password: string;
  passwordConfirm: string;
}
