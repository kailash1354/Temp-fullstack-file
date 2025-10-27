import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

const defaultTopProductsData = [
  {
    id: 1,
    name: "Classic Navy Blazer",
    sales: 45,
    price: 299.0,
    image: "/images/placeholder-thumb.jpg",
  },
  {
    id: 2,
    name: "Silk Evening Dress",
    sales: 32,
    price: 459.0,
    image: "/images/placeholder-thumb.jpg",
  },
  {
    id: 3,
    name: "Leather Oxford Shoes",
    sales: 28,
    price: 189.0,
    image: "/images/placeholder-thumb.jpg",
  },
];

const TopProductsList = ({ products = defaultTopProductsData }) => {
  return (
    <Paper
      sx={{
        bgcolor: "rgb(var(--card))",
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid rgb(var(--border))",
        boxShadow: "var(--shadow-lg)",
        height: "100%",
      }}
      className="admin-card"
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "600",
          color: "rgb(var(--text))",
          mb: 2,
          px: 1,
          fontSize: "1.1rem",
        }}
      >
        Top Products
      </Typography>
      <List disablePadding>
        {products.map((product) => (
          <ListItem
            key={product.id}
            disableGutters
            secondaryAction={
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "rgb(var(--accent))",
                  fontSize: "0.9rem",
                }}
              >
                ${product.price.toFixed(2)}
              </Typography>
            }
            sx={{
              py: 1.5,
              px: 1,
              "&:hover": { bgcolor: "rgba(var(--highlight), 0.7)" },
              borderRadius: "6px",
            }}
          >
            <ListItemAvatar sx={{ minWidth: 50 }}>
              <Avatar
                variant="rounded"
                src={product.image}
                alt={product.name}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "rgb(var(--highlight))",
                  border: "1px solid rgb(var(--border))",
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  component={Link}
                  to={`/admin/products/${product.id}`}
                  sx={{
                    fontWeight: 500,
                    color: "rgb(var(--text))",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    "&:hover": { color: "rgb(var(--accent))" },
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {product.name}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "rgb(var(--muted))",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {product.sales} sales this month
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TopProductsList;
