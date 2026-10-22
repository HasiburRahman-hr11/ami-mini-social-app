import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/FollowButton";

const TABS = {
  SUGGESTIONS: 0,
  FOLLOWING: 1,
  FOLLOWERS: 2,
};

async function fetchUsers(tab, userId) {
  let response;

  if (tab === TABS.SUGGESTIONS) {
    response = await api.get("/users/suggestions", {
      params: { page: 1, limit: 50 },
    });
  } else if (tab === TABS.FOLLOWING) {
    response = await api.get(`/users/${userId}/following`, {
      params: { page: 1, limit: 50 },
    });
  } else {
    response = await api.get(`/users/${userId}/followers`, {
      params: { page: 1, limit: 50 },
    });
  }

  return response.data?.data?.users ?? [];
}

function getUserId(id) {
  return String(id?._id ?? id ?? "");
}

function UserCard({ person, currentUser, tab, onFollowChange }) {
  const personId = getUserId(person._id);
  const currentUserId = getUserId(currentUser?._id);

  const isOwnAccount = personId === currentUserId;

  const currentFollowing = Array.isArray(currentUser?.following)
    ? currentUser.following
    : [];

  const initiallyFollowing =
    tab === TABS.FOLLOWING ||
    currentFollowing.some((id) => getUserId(id) === personId);

  const fullName = [person.firstName, person.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          "&:last-child": { pb: 2 },
          flexDirection:{xs: "column", sm: "row"},
          justifyContent:"space-between"
        }}
      >
        <Box
          component={Link}
          to={`/users/${person.username}`}
          sx={{ display: "flex", gap: "20px", textDecoration: "none" }}
        >
          <Avatar
            src={person.profilePicture || ""}
            alt={person.username}
            sx={{ width: 52, height: 52 }}
          >
            {person.username?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component={Link}
              to={`/users/${encodeURIComponent(person.username)}`}
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {fullName || person.username}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              @{person.username}
            </Typography>
          </Box>
        </Box>

        {!isOwnAccount && (
          <FollowButton
            key={`${personId}-${initiallyFollowing}`}
            userId={personId}
            initialFollowing={initiallyFollowing}
            onChange={onFollowChange}
            isFullWidthMob={true}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function ExplorePage() {
  const [tab, setTab] = useState(TABS.SUGGESTIONS);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = getUserId(user?._id);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["explore-users", tab, userId],
    queryFn: () => fetchUsers(tab, userId),
    enabled: Boolean(userId),
  });

  const handleFollowChange = () => {
    // Refresh the user lists and any related profile/feed data.
    queryClient.invalidateQueries({
      queryKey: ["explore-users"],
    });

    queryClient.invalidateQueries({
      queryKey: ["profile"],
    });

    queryClient.invalidateQueries({
      queryKey: ["feed"],
    });
  };

  const handleTabChange = (_event, newValue) => {
    setTab(newValue);
  };

  const tabTitle = ["Suggested for you", "People you follow", "Your followers"][
    tab
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 760,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Explore people
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 700,
            minHeight: 48,
          },
        }}
      >
        <Tab label="Suggestions" />
        <Tab label="Following" />
        <Tab label="Followers" />
      </Tabs>

      <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
        {tabTitle}
      </Typography>

      {isLoading && (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.message ||
            "Couldn't load users. Please try again."}
        </Alert>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <Box
          sx={{
            py: 6,
            px: 2,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            {tab === TABS.SUGGESTIONS
              ? "No suggestions right now"
              : tab === TABS.FOLLOWING
                ? "You're not following anyone yet"
                : "You don't have any followers yet"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {tab === TABS.SUGGESTIONS
              ? "Check back later to discover more people."
              : tab === TABS.FOLLOWING
                ? "Visit Suggestions to discover people."
                : "When people follow you, they'll appear here."}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <Stack spacing={1.5}>
          {users.map((person) => (
            <UserCard
              key={person._id}
              person={person}
              currentUser={user}
              tab={tab}
              onFollowChange={handleFollowChange}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
