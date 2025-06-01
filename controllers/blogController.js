const mongoose = require("mongoose");
const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");

//GET ALL BLOGS
exports.getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).populate("user");
    // blogs will  be an array of blogs where each blog will also store the complete detail of its user, not just user id

    if (!blogs) {
      return res.status(200).send({
        success: false,
        message: "No Blogs Found",
      });
    }

    return res.status(200).send({
      success: true,
      BlogCount: blogs.length,
      message: "All Blogs lists",
      blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error While Getting Blogs",
      error,
    });
  }
};

//Create Blog

exports.createBlogController = async (req, res) => {
  try {
    const { title, description, image, user } = req.body;
    //validation
    if (!title || !description || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    const exisitingUser = await userModel.findById(user);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "Unable to find user",
      });
    }

    const newBlog = new blogModel({ title, description, image, user });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    exisitingUser.blogs.push(newBlog);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog Created!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error While Creting blog",
      error,
    });
  }
};

//Update Blog
exports.updateBlogController = async (req, res) => {
  try {
    const { id } = req.params; // params is used the grab values directly from the url path
    const { title, description, image } = req.body;
    
    const blog = await blogModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Blog Updated!",
      blog,
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error While Updating Blog",
      error,
    });
  }
};

//Single Blog
exports.getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;  // id of the blog in the database
    const blog = await blogModel.findById(id);


    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "blog not found with this is",
      });
    }

    return res.status(200).send({
      success: true,
      message: "fetched single blog",
      blog,
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "error while getting single blog",
      error,
    });
  }
};

//Delete Blog
exports.deleteBlogController = async (req, res) => {
  try {    
    /*
    const blog = await blogModel.findByIdAndDelete(req.params.id).populate("user");
    await blog.user.blogs.pull(blog._id);
    await blog.user.save();
    */
    const session = await mongoose.startSession();
    session.startTransaction();

    const blog = await blogModel.findById(req.params.id).populate("user").session(session);

    if(!blog)
    {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).send({
        success: false,
        message: "Blog Not Found",
      });
    }

    await blogModel.findByIdAndDelete(req.params.id, { session });
    await blog.user.blogs.pull(blog._id);
    await blog.user.save({session});
    await session.commitTransaction();
    session.endSession();

    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error While Deleting The Blog",
      error,
    });
  }
};

//GET USER BLOGS
exports.userBlogControlller = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");

    if (!userBlog) {
      return res.status(404).send({
        success: false,
        message: "blogs not found with this id",
      });
    }

    return res.status(200).send({
      success: true,
      message: "user blogs",
      userBlog,
    });
    
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "error in user blog",
      error,
    });
  }
};