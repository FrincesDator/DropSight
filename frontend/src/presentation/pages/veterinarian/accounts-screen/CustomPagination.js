import React from "react";
import { Box, Button, Select, MenuItem, Typography } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useMediaQuery, useTheme } from "@mui/material";

const CustomPagination = ({
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const totalPages = Math.ceil(count / rowsPerPage);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check for small screen

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      onPageChange(null, page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      onPageChange(null, page - 1);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 2,
        fontSize: isMobile ? "12px" : "1rem",
        transform: isMobile ? "scale(0.8)" : "scale(1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ marginRight: isMobile ? 1 : 1 }}>
          Rows per page
        </Typography>
        <Select
          value={rowsPerPage}
          onChange={onRowsPerPageChange}
          sx={{
            fontSize: isMobile ? "12px" : "1rem",
            marginBottom: isMobile ? 1 : 0,
          }}
        >
          <MenuItem
            value={5}
            sx={{
              transform: isMobile ? "scale(0.8)" : "scale(1)",
            }}
          >
            5
          </MenuItem>
          <MenuItem
            value={10}
            sx={{
              transform: isMobile ? "scale(0.8)" : "scale(1)",
            }}
          >
            10
          </MenuItem>
          <MenuItem
            value={20}
            sx={{
              transform: isMobile ? "scale(0.8)" : "scale(1)",
            }}
          >
            20
          </MenuItem>
        </Select>
        <Typography variant="body2">
          Page {page + 1} of {totalPages}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2, // Add gap between buttons
        }}
      >
        <Button onClick={handlePreviousPage} disabled={page === 0}>
          <ChevronLeft sx={{ color: page === 0 ? "lightgray" : "darkgray" }} />
        </Button>
        <Button onClick={handleNextPage} disabled={page >= totalPages - 1}>
          <ChevronRight
            sx={{ color: page >= totalPages - 1 ? "lightgray" : "darkgray" }}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default CustomPagination;
