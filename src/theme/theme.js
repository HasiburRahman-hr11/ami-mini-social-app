import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#C4B5FD" : "#6D4AFF",
      },
      background: {
        default: mode === "dark" ? "#101014" : "#FAFAFC",
        paper: mode === "dark" ? "#19191F" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#F5F5F7" : "#202027",
        secondary: mode === "dark" ? "#A4A4B0" : "#777783",
      },
      divider: mode === "dark" ? "#303039" : "#EBEBF0",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
