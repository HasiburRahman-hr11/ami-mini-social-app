import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  LockOutlined,
  MailOutlineRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
      await login(form);
      navigate(location.state?.from?.pathname || "/", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your details and try again.",
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
          maxWidth: 430,
          p: { xs: 3, sm: 4 },
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
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
              Welcome back
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Sign in to catch up with your community.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <TextField
                fullWidth
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((current) => !current)}
                          edge="end"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={submitting}
                endIcon={<ArrowForwardRounded />}
                sx={{ py: 1.4, mt: 0.5 }}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Box
              component={Link}
              to="/register"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create account
            </Box>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
