import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import FollowButton from "./FollowButton";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography,
  Menu,
  MenuItem,
  DialogActions,
  DialogContent,
  Dialog,
  DialogTitle,
  Button,
} from "@mui/material";

import {
  FavoriteBorderRounded,
  FavoriteRounded,
  MoreHorizRounded,
  DeleteOutlineRounded,
  EditRounded,
} from "@mui/icons-material";

import api from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "";

  const elapsed = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}

export default function PostCard({ post, onPostUpdated }) {
  const [liked, setLiked] = useState(Boolean(post.likedByMe));
  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? post.likes?.length ?? 0,
  );
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  const author = post.author ?? {};
  const media = post.media ?? [];

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = String(user?._id ?? "");
  const authorId = String(author?._id ?? "");

  const isOwnPost = Boolean(currentUserId) && currentUserId === authorId;

  const followingIds = Array.isArray(user?.following) ? user.following : [];

  const isFollowingAuthor = followingIds.some(
    (id) => String(id?._id ?? id) === authorId,
  );

  const handleFollowChange = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["explore-users"] });
  };

  const ownProfile = user.username === author.username;

  const handleLike = async () => {
    if (liking) return;

    const previousLiked = liked;
    const previousCount = likesCount;
    const nextLiked = !previousLiked;

    // Update the UI immediately for a smooth interaction.
    setLiked(nextLiked);
    setLikesCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));
    setLiking(true);
    setLikeError("");

    try {
      const response = await api({
        method: nextLiked ? "put" : "delete",
        url: `/posts/${post._id}/like`,
      });

      const data = response.data.data;

      if (typeof data?.likedByMe === "boolean") {
        setLiked(data.likedByMe);
      }

      if (typeof data?.likesCount === "number") {
        setLikesCount(data.likesCount);
      }

      onPostUpdated?.(post._id, data?.post);
    } catch (error) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
      setLikeError(
        error.response?.data?.message || "Couldn't update your like.",
      );
    } finally {
      setLiking(false);
    }
  };

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleOpenMenu = (event, post) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleEditPost = () => {
    handleCloseMenu();

    // Open your edit-post dialog here.
    // Pass selectedPost to the dialog.
  };

  const handleDeletePost = () => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  };

  return (
    <Box
      component="article"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        pb: 3,
        mb: 3,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 0.5, pb: 1.5, justifyContent: "space-between" }}
      >
        <Box
          component={Link}
          to={`/users/${author.username}`}
          sx={{ display: "flex", gap: "20px", textDecoration: "none" }}
        >
          <Avatar
            src={author.profilePicture || undefined}
            alt={author.username || "User"}
            sx={{ width: 42, height: 42 }}
          >
            {author.username?.[0]?.toUpperCase() || "U"}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              fontWeight={700}
              variant="body2"
              noWrap
              color="text.secondary"
            >
              {author.username || "Unknown user"}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
        </Box>

        {ownProfile ? (
          <IconButton
            aria-label="More post options"
            size="small"
            onClick={(event) => handleOpenMenu(event, post)}
          >
            <MoreHorizRounded />
          </IconButton>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            {/* Keep your existing avatar and author information here */}

            {!isOwnPost && authorId && (
              <FollowButton
                key={`${authorId}-${isFollowingAuthor}`}
                userId={authorId}
                initialFollowing={isFollowingAuthor}
                onChange={handleFollowChange}
              />
            )}
          </Stack>
        )}
      </Stack>

      {post.caption && (
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", mb: 1.5 }}
        >
          {post.caption}
        </Typography>
      )}

      {media.length > 0 && (
        <Box
          sx={{
            overflow: "hidden",
            borderRadius: 1,
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
          }}
        >
          {media.map((item) =>
            item.resourceType === "video" ? (
              <Box
                key={item._id || item.publicId}
                component="video"
                src={item.url}
                controls
                playsInline
                preload="metadata"
                sx={{
                  width: "100%",
                  maxHeight: 600,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <Box
                key={item._id || item.publicId}
                component="img"
                src={item.url}
                alt={`Post by ${author.username || "user"}`}
                loading="lazy"
                sx={{
                  width: "100%",
                  maxHeight: 650,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ),
          )}
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
        <IconButton
          aria-label={liked ? "Unlike post" : "Like post"}
          onClick={handleLike}
          disabled={liking}
          sx={{
            color: liked ? "#ED4956" : "text.primary",
            "&:hover": {
              bgcolor: liked ? "rgba(237,73,86,0.08)" : "action.hover",
            },
          }}
        >
          {liked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
        </IconButton>

        <Typography variant="body2" fontWeight={650}>
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </Typography>
      </Stack>

      {likeError && (
        <Typography variant="caption" color="error">
          {likeError}
        </Typography>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEditPost}>
          <EditRounded fontSize="small" sx={{ mr: 1 }} />
          Edit post
        </MenuItem>

        <MenuItem onClick={handleDeletePost} sx={{ color: "error.main" }}>
          <DeleteOutlineRounded fontSize="small" sx={{ mr: 1 }} />
          Delete post
        </MenuItem>
      </Menu>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete post?</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>

          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              // Call your delete-post API here using selectedPost?._id.
              // Close the dialog and refresh the posts after success.
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
