import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  age: "",
  gender: "",
  country: "Bangladesh",
  city: "Dhaka",
};

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };

      await register(payload);

      // Log in explicitly so registration works even if the
      // backend creates the account without setting auth cookies.
      await login({
        email: form.email,
        password: form.password,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please check your information.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background:
          "radial-gradient(circle at 15% 15%, rgba(109,74,255,.13), transparent 35%), radial-gradient(circle at 90% 85%, rgba(196,181,253,.18), transparent 30%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          p: { xs: 3, sm: 4 },
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          my: 2,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              letterSpacing="-1.5px"
              sx={{ mb: 1 }}
            >
              Socially<span style={{ color: "#8064FF" }}>.</span>
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              Join the community
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Create your account and start connecting.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
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
                  autoComplete="given-name"
                  required
                />

                <TextField
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              </Box>

              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                helperText="Choose a unique username."
                inputProps={{ minLength: 3, maxLength: 30 }}
                required
              />

              <TextField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                inputProps={{ minLength: 8 }}
                helperText="Use at least 8 characters."
                required
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  inputProps={{ min: 13, max: 120 }}
                  required
                />

                <TextField
                  select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">
                    Prefer not to say
                  </MenuItem>
                </TextField>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={submitting}
                sx={{ py: 1.4, mt: 1 }}
              >
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Box
              component={Link}
              to="/login"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in
            </Box>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
