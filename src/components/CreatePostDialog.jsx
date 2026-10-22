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

export default function CreatePostDialog({ open, onClose, onCreated }) {
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  // Create and clean up temporary preview URLs.
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [files]);

  const resetForm = () => {
    setCaption("");
    setFiles([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);

    if (selected.length > 10) {
      setError("You can upload a maximum of 10 files.");
      setFiles([]);
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    const invalid = selected.find((file) => !allowedTypes.includes(file.type));

    if (invalid) {
      setError("Choose JPEG, PNG, WebP, MP4, or WebM files.");
      setFiles([]);
      event.target.value = "";
      return;
    }

    const oversized = selected.find((file) => {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 100 : 10;
      return file.size > limit * 1024 * 1024;
    });

    if (oversized) {
      setError(
        "Images must be 10 MB or smaller; videos must be 100 MB or smaller.",
      );
      setFiles([]);
      event.target.value = "";
      return;
    }

    setFiles((previousFiles) => {
      // Avoid duplicate selections when adding more files.
      const combined = [...previousFiles, ...selected];
      const uniqueFiles = combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ) === index,
      );

      if (uniqueFiles.length > 10) {
        setError("You can upload a maximum of 10 files.");
        return previousFiles;
      }

      return uniqueFiles;
    });

    setError("");
    event.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((previousFiles) =>
      previousFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!caption.trim() && files.length === 0) {
      setError("Add a caption or choose at least one media file.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);

    files.forEach((file) => {
      formData.append("media", file);
    });

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/posts", formData, {
        headers: { "Content-Type": undefined },
      });

      const newPost = response.data.data?.post ?? response.data.data;

      // Refresh the feed and profile post grids.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
        queryClient.invalidateQueries({ queryKey: ["user-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);

      onCreated?.(newPost);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your post.");
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
          sx: { borderRadius: 2,  },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={750}>Create a post</DialogTitle>

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
              Choose photos or videos
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
              {files.length
                ? `${files.length} of 10 files selected`
                : "Up to 10 files. Images: 10 MB each; videos: 100 MB each."}
            </Typography>

            {/* Media previews */}
            {previews.length > 0 && (
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
                      onClick={() => handleRemoveFile(index)}
                      disabled={submitting}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "rgba(0, 0, 0, 0.65)",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.85)",
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
            {submitting ? "Publishing..." : "Publish"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
