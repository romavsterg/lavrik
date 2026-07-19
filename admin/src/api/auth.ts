import { fetch } from "./base"

export const login = async (username: string, password: string) => 
  fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });


export const logout = async () => 
  fetch('/auth/logout', {
    method: 'POST',
  });


export const me = async () => 
  fetch('/auth/me', {
    method: 'GET',
  });