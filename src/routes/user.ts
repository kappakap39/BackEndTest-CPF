import express from 'express';
import { getUserAll, addUser, updateUser, deleteUser, getUserByID } from '../controllers/User';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUser', addUser);
root.patch('/updateUser', updateUser);
root.delete('/deleteUser', deleteUser);
root.get('/getUserByID/:UserIDInput', getUserByID);


export default root;