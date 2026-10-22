/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile, updateProfilePicture } from "../api/users";
import { useAuth } from "../context/AuthContext";

export default function EditProfileDialog({ open, onClose, user }) {
  const queryClient = useQueryClient();
  const { getCurrentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // When saving:

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    city: "",
    country: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      city: user?.city || "",
      country: user?.country || "",
    });
    setFile(null);
    setError("");
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const updated = await updateMyProfile(form);

      if (profilePicture) {
        await updateProfilePicture(profilePicture);
      }

      await getCurrentUser();
      return updated;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onClose();
    },

    onError: (err) => {
      setError(
        err.response?.data?.message ||
          "Couldn't update your profile. Please try again.",
      );
    },
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle fontWeight={800}>Edit profile</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={previewUrl ? previewUrl : user?.profilePicture || ""}
              sx={{ width: 68, height: 68 }}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Button component="label" variant="outlined">
              Change photo
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <TextField
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </Box>

          <TextField
            label="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
            helperText={`${form.bio.length}/500`}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <TextField
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button color="inherit" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
