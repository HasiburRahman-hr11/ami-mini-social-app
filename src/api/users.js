import api from "./axios";

export async function getUserProfile(username) {
  const response = await api.get(`/users/${encodeURIComponent(username)}`);
  return (
    response.data?.data?.user ?? response.data?.user ?? response.data?.data
  );
}

export async function updateMyProfile(profile) {
  const response = await api.patch("/users/me", profile);
  return (
    response.data?.data?.user ?? response.data?.user ?? response.data?.data
  );
}

export async function updateProfilePicture(file) {
  const formData = new FormData();

  formData.append("profilePicture", file);

  const response = await api.patch("/users/me/profile-picture", formData);

  return (
    response.data?.data?.user ?? response.data?.user ?? response.data?.data
  );
}
export async function followUser(userId) {
  const response = await api.put(`/users/${userId}/follow`);
  return response.data;
}

export async function unfollowUser(userId) {
  const response = await api.delete(`/users/${userId}/follow`);
  return response.data;
}

export async function getFollowers(userId, page = 1, limit = 20) {
  const response = await api.get(`/users/${userId}/followers`, {
    params: { page, limit },
  });
  return response.data?.data;
}

export async function getFollowing(userId, page = 1, limit = 20) {
  const response = await api.get(`/users/${userId}/following`, {
    params: { page, limit },
  });
  return response.data?.data;
}


export async function getSuggestedUsers(page = 1, limit = 20) {
  const response = await api.get("/users/suggestions", {
    params: { page, limit },
  });

  return response.data?.data?.users ?? [];
}