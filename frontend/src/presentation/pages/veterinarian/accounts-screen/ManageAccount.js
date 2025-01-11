import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { db } from "../../../../core/firebase/firebase-config";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../../../../core/style/admin.css";
import CustomPagination from "./CustomPagination";
import { VetAppearanceContext } from "../settings/AppearanceContext";
import { useMediaQuery, useTheme } from "@mui/material";

const ManageAccount = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortOption, setSortOption] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    address: "",
    farmName: "",
    chickenHouseType: "",
    numHouse: "",
    capacity: "",
    contactNum: "",
    cNum: "",
    validDate: "",
  });

  const [openAddUser, setOpenAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    userType: "Farm Owner",
    Password: "",
    UserID: "",
    address: "",
    chickenHouseType: "",
    numHouse: "",
    capacity: "",
    contactNum: "",
    cNum: "",
    email: "",
    fName: "",
    farmName: "",
    lName: "",
    lNum: "",
    validDate: "",
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const farmOwnersCollection = collection(db, "farmOwnerAccount");
        const veterinariansCollection = collection(db, "veterinarianAccount");

        const [farmOwnersDocs, veterinariansDocs] = await Promise.all([
          getDocs(farmOwnersCollection),
          getDocs(veterinariansCollection),
        ]);

        const fetchedUsers = [
          ...farmOwnersDocs.docs.map((doc) => ({
            userType: "Farm Owner",
            Password: doc.data().Password,
            UserID: doc.data().UserID,
            address: doc.data().address,
            chickenHouseType: doc.data().chickenHouseType,
            numHouse: doc.data().numHouse,
            capacity: doc.data().capacity,
            contactNum: doc.data().contactNum,
            email: doc.data().email,
            fName: doc.data().fName,
            farmName: doc.data().farmName,
            lName: doc.data().lName,
          })),
          ...veterinariansDocs.docs.map((doc) => ({
            userType: "Veterinarian",
            Password: doc.data().Password,
            UserID: doc.data().UserID,
            cNum: doc.data().cNum,
            email: doc.data().email,
            fName: doc.data().fName,
            lName: doc.data().lName,
            lNum: doc.data().lNum,
            validDate: doc.data().validDate,
          })),
        ];

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let updatedFilteredUsers = [...users];

    switch (sortOption) {
      case "all":
        updatedFilteredUsers = [...users];
        break;
      case "farmOwners":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Farm Owner"
        );
        break;
      case "veterinarians":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Veterinarian"
        );
        break;
      case "farmNameAsc":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Farm Owner"
        );
        updatedFilteredUsers.sort((a, b) =>
          a.farmName.localeCompare(b.farmName)
        );
        break;
      case "farmNameDesc":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Farm Owner"
        );
        updatedFilteredUsers.sort((a, b) =>
          b.farmName.localeCompare(a.farmName)
        );
        break;
      case "licenseAsc":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Veterinarian"
        );
        updatedFilteredUsers.sort((a, b) =>
          a.lNum === "N/A"
            ? -1
            : b.lNum === "N/A"
            ? 1
            : a.lNum.localeCompare(b.lNum)
        );
        break;
      case "licenseDesc":
        updatedFilteredUsers = updatedFilteredUsers.filter(
          (user) => user.userType === "Veterinarian"
        );
        updatedFilteredUsers.sort((a, b) =>
          b.lNum === "N/A"
            ? -1
            : a.lNum === "N/A"
            ? 1
            : b.lNum.localeCompare(a.lNum)
        );
        break;
      default:
        break;
    }

    setFilteredUsers(updatedFilteredUsers);
  }, [sortOption, users]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    const filtered = users.filter(
      (user) =>
        (user.fName &&
          user.fName.toLowerCase().includes(value.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      if (userToDelete.userType === "Farm Owner") {
        const querySnapshot = await getDocs(collection(db, "farmOwnerAccount"));
        const docToDelete = querySnapshot.docs.find(
          (doc) => doc.data().UserID === userToDelete.UserID
        );
        if (docToDelete) {
          await deleteDoc(doc(db, "farmOwnerAccount", docToDelete.id));
        }
      } else if (userToDelete.userType === "Veterinarian") {
        const querySnapshot = await getDocs(
          collection(db, "veterinarianAccount")
        );
        const docToDelete = querySnapshot.docs.find(
          (doc) => doc.data().UserID === userToDelete.UserID
        );
        if (docToDelete) {
          await deleteDoc(doc(db, "veterinarianAccount", docToDelete.id));
        }
      }

      const updatedUsers = users.filter(
        (user) => user.UserID !== userToDelete.UserID
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    if (user.userType === "Farm Owner") {
      setFormData({
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        address: user.address,
        farmName: user.farmName,
        chickenHouseType: user.chickenHouseType,
        numHouse: user.numHouse,
        capacity: user.capacity,
        contactNum: user.contactNum,
      });
    } else if (user.userType === "Veterinarian") {
      setFormData({
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        cNum: user.cNum,
        validDate: user.validDate,
      });
    }
    setOpenEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUserData = {
        fName: formData.fName,
        lName: formData.lName,
        email: formData.email,
        ...(currentUser.userType === "Farm Owner" && {
          address: formData.address,
          farmName: formData.farmName,
          chickenHouseType: formData.chickenHouseType,
          numHouse: formData.numHouse,
          capacity: formData.capacity,
          contactNum: formData.contactNum,
        }),
        ...(currentUser.userType === "Veterinarian" && {
          cNum: formData.cNum,
          validDate: formData.validDate,
        }),
      };

      if (currentUser.userType === "Farm Owner") {
        const querySnapshot = await getDocs(collection(db, "farmOwnerAccount"));
        const docToUpdate = querySnapshot.docs.find(
          (doc) => doc.data().UserID === currentUser.UserID
        );
        if (docToUpdate) {
          await updateDoc(
            doc(db, "farmOwnerAccount", docToUpdate.id),
            updatedUserData
          );
        }
      } else if (currentUser.userType === "Veterinarian") {
        const querySnapshot = await getDocs(
          collection(db, "veterinarianAccount")
        );
        const docToUpdate = querySnapshot.docs.find(
          (doc) => doc.data().UserID === currentUser.UserID
        );
        if (docToUpdate) {
          await updateDoc(
            doc(db, "veterinarianAccount", docToUpdate.id),
            updatedUserData
          );
        }
      }

      const updatedUsers = users.map((user) =>
        user.UserID === currentUser.UserID
          ? { ...user, ...updatedUserData }
          : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      setOpenEditModal(false);
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortOption = (option) => {
    setSortOption(option);
    setAnchorEl(null);
  };

  const { primaryColor } = useContext(VetAppearanceContext);
  const textColor =
    primaryColor === "#2D4746" || primaryColor === "#EF6068"
      ? "white"
      : "black";

  const generateUserId = (userType) => {
    let lastId;
    if (userType === "Farm Owner") {
      const farmOwnerIds = users
        .filter((user) => user.userType === "Farm Owner" && user.UserID)
        .map((user) => parseInt(user.UserID.slice(1), 10));
      lastId = farmOwnerIds.length > 0 ? Math.max(...farmOwnerIds) : 0;
      return `F${(lastId + 1).toString().padStart(3, "0")}`;
    } else if (userType === "Veterinarian") {
      const veterinarianIds = users
        .filter((user) => user.userType === "Veterinarian" && user.UserID)
        .map((user) => parseInt(user.UserID.slice(1), 10));
      lastId = veterinarianIds.length > 0 ? Math.max(...veterinarianIds) : 0;
      return `V${(lastId + 1).toString().padStart(3, "0")}`;
    }
    return null;
  };

  const handleOpenAddUser = () => {
    setOpenAddUser(true);
  };

  const handleCloseAddUser = () => {
    setOpenAddUser(false);
    setNewUser({
      userType: "Farm Owner",
      Password: "",
      UserID: "",
      address: "",
      chickenHouseType: "",
      numHouse: "",
      capacity: "",
      contactNum: "",
      cNum: "",
      district: "",
      email: "",
      fName: "",
      farmName: "",
      lName: "",
      lNum: "",
      validDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    const UserID = generateUserId(newUser.userType);

    const userData = {
      UserID,
      Password: UserID,
      userType: newUser.userType,
      address:
        newUser.userType === "Farm Owner"
          ? newUser.address || undefined
          : undefined,
      chickenHouseType:
        newUser.userType === "Farm Owner"
          ? newUser.chickenHouseType || undefined
          : undefined,
      numHouse:
        newUser.userType === "Farm Owner"
          ? newUser.numHouse || undefined
          : undefined,
      capacity:
        newUser.userType === "Farm Owner"
          ? newUser.capacity || undefined
          : undefined,
      contactNum: newUser.contactNum || undefined,
      cNum:
        newUser.userType === "Veterinarian"
          ? newUser.cNum || undefined
          : undefined,
      email: newUser.email || undefined,
      fName: newUser.fName || undefined,
      farmName:
        newUser.userType === "Farm Owner"
          ? newUser.farmName || undefined
          : undefined,
      lName: newUser.lName || undefined,
      lNum:
        newUser.userType === "Veterinarian"
          ? newUser.lNum || undefined
          : undefined,
      validDate:
        newUser.validDate === "Veterinarian"
          ? newUser.district || undefined
          : undefined,
      createdAt: serverTimestamp(),
    };

    const cleanedUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, v]) => v !== undefined)
    );

    try {
      if (newUser.userType === "Farm Owner") {
        await addDoc(collection(db, "farmOwnerAccount"), cleanedUserData);
      } else if (newUser.userType === "Veterinarian") {
        await addDoc(collection(db, "veterinarianAccount"), cleanedUserData);
      }
      handleCloseAddUser();
      const updatedUsers = [...users, cleanedUserData];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check for small screen

  return (
    <div className="admin-container">
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            justifyContent: "center",
            flexDirection: isMobile ? "row" : "row",
          }}
        >
          <IconButton
            onClick={handleSortClick}
            sx={{ mr: 2, transform: isMobile ? "scale(0.8)" : "scale(1)" }}
          >
            <FilterListIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            sx={{
              transformOrigin: isMobile ? "top right" : "top left", 
              fontSize: isMobile ? "0.8rem" : "1rem", 
              "& .MuiMenuItem-root": {
                fontSize: isMobile ? "0.8rem" : "1rem", 
              },
            }}
          >
            <MenuItem onClick={() => handleSortOption("all")}>
              All Users
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("farmOwners")}>
              Farm Owners
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("veterinarians")}>
              Veterinarians
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("farmNameAsc")}>
              Farm Name Ascending
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("farmNameDesc")}>
              Farm Name Descending
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("licenseAsc")}>
              License Number Ascending
            </MenuItem>
            <MenuItem onClick={() => handleSortOption("licenseDesc")}>
              License Number Descending
            </MenuItem>
          </Menu>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 2,
              flexDirection: isMobile ? "row" : "row",
              fontSize: isMobile ? "12px" : "1rem",
            }}
          >
            <TextField
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              className="input-field"
              sx={{
                width: isMobile ? "250px" : "450px",
                ml: isMobile ? -5 : 0,
                mr: isMobile ? -4 : 2,
                mb: isMobile ? 2 : 2,
                transform: isMobile ? "scale(0.8)" : "scale(1)",
              }}
            />

            <Button
              variant="contained"
              onClick={handleOpenAddUser}
              startIcon={<AddIcon
                sx={{
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                }}
              /> }
              className="button"
              style={{
                "--primary-color": primaryColor,
                "--text-color": textColor,
              }}
              sx={{
                width: isMobile ? "auto" : "auto",
                transform: isMobile ? "scale(0.8)" : "scale(1)",
                padding: isMobile ? "8px" : "10px 20px",
              }}
            >
              Add User
            </Button>
          </Box>

          <Dialog open={openAddUser} onClose={handleCloseAddUser}>
            <DialogTitle style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Add User</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                select
                label="User Type"
                name="userType"
                value={newUser.userType}
                onChange={handleInputChange}
                fullWidth
                style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
              >
                <MenuItem value="Farm Owner" style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Farm Owner</MenuItem>
                <MenuItem value="Veterinarian" style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Veterinarian</MenuItem>
              </TextField>

              {newUser.userType === "Farm Owner" && (
                <>
                  <TextField
                    margin="dense"
                    label="Address"
                    name="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    select
                    label="Chicken House Type"
                    name="chickenHouseType"
                    value={newUser.chickenHouseType}
                    onChange={handleInputChange}
                    fullWidth
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  >
                    <MenuItem value="Caged" style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Caged</MenuItem>
                    <MenuItem value="Free-Range" style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Free-Range</MenuItem>
                  </TextField>
                  <TextField
                    margin="dense"
                    label="Number of Housing"
                    name="numHouse"
                    value={newUser.numHouse}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Capacity of Housing"
                    name="capacity"
                    value={newUser.capacity}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Contact Number"
                    name="contactNum"
                    value={newUser.contactNum}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="First Name"
                    name="fName"
                    value={newUser.fName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Farm Name"
                    name="farmName"
                    value={newUser.farmName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Last Name"
                    name="lName"
                    value={newUser.lName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                </>
              )}

              {newUser.userType === "Veterinarian" && (
                <>
                  <TextField
                    margin="dense"
                    label="Contact Number"
                    name="cNum"
                    value={newUser.cNum}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="First Name"
                    name="fName"
                    value={newUser.fName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Last Name"
                    name="lName"
                    value={newUser.lName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="License Number"
                    name="lNum"
                    value={newUser.lNum}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                  <TextField
                    margin="dense"
                    label="Validity Date"
                    name="validDate"
                    value={newUser.validDate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddUser} style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>Cancel</Button>
              <Button onClick={handleAddUser} variant="contained" style={{transform: isMobile ? "scale(0.8)" : "scale(1)",}}>
                Add User
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        {isMobile ? (
          <Box sx={{ px: 2 }}>
            {filteredUsers.map((user) => (
              <Box
                key={user.UserID}
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transform: isMobile ? "scale(0.95)" : "scale(1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <p style={{ margin: 0 }}>
                    {user.fName} {user.lName} - {user.userType}
                  </p>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <IconButton
                    onClick={() => handleEdit(user)}
                    sx={{ color: "gray", transform: isMobile ? "scale(0.8)" : "scale(1)",}}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    onClick={() => confirmDelete(user)}
                    sx={{ color: "#ff6666", transform: isMobile ? "scale(0.8)" : "scale(1)", }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.fName}</TableCell>
                    <TableCell>{user.lName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.userType}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(user)}
                        sx={{ color: "gray" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => confirmDelete(user)}
                        sx={{ color: "#ff6666" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
          width: "100%",
          flexDirection: "row",
          gap: 2,
        }}
      >
        <CustomPagination
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{
            transform: isMobile ? "scale(0.8)" : "scale(1)",
          }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{
            transform: isMobile ? "scale(0.8)" : "scale(1)",
          }}>
          <div>Are you sure you want to delete {userToDelete?.UserID}?</div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: "gray", transform: isMobile ? "scale(0.8)" : "scale(1)", }}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{ color: "#ff6666", transform: isMobile ? "scale(0.8)" : "scale(1)", }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.fName}
            onChange={(e) =>
              setFormData({ ...formData, fName: e.target.value })
            }
            sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.lName}
            onChange={(e) =>
              setFormData({ ...formData, lName: e.target.value })
            }
            sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
          />
          {currentUser && currentUser.userType === "Farm Owner" && (
            <>
              <TextField
                margin="dense"
                label="Address"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
              <TextField
                margin="dense"
                label="Farm Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.farmName}
                onChange={(e) =>
                  setFormData({ ...formData, farmName: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />

              <TextField
                margin="dense"
                select
                label="Chicken House Type"
                fullWidth
                variant="outlined"
                value={formData.chickenHouseType}
                onChange={(e) =>
                  setFormData({ ...formData, chickenHouseType: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              >
                <MenuItem value="Caged" sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}>Caged</MenuItem>
                <MenuItem value="Free-Range" sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}>Free-Range</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Number of Housing"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.numHouse}
                onChange={(e) =>
                  setFormData({ ...formData, numHouse: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
              <TextField
                margin="dense"
                label="Capacity of Housing"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
              <TextField
                margin="dense"
                label="Contact Number"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.contactNum}
                onChange={(e) =>
                  setFormData({ ...formData, contactNum: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
            </>
          )}
          {currentUser && currentUser.userType === "Veterinarian" && (
            <>
              <TextField
                margin="dense"
                label="Contact Number"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.cNum}
                onChange={(e) =>
                  setFormData({ ...formData, cNum: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
              <TextField
                margin="dense"
                label="Validity Date"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.validDate}
                onChange={(e) =>
                  setFormData({ ...formData, validDate: e.target.value })
                }
                sx={{ transform: isMobile ? "scale(0.8)" : "scale(1)", }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{ color: "#ff6666", transform: isMobile ? "scale(0.8)" : "scale(1)",  }}
          >
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} sx={{ color: "gray", transform: isMobile ? "scale(0.8)" : "scale(1)",  }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageAccount;
