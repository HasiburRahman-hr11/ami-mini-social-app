import { Routes, Route } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";

import AppSidebar from "./components/AppSidebar";
import MobileNavigation from "./components/MobileNavigation";
import CreatePostDialog from "./components/CreatePostDialog";

import FeedPage from "./pages/FeedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";

import { useState } from "react";

function SocialLayout({ mode, toggleTheme }) {
  const { user, logout } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppSidebar
        mode={mode}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
        onCreatePost={() => setCreateOpen(true)}
      />

      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: "230px", lg: "255px" },
          pb: { xs: 10, md: 3 },
          px: { xs: 1.5, sm: 3, md: 4 },
          pt: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            maxWidth: 1150,
            mx: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 640, minWidth: 0 }}>
            <Routes>
              <Route
                path="/"
                element={<FeedPage onCreatePost={() => setCreateOpen(true)} />}
              />
              <Route path="/users/:username" element={<ProfilePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route
                path="*"
                element={
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight={700}>
                      Page not found
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      The page you requested doesn't exist.
                    </Typography>
                  </Box>
                }
              />
            </Routes>
          </Box>

          <Box
            sx={{
              display: { xs: "none", lg: "block" },
              width: 260,
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: "sticky", top: 32 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Your community
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Follow people and share moments with your community.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <MobileNavigation
        mode={mode}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
        onCreatePost={() => setCreateOpen(true)}
      />

      <CreatePostDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}

function AppRoutes({ mode, toggleTheme }) {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={<SocialLayout mode={mode} toggleTheme={toggleTheme} />}
        />
      </Route>
    </Routes>
  );
}

export default function App({ mode, toggleTheme }) {
  return (
    <AuthProvider>
      <AppRoutes mode={mode} toggleTheme={toggleTheme} />
    </AuthProvider>
  );
}
