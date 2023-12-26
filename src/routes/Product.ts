import express from 'express';
import { getProduct, addProduct, updateProduct, deleteProduct, ProductJoinCategory, ProductJoinByID, searchProductName, getSumPriceCategory, getSumPriceMonth } from '../controllers/Product'
const root = express.Router();

root.get('/getProduct', getProduct )
root.post('/addProduct', addProduct )
root.patch('/updateProduct', updateProduct )
root.delete('/deleteProduct', deleteProduct )
root.get('/ProductJoinCategory', ProductJoinCategory )
root.get('/ProductJoinByID/:CategoryIDInput', ProductJoinByID )
root.get('/searchProductName/:ProductName', searchProductName )
root.get('/getSumPriceMonth/:Month', getSumPriceMonth )
root.get('/getSumPriceCategory', getSumPriceCategory )

export default root;