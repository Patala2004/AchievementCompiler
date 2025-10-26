import { apiClient } from "./axiosClient";

export interface User {
  username: string;
  steam_id?: string;
  xbox_id?: string;
  psn_id?: string;
  retroachievements_id?: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/users/login/", {
    username,
    password,
  });
  return response.data;
}

export async function signUpUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.post<User>("/users/", {
    username,
    password,
  });
  if(response.status === 201){
    const response2 = await apiClient.post<LoginResponse>("/users/login/", {
      username,
      password,
    });
    return response2.data;
  }
  throw new Error(`${response.status}`);
}

export async function getAuthenticatedUser(): Promise<any> {
  const response = await apiClient.get("/users/auth/");
  return response.data;
}

export async function updateAuthenticatedUser(user : {
    username: "",
    steam_id: "",
    xbox_id: "",
    psn_id: "",
    retroachievements_id: "",
    id: ""
  }) : Promise<any> {
  const response = await apiClient.put<User>(`/users/${user.id}/`,{
      username : user.username,
      steam_id : user.steam_id,
      xbox_id : user.xbox_id,
      psn_id : user.psn_id,
      retroachievements_id : user.retroachievements_id
    });
    
    return response.data;
}

export async function getAllUsers(filter? : string) : Promise<any>{
  if(filter){
    const response = await apiClient.get(`/users/?filter=${filter}`);
    return response.data;
  } else{
    const response = await apiClient.get('/users/?');
    return response.data;
  }
}

export async function getUserById(id: string) : Promise<any>{
  const response = await apiClient.get(`/users/${id}/`);
  return response.data;
}

