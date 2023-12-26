import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

//!Get ProductCategory
const getProductCategory: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const ProductCategory = await prisma.productCategory.findMany();
        if (ProductCategory.length === 0) {
            return res.status(404).json({ ProductCategory: 'None ProductCategory' });
        }
        return res.json(ProductCategory);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!Create ProductCategory
const addProductCategory: RequestHandler = async (req, res) => {
    // create schema object
    const schema =  Joi.object({

        CategoryName:      Joi.string().min(1).max(255).required(),
        Description:   Joi.string().min(0).max(511),

    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const body = req.body;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const duplicateProductC = await tx.productCategory.findMany({
            where: {
                OR: [{ CategoryName: { contains: body.CategoryName } },
                    // { Description: { contains: body.Description } }
            ]},
        });

        if (duplicateProductC && duplicateProductC.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'CategoryName is duplicate in database.',
                data: {
                    CategoryName: body.CategoryName,
                    // Description: body.Description
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);

        const payloadUser = {

            CategoryName:      body.CategoryName,
            Description:       body.Description,

        };

        const productCategory = await tx.productCategory.create({
            data: payloadUser,
        });

        return res.status(201).json(productCategory);
    });
};

const updateProductCategory: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        CategoryID: Joi.string().uuid().required(),
    });

    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    };

    const { error } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const body = req.body;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const payload: any = {};

        const checkCategory = await tx.productCategory.findFirst({
            where:{
                CategoryID: body.CategoryID
            }
        })
        if(!checkCategory){
            return res.status(422).json({ error: 'Category not found' });
        }

        
        if (body.CategoryName) {
            payload['CategoryName'] = body.CategoryName;
        }

        // if (body.Description) {
        //     payload['Description'] = body.Description;
        // }

        const update = await tx.productCategory.update({
            where: {
                CategoryID: body.CategoryID,
            },
            data: payload,
        });

        return res.json(update);
    });
};

const deleteProductCategory: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        CategoryID: Joi.string().uuid().required(),
    });

    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    };

    const { error } = schema.validate(req.query, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const query: any = req.query;
    const prisma = new PrismaClient();

    return await prisma.$transaction(async function (tx) {
        const deleteProductCategory = await tx.productCategory.delete({
            where: {
                CategoryID: query.CategoryID,
            },
        });
        return res.json(deleteProductCategory);
    });
};


export { getProductCategory, addProductCategory, updateProductCategory, deleteProductCategory };
