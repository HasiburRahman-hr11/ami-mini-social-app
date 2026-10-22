import api from "./axios";

export async function updatePost(postId, data) {
  const response = await api.patch(`/posts/${postId}`, data);

  return response.data?.data?.post ?? response.data?.data;
}

export async function deletePost(postId) {
  const response = await api.delete(`/posts/${postId}`);

  return response.data;
}
