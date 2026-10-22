import {
  HomeRounded,
  ExploreOutlined,
  AddBoxOutlined,
  PersonOutlineRounded,
  DarkModeRounded,
  LightModeRounded
} from "@mui/icons-material";

import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
const items = [
  { label: "Home", icon: HomeRounded, path: "/" },
  { label: "Explore", icon: ExploreOutlined, path: "/explore" },
  { label: "Create post", icon: AddBoxOutlined, action: "create" },
  { label: "Profile", icon: PersonOutlineRounded, action: "profile" },
];

export default function MobileNavigation({
  onCreatePost,
  mode,
  toggleTheme,
  user,
}) {
  const navigate = useNavigate();

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



  return (
    <Paper
      component="nav"
      elevation={0}
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        justifyContent: "space-around",
        alignItems: "center",
        px: 1,
        pt: 1,
        pb: "max(8px, env(safe-area-inset-bottom))",
        borderTop: 1,
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
    
        return (
          <Box key={item.label}>
            <IconButton
              aria-label={item.label}
              onClick={() => handleNavigation(item)}
              sx={{ p: 1.3 }}
            >
              <Icon />
            </IconButton>
          </Box>
        );
      })}
      <Tooltip
                title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
              >
                <IconButton onClick={toggleTheme} size="small">
                  {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
                </IconButton>
              </Tooltip>
    </Paper>
  );
}
