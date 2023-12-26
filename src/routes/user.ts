import express from 'express';
import { getUserAll, addUser, updateUser, deleteUser, getUserByID, searchUserByEmail, searchUserByFullname, searchUserByEF, searchUserByEorF, addUserIMG } from '../controllers/User';
import { upload } from '../Utils/Upload';
import { checkFile } from '../middleware/authFile';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUser', addUser);
root.post('/addUserIMG', upload.single('file'), checkFile, addUserIMG);
root.patch('/updateUser', updateUser);
root.delete('/deleteUser', deleteUser);
root.get('/getUserByID/:UserIDInput', getUserByID);
root.get('/searchUserByEmail/:EmailInput', searchUserByEmail);
root.get('/searchUserByFullname/:FullnameInput', searchUserByFullname);
root.get('/searchUserByEF/:EmailInput/:FullnameInput', searchUserByEF);
root.get('/searchUserByEorF/:EmailInput/:FullnameInput', searchUserByEorF);

export default root;