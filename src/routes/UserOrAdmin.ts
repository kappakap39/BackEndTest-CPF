import express from 'express';
import { getUserORAdmin, addUserOrAdmin, deleteUserOrAdmin, updateUserOrAdmin } from '../controllers/authUserOrAdmin';
const root = express.Router();

root.get('/getUserORAdmin', getUserORAdmin);
root.post('/addUserOrAdmin', addUserOrAdmin);
root.delete('/deleteUserOrAdmin', deleteUserOrAdmin);
root.patch('/updateUserOrAdmin', updateUserOrAdmin);

export default root;