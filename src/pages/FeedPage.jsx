
import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { AddRounded, RefreshRounded } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";
import PostCard from "../components/PostCard";

export default function FeedPage({ onCreatePost }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const feedQuery = useQuery({
    queryKey: ["feed", page],
    queryFn: async () => {
      const response = await api.get("/posts/feed", {
        params: { page, limit: 10 },
      });

      return response.data;
    },
  });

  const updatePost = (postId, updatedPost) => {
    if (!updatedPost) return;

    queryClient.setQueryData(["feed", page], (oldData) => {
      if (!oldData?.data?.posts) return oldData;

      return {
        ...oldData,
        data: {
          ...oldData.data,
          posts: oldData.data.posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  ...updatedPost,
                  likesCount: updatedPost.likes?.length ?? post.likesCount,
                  likedByMe: post.likedByMe,
                }
              : post
          ),
        },
      };
    });
  };

  if (feedQuery.isPending) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (feedQuery.isError) {
    const status = feedQuery.error.response?.status;

    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            startIcon={<RefreshRounded />}
            onClick={() => feedQuery.refetch()}
          >
            Retry
          </Button>
        }
      >
        {status === 401
          ? "Please log in to view your feed."
          : feedQuery.error.response?.data?.message ||
            "Couldn't load the feed. Check your connection and try again."}
      </Alert>
    );
  }

  const result = feedQuery.data?.data;
  const posts = result?.posts ?? [];
  const pagination = result?.pagination;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3, justifyContent:"space-between" }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.8px">
            Your feed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Moments from your community
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={onCreatePost}
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
        >
          Create
        </Button>
      </Stack>

      {posts.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            border: 1,
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              mb: 2,
              width: 56,
              height: 56,
              bgcolor: "action.selected",
              color: "text.primary",
            }}
          >
            <AddRounded />
          </Avatar>

          <Typography variant="h6" fontWeight={750}>
            Your feed is waiting
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Follow people or create a post to get started.
          </Typography>

          <Button variant="contained" onClick={onCreatePost}>
            Create your first post
          </Button>
        </Box>
      ) : (
        <Box>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={updatePost}
            />
          ))}

          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="outlined"
              disabled={page <= 1}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Previous
            </Button>

            <Button
              variant="outlined"
              disabled={!pagination?.hasNextPage}
              onClick={() => {
                setPage((current) => current + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
