import express from 'express';
import { getUserAll, addUserAll, updateUserAll, deleteUserAll, getUserByID, searchUserByEmail, searchUserByFirstName, searchUserByEF, searchUserByEorF, addUserIMG, } from '../controllers/User';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUserAll', addUserAll);
root.post('/addUserIMG', addUserIMG);
root.patch('/updateUserAll', updateUserAll);
root.delete('/deleteUserAll', deleteUserAll);
root.get('/getUserByID/:UserIDInput', getUserByID);
root.get('/searchUserByEmail/:EmailInput', searchUserByEmail);
root.get('/searchUserByFirstName/:FirstNameInput', searchUserByFirstName);
root.get('/searchUserByEF/:EmailInput/:FirstNameInput', searchUserByEF);
root.get('/searchUserByEorF/:UserEmail/:FirstNameInput', searchUserByEorF);


export default root;