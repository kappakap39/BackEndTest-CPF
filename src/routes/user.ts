import express from 'express';
<<<<<<< HEAD
import { getUserAll, addUser, updateUser, deleteUser, getUserByID } from '../controllers/User';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUser', addUser);
root.patch('/updateUser', updateUser);
root.delete('/deleteUser', deleteUser);
=======
import { getUserAll, addUserAll, updateUserAll, deleteUserAll, getUserByID, searchUserByEmail, searchUserByFirstName, searchUserByEF, searchUserByEorF, addUserIMG, } from '../controllers/User';
const root = express.Router();

root.get('/getUserAll', getUserAll);
root.post('/addUserAll', addUserAll);
root.post('/addUserIMG', addUserIMG);
root.patch('/updateUserAll', updateUserAll);
root.delete('/deleteUserAll', deleteUserAll);
>>>>>>> 65905ce2decc89fbcad5bc52200cceb6e88540b0
root.get('/getUserByID/:UserIDInput', getUserByID);


export default root;