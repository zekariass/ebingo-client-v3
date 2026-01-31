// 'use client';

// import { useQuery, UseQueryResult } from '@tanstack/react-query';
// import { useSession } from './use-session';
// import { ApiResponse, UserProfile } from '@/lib/types';
// import i18n from '@/i18n';



// async function fetchUserProfile(accessToken: string): Promise<UserProfile | undefined> {
//   const res = await fetch(`${i18n.language}/api/auth/me`, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   });

//   if (!res.ok) throw new Error('Failed to fetch profile');

//   const data: ApiResponse<UserProfile> = await res.json();
  
//   if (!data.success) throw new Error(data.error || 'Failed to fetch profile');


//   return data.data; // may be undefined
// }


// export function useUserProfile(): UseQueryResult<UserProfile | undefined, Error> {
//   const { user, session, loading } = useSession();

//   return useQuery<UserProfile | undefined, Error>({
//     queryKey: ['userProfile', user?.id],
//     queryFn: async (): Promise<UserProfile | undefined> => {
//       // ensure fetchUserProfile returns UserProfile
//       return await fetchUserProfile(session!.access_token);
//     },
//     enabled: !!user && !loading,
//     refetchOnWindowFocus: true,
//     staleTime: 0,
//   });
// }


