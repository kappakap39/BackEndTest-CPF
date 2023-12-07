import express from 'express';
import { getOrder, addOrder, updateOrder, deleteOrder, OrderBydate } from '../controllers/Order'
const root = express.Router();

root.get('/getOrder', getOrder )
root.post('/addOrder', addOrder )
root.patch('/updateOrder', updateOrder )
root.delete('/deleteOrder', deleteOrder )
root.get('/OrderBydate/:ProductDateOrder', OrderBydate )

export default root;