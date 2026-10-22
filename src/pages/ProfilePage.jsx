import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import EditRounded from "@mui/icons-material/EditRounded";

import api from "../api/axios";
import { getUserProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/FollowButton";
import EditProfileDialog from "../components/EditProfileDialog";
import PostCard from "../components/PostCard";
import { LogoutRounded } from "@mui/icons-material";

export default function ProfilePage() {
  const { username } = useParams();
  const { user, getCurrentUser, logout } = useAuth();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);

  // Fetch profile
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserProfile(username),
    enabled: Boolean(username),
  });

  const isOwnProfile =
    Boolean(user?._id) &&
    Boolean(profile?._id) &&
    String(user._id) === String(profile._id);

  // Fetch posts belonging to this profile
  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: ["user-posts", profile?._id],
    queryFn: async () => {
      const response = await api.get("/posts", {
        params: {
          authorId: profile._id,
          page: 1,
          limit: 50,
        },
      });

      return response.data?.posts ?? [];
    },
    enabled: Boolean(profile?._id),
  });

  const refreshProfileData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["profile", username],
      }),
      queryClient.invalidateQueries({
        queryKey: ["user-posts", profile?._id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      }),
    ]);
  };

  const handleProfileUpdated = async () => {
    await getCurrentUser();
    await refreshProfileData();
    setEditOpen(false);
  };

  if (profileLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profileError || !profile) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6">Profile not found</Typography>
      </Box>
    );
  }

  const followersCount =
    profile.followersCount ?? profile.followers?.length ?? 0;

  const followingCount =
    profile.followingCount ?? profile.following?.length ?? 0;

  const postCount = profile.postsCount ?? posts.length;

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.username;

  const isFollowing = (profile.followers ?? []).some(
    (follower) => String(follower?._id ?? follower) === String(user?._id),
  );

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 680, mx: "auto", pb: 5 }}>
      {/* Profile header */}
      <Stack
        direction="row"
        spacing={{ xs: 2, sm: 4 }}
        alignItems="center"
        sx={{ px: { xs: 1, sm: 2 }, py: 3 }}
      >
        <Avatar
          src={profile.profilePicture || undefined}
          alt={profile.username}
          sx={{
            width: { xs: 76, sm: 110 },
            height: { xs: 76, sm: 110 },
            fontSize: 32,
          }}
        >
          {(profile.username || "U").charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} noWrap>
            {profile.username}
          </Typography>

          <Stack direction="row" spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 2, mt:1 }}>
            <Typography variant="body2">
              <strong>{postCount}</strong> posts
            </Typography>

            <Typography variant="body2">
              <strong>{followersCount}</strong> followers
            </Typography>

            <Typography variant="body2">
              <strong>{followingCount}</strong> following
            </Typography>
          </Stack>

          {isOwnProfile ? (
            <>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<EditRounded />}
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </Button>

              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<LogoutRounded />}
                onClick={handleLogout}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  marginTop: "10px",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <FollowButton
              key={`${profile._id}-${isFollowing}`}
              userId={profile._id}
              initialFollowing={isFollowing}
              onChange={() => refreshProfileData()}
            />
          )}
        </Box>
      </Stack>

      {/* Bio */}
      <Box sx={{ px: 2, pb: 3 }}>
        <Typography fontWeight={700}>{displayName}</Typography>

        {profile.bio && (
          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
            {profile.bio}
          </Typography>
        )}

        {(profile.city || profile.country) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {[profile.city, profile.country].filter(Boolean).join(", ")}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Posts */}
      <Box sx={{ pt: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, mb: 2 }}>
          Posts
        </Typography>

        {postsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : postsError ? (
          <Typography color="error" textAlign="center" sx={{ py: 4, px: 2 }}>
            Could not load posts. Please try again.
          </Typography>
        ) : posts.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 5 }}>
            No posts yet.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={refreshProfileData}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Edit profile dialog */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onUpdated={handleProfileUpdated}
      />
    </Box>
  );
}
