import express from 'express';
import { getPeople, addPeople, getPeopleID, updatePeople, deletePeople } from '../controllers/TestController'
const root = express.Router();

root.get('/getPeople', getPeople );
root.get('/getPeopleID/:PeopleID', getPeopleID );
root.post('/addPeople', addPeople );
root.patch('/updatePeople', updatePeople );
root.delete('/deletePeople', deletePeople );

export default root;