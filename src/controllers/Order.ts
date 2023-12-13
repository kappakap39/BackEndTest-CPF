import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

//!Get Order
const getOrder: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const Order = await prisma.order.findMany();
        if (Order.length === 0) {
            return res.status(404).json({ Order: 'None Order' });
        }
        return res.json(Order);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!Create Order
const addOrder: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        UserID: Joi.string().min(1).max(255).required(),
        DeliveryStatus: Joi.boolean(),
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
        const duplicateOrder = await tx.order.findMany({
            where: {
                OR: [{ OrderID: body.OrderID }, { UserID: body.UserID }],
            },
        });

        if (duplicateOrder && duplicateOrder.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'OrderID or UserID is duplicate in database.',
                data: {
                    OrderID: body.OrderID,
                    UserID: body.UserID,
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);

        const payloadUser = {
            UserID: body.UserID,
            DeliveryStatus: body.DeliveryStatus,
        };

        const Order = await tx.order.create({
            data: payloadUser,
        });

        return res.status(201).json(Order);
    });
};

const updateOrder: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        OrderID: Joi.string().uuid().required(),
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

        const checkOrder = await tx.order.findFirst({
            where: {
                OrderID: body.OrderID,
            },
        });

        if (!checkOrder) {
            return res.status(422).json({ error: 'Order not found' });
        }

        if (body.UserID) {
            payload['UserID'] = body.UserID;
        }

        if (body.DeliveryStatus) {
            payload['DeliveryStatus'] = body.DeliveryStatus;
        }

        const update = await tx.order.update({
            where: {
                OrderID: body.OrderID,
            },
            data: payload,
        });

        return res.json(update);
    });
};

const deleteOrder: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        OrderID: Joi.string().uuid().required(),
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
        const deleteOrder = await tx.order.delete({
            where: {
                OrderID: query.OrderID,
            },
        });
        return res.json(deleteOrder);
    });
};

//!search Order By Date (dd/mm/yyy) แสดง Product และ เจ้าของ ของ Order นั้นๆ
const OrderBydate: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { ProductDateOrder } = req.params;

        const DateOrder = await prisma.order.findMany({
            where: {
                CreatedAt: {
                    gte: new Date(ProductDateOrder),
                    lt: new Date(new Date(ProductDateOrder).setDate(new Date(ProductDateOrder).getDate() + 1)),
                },
            },
            select: {
                OrderID: true,
                DeliveryStatus: true,
                CreatedAt: true,
                user: {
                    select: {
                        FirstName: true,
                        LastName: true,
                    },
                },
                orderDetails: {
                    select: {
                        ProductID: true,
                        product: {
                            select: {
                                ProductName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!DateOrder || DateOrder.length === 0) {
            return res.status(404).json({ error: 'search Order By Date not found' });
        }

        return res.json(DateOrder);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

export { getOrder, addOrder, updateOrder, deleteOrder, OrderBydate };
