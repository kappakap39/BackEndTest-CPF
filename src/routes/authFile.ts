import express from 'express';
import { UpFile, showFile, showFileName, deleteFile, UpFileSingle } from '../controllers/authFileController';
import {authToken} from '../middleware/authUser';
import { checkFile } from '../middleware/authFile';
import { upload } from '../Utils/Upload';
import multer from 'multer';

const file = express.Router();

// file.post('/UpFile', upload.array('files', 10), checkFile, UpFile);
file.post('/UpFile', upload.array('file'), checkFile, UpFile);
file.post('/UpFileSingle', upload.single('file'), checkFile, UpFileSingle);
file.get('/showFile', showFile);
file.get('/showFileName', showFileName);
file.delete('/deleteFile', deleteFile);

export default file;