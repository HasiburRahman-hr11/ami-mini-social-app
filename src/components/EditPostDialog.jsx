/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import api from "../api/axios";
import { useQueryClient } from "@tanstack/react-query";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
];

function getMediaKey(item, index) {
  return String(item._id ?? item.publicId ?? item.url ?? index);
}

export default function EditPostDialog({ open, onClose, post, onUpdated }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const existingMedia = post?.media ?? [];

  // Existing media that the user hasn't marked for removal.
  const visibleExistingMedia = existingMedia.filter(
    (item) => !removedMediaIds.includes(getMediaKey(item)),
  );

  // Create temporary URLs for newly selected files.
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const nextPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [newFiles]);

  // Initialize form values whenever a different post is opened.
  useEffect(() => {
    if (open && post) {
      setCaption(post.caption || "");
      setNewFiles([]);
      setRemovedMediaIds([]);
      setError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, post?._id]);

  const handleClose = () => {
    if (submitting) return;

    setNewFiles([]);
    setRemovedMediaIds([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);

    if (!selected.length) return;

    const invalid = selected.find((file) => !ALLOWED_TYPES.includes(file.type));

    if (invalid) {
      setError("Choose JPEG, PNG, WebP, MP4, or WebM files.");
      event.target.value = "";
      return;
    }

    const oversized = selected.find((file) => {
      const limit = file.type.startsWith("video/") ? 100 : 10;
      return file.size > limit * 1024 * 1024;
    });

    if (oversized) {
      setError(
        "Images must be 10 MB or smaller; videos must be 100 MB or smaller.",
      );
      event.target.value = "";
      return;
    }

    setNewFiles((previous) => {
      const combined = [...previous, ...selected];

      const unique = combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ) === index,
      );

      const totalMedia = visibleExistingMedia.length + unique.length;

      if (totalMedia > 10) {
        setError("A post can contain a maximum of 10 media files.");
        return previous;
      }

      setError("");
      return unique;
    });

    event.target.value = "";
  };

  const handleRemoveExisting = (item, index) => {
    const key = getMediaKey(item, index);

    if (!item._id) {
      setError(
        "This media item has no database ID, so it cannot be removed safely.",
      );
      return;
    }

    setRemovedMediaIds((previous) =>
      previous.includes(key) ? previous : [...previous, key],
    );
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setNewFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !caption.trim() &&
      visibleExistingMedia.length === 0 &&
      newFiles.length === 0
    ) {
      setError("Add a caption or keep at least one media file.");
      return;
    }

    if (visibleExistingMedia.length + newFiles.length > 10) {
      setError("A post can contain a maximum of 10 media files.");
      return;
    }

    if (!post?._id) {
      setError("Couldn't identify the post to update.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("caption", caption);

      newFiles.forEach((file) => {
        formData.append("media", file);
      });

      // Backend must support this field and remove those media items.
      formData.append("removeMediaIds", JSON.stringify(removedMediaIds));

      const response = await api.patch(`/posts/${post._id}`, formData, {
        headers: { "Content-Type": undefined },
      });

      const updatedPost = response.data?.data?.post ?? response.data?.data;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
        queryClient.invalidateQueries({ queryKey: ["user-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);

      onUpdated?.(post._id, updatedPost);

      setNewFiles([]);
      setRemovedMediaIds([]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update your post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={750}>Edit post</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Write a caption..."
              placeholder="Share a moment with your people"
              multiline
              minRows={4}
              maxRows={8}
              fullWidth
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              inputProps={{ maxLength: 2200 }}
            />

            <Button
              variant="outlined"
              component="label"
              sx={{ alignSelf: "flex-start" }}
            >
              Add photos or videos
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFiles}
              />
            </Button>

            <Typography variant="body2" color="text.secondary">
              {visibleExistingMedia.length + newFiles.length} of 10 media files
            </Typography>

            {/* Existing media */}
            {(existingMedia.length > 0 || previews.length > 0) && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {existingMedia.map((item, index) => {
                  const key = getMediaKey(item, index);
                  const removed = removedMediaIds.includes(key);

                  return (
                    <Box
                      key={key}
                      sx={{
                        position: "relative",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        opacity: removed ? 0.4 : 1,
                      }}
                    >
                      {item.resourceType === "video" ? (
                        <Box
                          component="video"
                          src={item.url}
                          controls={!removed}
                          preload="metadata"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={item.url}
                          alt="Existing post media"
                          sx={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <IconButton
                        aria-label={
                          removed ? "Undo media removal" : "Remove media"
                        }
                        size="small"
                        disabled={submitting}
                        onClick={() => {
                          if (removed) {
                            setRemovedMediaIds((previous) =>
                              previous.filter((id) => id !== key),
                            );
                          } else {
                            handleRemoveExisting(item, index);
                          }
                        }}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          bgcolor: "rgba(0, 0, 0, 0.7)",
                          color: "#fff",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.9)",
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>

                      {removed && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            right: 4,
                            color: "#fff",
                            bgcolor: "rgba(0,0,0,0.7)",
                            textAlign: "center",
                            borderRadius: 1,
                          }}
                        >
                          Will be removed
                        </Typography>
                      )}
                    </Box>
                  );
                })}

                {/* New media previews */}
                {previews.map((preview, index) => (
                  <Box
                    key={`${preview.file.name}-${preview.file.size}-${preview.file.lastModified}`}
                    sx={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    {preview.isVideo ? (
                      <Box
                        component="video"
                        src={preview.url}
                        controls
                        preload="metadata"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={preview.url}
                        alt={preview.file.name}
                        sx={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    <IconButton
                      aria-label={`Remove ${preview.file.name}`}
                      size="small"
                      disabled={submitting}
                      onClick={() => handleRemoveNewFile(index)}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.9)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={submitting} color="inherit">
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
