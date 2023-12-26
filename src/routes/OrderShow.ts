import express from 'express';
import { getOrderShow, addOrderShow, updateOrderShow, deleteOrderShow, getOrderShowUser } from '../controllers/OrderShow'
const root = express.Router();

root.get('/getOrderShow', getOrderShow )
root.post('/addOrderShow', addOrderShow )
root.patch('/updateOrderShow', updateOrderShow )
root.delete('/deleteOrderShow', deleteOrderShow )
root.get('/getOrderShowUser', getOrderShowUser )

export default root;