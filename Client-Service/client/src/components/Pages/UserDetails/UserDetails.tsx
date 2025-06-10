import React, { useEffect, useState } from 'react'
import {fetchUsers} from '../../../services/authService'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Container } from '@mui/material';
import { Role, Permission, User } from '../../../Types'

const UserDetails = () => {

    const [userDetails, setUserDetails] = useState<any>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetchUsers();
                
                setUserDetails(response);
                
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchUserDetails();
    }, []);

  return (
    <Container sx={{ mt: '100px' }}>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>USERNAME</TableCell>
            <TableCell align="center">EMAIL</TableCell>
            <TableCell align="center">PHONE</TableCell>
            <TableCell align="center">FIRSTNAME</TableCell>
            <TableCell align="center">LASTNAME</TableCell>
            <TableCell align="center">ROLES</TableCell>
            <TableCell align="center">PERMISSIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            { userDetails &&
                userDetails.map((user:User) => ( 
                    <TableRow key={user.userId}>
                        <TableCell align='center'>{ user.username }</TableCell>
                        <TableCell align='center'>{ user.email }</TableCell>
                        <TableCell align='center'>{ user.phoneNumber }</TableCell>
                        <TableCell align='center'>{ user.firstName }</TableCell>
                        <TableCell align='center'>{ user.lastName }</TableCell>
                        <TableCell align='center'>
                            {user.roles.map((role:Role) => (
                                <div key={role.roleId}>{role.roleName}</div>
                            ))}
                        </TableCell>
                        <TableCell align='center'>
                            {user.permissions.map((permission:Permission) => (
                                <div key={permission.permissionId}>{permission.permissionName}</div>
                            ))}
                        </TableCell>
                    </TableRow>
                ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>

  );
};

export default UserDetails