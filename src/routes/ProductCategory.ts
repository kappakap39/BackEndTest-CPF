import express from 'express';
import { getProductCategory, addProductCategory, updateProductCategory, deleteProductCategory } from '../controllers/ProductCategory';
const root = express.Router();

root.get('/getProductCategory', getProductCategory )
root.post('/addProductCategory', addProductCategory )
root.patch('/updateProductCategory', updateProductCategory )
root.delete('/deleteProductCategory', deleteProductCategory )

export default root;