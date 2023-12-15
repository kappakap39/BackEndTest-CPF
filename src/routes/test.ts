import express from 'express';
import { updatePeople, deletePeople, getPeople, addPeople, getPeopleID, getUser, addUser, updateUser, deleteUser, getUserByID } from '../controllers/TestController';

const root = express.Router();

root.get('/getPeople', getPeople);
root.post('/addPeople', addPeople);
root.patch('/updatePeople', updatePeople);
root.delete('/deletePeople', deletePeople);
root.get('/getUser', getUser);
root.post('/addUser', addUser);
root.patch('/updateUser', updateUser);
root.delete('/deleteUser', deleteUser);
root.get('/getUserByID/:UserID', getUserByID);
root.get('/getPeopleID/:PeopleID', getPeopleID);


export default root;
