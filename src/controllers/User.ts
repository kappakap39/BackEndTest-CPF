import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomHelpers } from 'joi';
import nodemailer from 'nodemailer';

//!Get User All
// const getUserAll: RequestHandler = async (req, res) => {
//     const prisma = new PrismaClient();
//     try {
//         const users = await prisma.user.findMany();
//         if (users.length === 0) {
//             return res.status(404).json({ users: 'None users' });
//         }
//         return res.json(users);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

//!Create User
// const addUserAll: RequestHandler = async (req, res) => {
//     // create schema object
//     const schema =  Joi.object({

//         Email:      Joi.string().min(1).max(255).required(),
//         Password:   Joi.string().min(1).max(255).required(),
//         FirstName:  Joi.string().min(1).max(255).required(),
//         LastName:   Joi.string().min(1).max(255).required(),
//         Address: Joi.object([{
//             province: Joi.string().max(255).required(),
//             district: Joi.string().max(255).required(),
//             subdistrict: Joi.string().max(255).required(),
//             Additional: Joi.string().max(255).required()
//         }]).max(255),
//         Tel:        Joi.string().min(1).max(10).required(),
//         Status:     Joi.boolean(),
//         Remove:     Joi.boolean(),
//         Active:     Joi.boolean(),

//     });

//     // schema options
//     const options = {
//         abortEarly: false, // include all errors
//         allowUnknown: true, // ignore unknown props
//         stripUnknown: true, // remove unknown props
//     };

//     // validate request body against schema
//     const { error } = schema.validate(req.body, options);

//     if (error) {
//         return res.status(422).json({
//             status: 422,
//             message: 'Unprocessable Entity',
//             data: error.details,
//         });
//     }

//     const body = req.body;
//     const prisma = new PrismaClient();

//     return await prisma.$transaction(async function (tx) {
//         const duplicateUser = await tx.user.findMany({
//             //เช็คว่าตัวไหนซ้ำ ให้ใส่แค่ตัวที่ซ้ำไม่ได้
//             where: {
//                 OR: [
//                     { Email: { contains: body.Email } },
//                     { Tel: { contains: body.Tel } }
//                 ]},
//         });

//         if (duplicateUser && duplicateUser.length > 0) {
//             return res.status(422).json({
//                 status: 422,
//                 message: 'Email or Tel is duplicate in database.',
//                 data: {
//                     Email: body.Email,
//                     Tel: body.Tel
//                 },
//             });
//         }

//         // Generate salt to hash password
//         // const Salt = await bcrypt.genSalt(10);

//         const payloadUser = {

//             Email:      body.Email,
//             Password:   body.Password,
//             FirstName:  body.FirstName,
//             LastName:   body.LastName,
//             Address:    body.Address,
//             Tel:        body.Tel,
//             Status:     body.Status,
//             Remove:     body.Remove,
//             Active:     body.Active,

//         };

//         const user = await tx.user.create({
//             data: payloadUser,
//         });

//         return res.status(201).json(user);
//     });
// };

const getUserAll: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany();
        if (users.length === 0) {
            return res.status(404).json({ users: 'None users' });
        }

        // Map users and add FullnameFL property
        const usersWithFullnameFL = users.map((user) => ({
            ...user,
            FullnameFL: `${user.FirstName} ${user.LastName}`,
            // PasswordHASH: password,
        }));

        return res.json(usersWithFullnameFL);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

const addUserAll: RequestHandler = async (req, res) => {
    // create schema object
    const schema = Joi.object({
        Email: Joi.string().min(1).max(255).required(),
        Password: Joi.string().min(1).max(255).required(),
        FirstName: Joi.string().min(1).max(255).required(),
        LastName: Joi.string().min(1).max(255).required(),
        Otp: Joi.string().min(1).max(255),
        OtpExpired: Joi.date(),
        Address: Joi.object({
            province: Joi.string().max(255).required(),
            district: Joi.string().max(255).required(),
            subdistrict: Joi.string().max(255).required(),
            Additional: Joi.string().max(255).required(),
        }).max(255),
        Tel: Joi.string().min(1).max(10).required(),
        Status: Joi.boolean(),
        Remove: Joi.boolean(),
        Active: Joi.boolean(),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error, value: validatedData } = schema.validate(req.body, options);

    if (error) {
        return res.status(422).json({
            status: 422,
            message: 'Unprocessable Entity',
            data: error.details,
        });
    }

    const prisma = new PrismaClient();

    try {
        const duplicateUser = await prisma.user.findMany({
            where: {
                OR: [{ Email: { contains: validatedData.Email } }, { Tel: { contains: validatedData.Tel } }],
            },
        });

        if (duplicateUser && duplicateUser.length > 0) {
            return res.status(422).json({
                status: 422,
                message: 'Email or Tel is duplicate in the database.',
                data: {
                    Email: validatedData.Email,
                    Tel: validatedData.Tel,
                },
            });
        }

        // ใช้ Bcrypt เพื่อแฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(validatedData.Password, 10);

        const payloadUser = {
            Email: validatedData.Email,
            Password: hashedPassword,
            FirstName: validatedData.FirstName,
            LastName: validatedData.LastName,
            Otp: validatedData.Otp,
            OtpExpired: validatedData.OtpExpired,
            // FullName: `${validatedData.FirstName} ${validatedData.LastName}`, // Assuming 'FullName' is a combination of first and last name
            Address: validatedData.Address,
            Tel: validatedData.Tel,
            Status: validatedData.Status,
            Remove: validatedData.Remove,
            Active: validatedData.Active,
        };
        

        const user = await prisma.user.create({
            data: payloadUser,
        });

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: error,
        });
    }
};

//!Update User
const updateUserAll: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        UserID: Joi.string().uuid().required(),
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

        const checkUser = await tx.user.findFirst({
            where: {
                UserID: body.UserID,
            },
        });
        if (!checkUser) {
            return res.status(422).json({ error: 'checkUser not found' });
        }

        if (body.Email) {
            payload['Email'] = body.Email;
        }

        if (body.Password) {
            payload['Password'] = body.Password;
        }

        if (body.FirstName) {
            payload['FirstName'] = body.FirstName;
        }

        if (body.LastName) {
            payload['LastName'] = body.LastName;
        }
        if (body.Otp) {
            payload['Otp'] = body.Otp;
        }

        if (body.OtpExpired) {
            payload['OtpExpired'] = body.OtpExpired;
        }

        if (body.Address) {
            payload['Address'] = body.Address;
        }

        if (body.Tel) {
            payload['Tel'] = body.Tel;
        }

        if (body.Status) {
            payload['Status'] = body.Status;
        }

        if (body.Remove) {
            payload['Remove'] = body.Remove;
        }

        if (body.Active) {
            payload['Active'] = body.Active;
        }

        const update = await tx.user.update({
            where: {
                UserID: body.UserID,
            },
            data: payload,
        });

        return res.json(update);
    });
};

//!Delete User
const deleteUserAll: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        UserID: Joi.string().uuid().required(),
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
        const deletePeople = await tx.user.delete({
            where: {
                UserID: query.UserID,
            },
        });
        return res.json(deletePeople);
    });
};

//!Get User By ID
const getUserByID: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { UserIDInput } = req.params;
        const userByID = await prisma.user.findMany({
            where: {
                UserID: UserIDInput,
            },
        });

        if (!userByID) {
            return res.status(404).json({ error: 'userID not found' });
        }

        return res.json(userByID);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!search user Email
const searchUserByEmail: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { EmailInput } = req.params;
        const userByEmail = await prisma.user.findMany({
            where: {
                Email: EmailInput,
            },
        });

        if (!userByEmail) {
            return res.status(404).json({ error: 'email not found' });
        }

        return res.json(userByEmail);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

// //!search user FirstName
const searchUserByFirstName: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { FirstNameInput } = req.params;
        const userByFirstNameInput = await prisma.user.findMany({
            where: {
                FirstName: FirstNameInput,
            },
        });

        if (!userByFirstNameInput) {
            return res.status(404).json({ error: 'FirstName not found' });
        }

        return res.json(userByFirstNameInput);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

//!search Email and FirstNameInput
const searchUserByEF: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { EmailInput } = req.params;
        const { FirstNameInput } = req.params;
        const userByEF = await prisma.user.findMany({
            where: {
                Email: EmailInput,
                FirstName: FirstNameInput,
            },
        });

        if (!userByEF) {
            return res.status(404).json({ error: 'Email or FirstName not found' });
        }

        return res.json(userByEF);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

const searchUserByEorF: RequestHandler = async (req, res) => {
    const prisma = new PrismaClient();
    try {
        const { EmailInput, FirstNameInput } = req.params;

        const userByEF = await prisma.user.findMany({
            where: {
                OR: [{ Email: EmailInput }, { FirstName: FirstNameInput }],
            },
        });

        if (userByEF.length === 0) {
            return res.status(404).json({ error: 'Email or FirstName not found' });
        }

        return res.json(userByEF);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
};

export {
    getUserAll,
    addUserAll,
    updateUserAll,
    deleteUserAll,
    getUserByID,
    searchUserByEmail,
    searchUserByFirstName,
    searchUserByEF,
    searchUserByEorF,
};
