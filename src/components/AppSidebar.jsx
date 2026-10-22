import {
  HomeRounded,
  ExploreOutlined,
  AddBoxOutlined,
  PersonOutlineRounded,
  SettingsOutlined,
  DarkModeRounded,
  LightModeRounded,
  LogoutRounded,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";

const navigation = [
  { label: "Home", icon: HomeRounded, path: "/" },
  { label: "Explore", icon: ExploreOutlined, path: "/explore" },
  { label: "Create post", icon: AddBoxOutlined, action: "create" },
  { label: "Profile", icon: PersonOutlineRounded, action: "profile" },
];

export default function AppSidebar({
  mode,
  toggleTheme,
  onCreatePost,
  user,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item) => {
    if (item.action === "create") {
      onCreatePost?.();
      return;
    }

    if (item.action === "profile") {
      if (user?.username) {
        navigate(`/users/${encodeURIComponent(user.username)}`);
      }
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    if (item.action === "profile") {
      return (
        !!user?.username &&
        location.pathname ===
          `/users/${encodeURIComponent(user.username)}`
      );
    }

    if (item.path === "/") {
      return location.pathname === "/";
    }

    return item.path
      ? location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`)
      : false;
  };

  return (
    <Box
      component="aside"
      sx={{
        position: "fixed",
        inset: "0 auto 0 0",
        width: { md: 230, lg: 255 },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        px: 2.5,
        py: 3,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        zIndex: 10,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        letterSpacing="-1.8px"
        sx={{ px: 1.5, mb: 5, cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        social.
      </Typography>

      <Stack spacing={1}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Button
              key={item.label}
              fullWidth
              onClick={() => handleNavigation(item)}
              startIcon={<Icon />}
              sx={{
                justifyContent: "flex-start",
                gap: 1,
                px: 1.8,
                py: 1.5,
                color: "text.primary",
                fontWeight: active ? 750 : 500,
                bgcolor: active ? "action.selected" : "transparent",
                "& .MuiButton-startIcon": { mr: 1.2 },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        fullWidth
        startIcon={<SettingsOutlined />}
        onClick={() => navigate("/settings")}
        sx={{
          justifyContent: "flex-start",
          color: "text.primary",
          px: 1.8,
          py: 1.5,
        }}
      >
        Settings
      </Button>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1 }}>
        <Avatar
          src={user?.profilePicture || undefined}
          alt={user?.username || "Profile"}
          sx={{ width: 42, height: 42, cursor: "pointer" }}
          onClick={() => handleNavigation({ action: "profile" })}
        >
          {(user?.firstName || user?.username || "U")
            .charAt(0)
            .toUpperCase()}
        </Avatar>

        <Box
          sx={{ minWidth: 0, flex: 1, cursor: "pointer" }}
          onClick={() => handleNavigation({ action: "profile" })}
        >
          <Typography fontWeight={700} noWrap>
            {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
              user?.username ||
              "Your profile"}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            @{user?.username || "user"}
          </Typography>
        </Box>

        <Tooltip
          title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        >
          <IconButton onClick={toggleTheme} size="small">
            {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Button
        fullWidth
        startIcon={<LogoutRounded />}
        onClick={onLogout}
        color="inherit"
        sx={{ justifyContent: "flex-start", mt: 1 }}
      >
        Log out
      </Button>
    </Box>
  );
}