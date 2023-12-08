import express from 'express';
import { getUserAll, addUserAll, updateUserAll, deleteUserAll, getUserByID, searchUserByEmail, searchUserByFullname, searchUserByEF, searchUserByEorF } from '../controllers/User';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUserAll', addUserAll);
root.patch('/updateUserAll', updateUserAll);
root.delete('/deleteUserAll', deleteUserAll);
root.get('/getUserByID/:UserIDInput', getUserByID);
root.get('/searchUserByEmail/:EmailInput', searchUserByEmail);
root.get('/searchUserByFullname/:FullnameInput', searchUserByFullname);
root.get('/searchUserByEF/:EmailInput/:FullnameInput', searchUserByEF);
root.get('/searchUserByEorF/:UserEmail/:FullnameInput', searchUserByEorF);


export default root;