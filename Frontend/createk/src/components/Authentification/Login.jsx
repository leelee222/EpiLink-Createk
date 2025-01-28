import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  styled
} from "@mui/material";
import { FaGoogle } from "react-icons/fa";


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(7),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.95)",
  // background: "rgba(0, 0, 0, 0.95)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)"
  }
}));

const SocialButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: 8,
  fontFamily: "myFirstFont",
  transition: "transform 0.2s ease",
  "&:active": {
    transform: "scale(0.98)"
  }
}));

const LoginPage = () => {
  const [goToExplore, setGoToExplore] = useState("");

  if (goToExplore) {
    return <Navigate to="/" />;
  }
  const handleOAuthLogin = async (provider) => {
    if (!provider) {
      console.error("Provider is not defined");
      toast.error("An error occurred 🤯", { position: "top-right", autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8080/api/oauth2/${provider}/login`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const url = await response.text();
        const trimmedUrl = url.replace(/^"|"$/g, '');
        window.location.href = trimmedUrl; 
      } else {
        const errorData = await response.json();
        console.error("Error fetching OAuth2 URL:", errorData);
        toast.error("An error occurred 🤯", { position: "top-right", autoClose: 2000 });
      }
    } catch (error) {
      console.error("An error occurred", error);
      toast.error("An error occurred 🤯", { position: "top-right", autoClose: 2000 });
    }
  };

  return (
    <Container
      maxWidth="100vw"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        borderRadius: "0rem",
        fontFamily: "myFirstFont",
        color: "black",
        backgroundColor: "rgba(0, 0, 0, 0.95)"
      }}
    >
      <StyledPaper elevation={24}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main", fontFamily: "myFirstFont" }}
        >
          Login
        </Typography>

        <Box
          component="form"
          noValidate
          sx={{ mt: 3, fontFamily: "myFirstFont" }}
          role="form"
          aria-label="Sign up form"
        >

          <SocialButton
            variant="contained"
            startIcon={<FaGoogle />}
            sx={{ bgcolor: "#DB4437", "&:hover": { bgcolor: "#C53929" }, width: "100%" }}
            onClick={() => handleOAuthLogin('google')}
          >
            Login with Google
          </SocialButton>
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default LoginPage;
