import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

//!Get OrderDetial
const getOrderShow: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const OrderDetial = await prisma.orderDetial.findMany();
        if (OrderDetial.length === 0) {
            return res.status(404).json({ OrderDetail: 'None OrderDetail' });
        }
        return res.json(OrderDetial);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!Create OrderDetial
const addOrderShow: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        OrderID: Joi.string().min(1).max(255).required(),
        ProductID: Joi.string().min(1).max(255).required(),
        Amount: Joi.number().integer().min(1).required(),
        Price: Joi.number().min(1).required(),
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
        const duplicateOrderShow = await tx.orderDetial.findMany({
            // where: {
            //     OR: [
            //         { OrderID: body.OrderID },
            //         { ProductID: body.ProductID },
            //     ],
            // },
        });

        if (duplicateOrderShow && duplicateOrderShow.length <= 0) {
            return res.status(422).json({
                status: 422,
                message: 'OrderID or ProductID is duplicate in database.',
                data: {
                    OrderID: body.OrderID,
                    ProductID: body.ProductID,
                },
            });
        }

        // Generate salt to hash password
        // const Salt = await bcrypt.genSalt(10);

        const payloadUser = {
            OrderID: body.OrderID,
            ProductID: body.ProductID,
            Amount: body.Amount,
            Price: body.Price
        };

        const orderDetial = await tx.orderDetial.create({
            data: payloadUser,
        });

        return res.status(201).json(orderDetial);
    });
};

const updateOrderShow: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        OrderDetailID: Joi.string().uuid().required(),
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

        const OrderDetail = await tx.orderDetial.findFirst({
            where: {
                OrderDetailID: body.OrderDetailID,
            },
        });

        if (!OrderDetail) {
            return res.status(422).json({ error: 'OrderDetail not found' });
        }

        if (body.OrderID) {
            payload['OrderID'] = body.OrderID;
        }

        if (body.ProductID) {
            payload['ProductID'] = body.ProductID;
        }
        if (body.Amount) {
            payload['Amount'] = body.Amount;
        }
        if (body.Price) {
            payload['Price'] = body.Price;
        }

        const update = await tx.orderDetial.update({
            where: {
                OrderDetailID: body.OrderDetailID,
            },
            data: payload,
        });

        return res.json(update);
    });
};

const deleteOrderShow: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        OrderDetailID: Joi.string().uuid().required(),
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
        const deleteOrderDetail = await tx.orderDetial.delete({
            where: {
                OrderDetailID: query.OrderDetailID,
            },
        });
        return res.json(deleteOrderDetail);
    });
};

//!get ข้อมูล User คนที่มียอดซื้อ (Amount) Top 3 พร้อมแสดงรายละเอียด User คนนั้นๆ
// const getOrderShowUser: RequestHandler = async (req, res) => {
//     const prisma = new PrismaClient();
//     try {
//         const top3UniqueUsers = await prisma.orderDetial.findMany({
//             where: {
//                 Amount: {
//                     gt: 0,
//                 },
//             },
//             take: 3,
//             select: {
//                 OrderDetailID: true,
//                 Amount: true,
//                 Price: true,
//                 product: {
//                     select: {
//                         ProductID: true,
//                         ProductName: true,
//                         Price: true,
//                     }
//                 },
//                 order: {
//                     select: {
//                         OrderID: true,
//                         DeliveryStatus: true,
//                         user: {
//                             select: {
//                                 UserID: true,
//                                 FullName: true,
//                             }
//                         }
//                     },
//                 },
//             },
//             orderBy: {
//                 Amount: 'desc',
//             }
//         });

//         // กรองผู้ใช้ที่ซ้ำกันตาม UserID
//         const uniqueUsers = Array.from(new Set(top3UniqueUsers.map(order => order.order.user.UserID)))
//             .map(userID => top3UniqueUsers.find(order => order.order.user.UserID === userID));

//         if (uniqueUsers.length === 0) {
//             return res.status(404).json({ OrderDetail: 'None OrderDetail' });
//         }

//         return res.json(uniqueUsers);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

const getOrderShowUser: RequestHandler = async (req, res) => {
    // สร้าง PrismaClient เพื่อเชื่อมต่อกับฐานข้อมูล
    const prisma = new PrismaClient();

    try {
        // ดึงข้อมูลทั้งหมดของการสั่งซื้อ (orderDetial) โดยเลือกบางฟิลด์เท่านั้น
        const UserOrders = await prisma.orderDetial.findMany({
            select: {
                OrderID: true,
                Amount: true,
                order: {
                    select: {
                        user: {
                            select: {
                                UserID: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                Amount: 'desc',
            },
        });

        // หา UserID ที่ไม่ซ้ำกัน
        const uniqueUsers = Array.from(new Set(UserOrders.map(order => order.order.user.UserID)));

        // คำนวณมูลค่ารวมสำหรับแต่ละผู้ใช้ที่ไม่ซ้ำกัน
        const userAmountSum = await Promise.all(
            uniqueUsers.map(async (userID) => {
                const sumAmount = UserOrders
                    .filter(order => order.order.user.UserID === userID)
                    .reduce((total, order) => total + order.Amount, 0);

                // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
                const user = await prisma.user.findUnique({
                    where: {
                        UserID: userID,
                    },
                    select: {
                        UserID: true,
                        Email: true,
                        Password: true,
                        Address: true,
                        Tel: true,
                        Status: true,
                        Remove: true,
                        Active: true,
                    },
                });

                return {
                    user,
                    sumAmount,
                };
            })
        );

        // เรียงลำดับผู้ใช้ตามมูลค่ารวมจากมากไปน้อยและเลือก top 3
        const top3Users = userAmountSum
            .sort((a, b) => b.sumAmount - a.sumAmount)
            .slice(0, 3);

        // ถ้าไม่มีข้อมูลการสั่งซื้อ
        if (top3Users.length === 0) {
            return res.status(404).json({ OrderDetail: 'None OrderDetail' });
        }

        // ส่งข้อมูลผู้ใช้ Top 3 กลับเป็น JSON
        return res.json(top3Users);
    } catch (error) {
        // จัดการข้อผิดพลาด
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // ปิดการเชื่อมต่อกับฐานข้อมูลเมื่อเสร็จสิ้น
        await prisma.$disconnect();
    }
};



export { getOrderShow, addOrderShow, updateOrderShow, deleteOrderShow, getOrderShowUser };
