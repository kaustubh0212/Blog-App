const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

exports.registerController = async (req, res) =>{
    try {
        const {username, email, password} = req.body;

        if(!username || !email || !password)
        {
            return res.status(400).send({
                success: false,
                message: 'Please Fill All The Fields'
            })
        }

        const existingUser = await userModel.findOne({email})
        if(existingUser)
        {
            return res.status(401).send({  
                // as an object is being sent so .send() will convert it into json format. if only a string had been sent, it couldnt be converted into json format
                success: false,
                message: 'user already exists'
            })
        }

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10)

        // save new user
        const user = new userModel({username, email, password: hashedPassword})
        await user.save()

        return res.status(201).send({
            success: true,
            message: 'New User Created',
            user
        })

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .send({
            message: 'Error In Register Callback',
            success: false,
            error
        })
    }
}


exports.getAllUsers = async (req, res) => {
    try {
        
        // users is array of user objects
        const users = await userModel.find({})
        return res.status(200).send({
            userCount: users.length,
            success: true,
            message: "All Users Data",
            users
        })


    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error In Getting All Te Users',
            error
        })
    }
}


exports.loginController = async (req, res) => {
    try {
        
        const {email, password} = req.body
        if(!email || !password)
        {
            return res.status(401).send({
                success: false,
                message: 'Please Fill all the details'
            })
        }

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(200).send({
                success: false,
                message: 'Email is not registered'
            })
        }

        // checking password
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch)
        {
            return res.status(401).send({
                success: false,
                message: 'Invalid details'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'logged in successfully',
            user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error In Login Callback',
            error
        })
    }
}