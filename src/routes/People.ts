import express from 'express';
import { getPeople, addPeople, getPeopleID, updatePeople, deletePeople, RowText } from '../controllers/TestController'
const root = express.Router();

root.get('/getPeople', getPeople );
root.get('/getPeopleID/:PeopleID', getPeopleID );
root.post('/addPeople', addPeople );
root.patch('/updatePeople', updatePeople );
root.delete('/deletePeople', deletePeople );
root.post('/RowText', RowText );

export default root;