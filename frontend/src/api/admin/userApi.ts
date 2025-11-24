import { privateApi } from "../axios";


export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'LANDLORD' | 'TENANT';
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  isDisabled: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LandlordOffense {
  id: string;
  listingId: string;
  type: string;
  severity: string;
  description: string | null;
  detectedBy: string | null;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    lifecycleStatus: string;
  } | null;
}

export interface UserDetails extends User {
  birthdate: string | null;
  gender: string | null;
  bio: string | null;
  messengerUrl: string | null;
  facebookUrl: string | null;
  lastPasswordChange: string | null;
  landlordOffenses: LandlordOffense[];
}

export interface GetAllUsersResponse {
  users: User[];
}

export interface GetUserDetailsResponse {
  user: UserDetails;
}

export const getAllUsersRequest = async (): Promise<GetAllUsersResponse> => {
  const response = await privateApi.get<GetAllUsersResponse>('/admin/users');
  return response.data;
};

export const getUserDetailsRequest = async (userId: string): Promise<GetUserDetailsResponse> => {
  const response = await privateApi.get<GetUserDetailsResponse>(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatusRequest = async (
  userId: string,
  action: 'block' | 'unblock'
) => {
  return privateApi.patch(`/admin/users/${userId}/status`, { action });
};

