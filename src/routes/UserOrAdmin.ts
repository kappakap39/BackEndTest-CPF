import express from 'express';
import { getUserORAdmin, addUserOrAdmin, deleteUserOrAdmin, updateUserOrAdmin, getUserAdminByID } from '../controllers/authUserOrAdmin';
const root = express.Router();

root.get('/getUserORAdmin', getUserORAdmin);
root.get('/getUserAdminByID', getUserAdminByID);
root.post('/addUserOrAdmin', addUserOrAdmin);
root.delete('/deleteUserOrAdmin', deleteUserOrAdmin);
root.patch('/updateUserOrAdmin', updateUserOrAdmin);

export default root;