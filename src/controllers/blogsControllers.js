const blogsModel = require("../models/blogsModel")
const mongoose = require("mongoose")
const objectId = mongoose.Types.ObjectId;

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBlogs = async function (req, res) {
    try {
        let data = req.body;
        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "title is Required" })
        if (!isValid(data.body)) return res.status(400).send({ status: false, msg: "body is Required" })
        if (!isValid(data.authorId)) return res.status(400).send({ status: false, msg: "authorId is Required" })
        if (!isValidObjectId(data.authorId)) return res.status(400).send({ status: false, msg: "author is not valid" })
        if (!isValid(data.category)) return res.status(400).send({ status: false, msg: "category is Required" })

        if (Object.keys(data).length != 0) {
            let savedData = await blogsModel.create(data);
            res.status(201).send({ msg: savedData, msg: "blog successfully created" });
        } else res.send(400).send({ msg: "bad request" })
    }
    catch (error) {
        console.log("Server Error:", error.message)
        res.status(500).send({ msg: "Server Error", error: error.message })
    }
};


const getBlogs = async function (req, res) {
    try {
        let data = req.query
        let { authorId, category, tags, subcategory } = data
        let blogsDetails = await blogsModel.find({ $and: [{ isDeleted: false }, { isPublished: true }], $or: [{ authorId: authorId }, { category: category }, { tags: tags }, { subcategory: subcategory }] })

        if (!isValid(blogsDetails)) {
            res.status(404).send({ status: false, msg: "no blog exist" })
        }
        else {
            res.status(200).send({ status: true, data: blogsDetails })
        }
    }
    catch (error) {
        console.log("Server Error:", error.message)
        res.status(500).send({ msg: "Server Error", error: error.message })
    }
};


const deleteBlogs = async function (req, res) {
    try {
        let blogId = req.params.blogId
        if (blogId.length < 24) {
            ret
        }

        let validBlogId = await blogsModel.findById(blogId)
        if (!isValid(validBlogId)) {
            return res.status(404).send({ msg: "blog id not present" })
        }
        let blogDelete = await blogsModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true }, { new: true })
        if (blogDelete.isDeleted == true) {
            return res.status(200).send({ status: true, msg: "blog is deleted" })
        }
    }
    catch (error) {
        console.log("server error", error.message)
        res.satus(500).send({ msg: "server error", error: error.message })
    }
}

const queryDeleted = async function (req, res) {
    try {
        let data = req.query;
        let { authorId, category, tags, subcategory } = data
        let blog = req.query.blogId;

        let valid = await blogsModel.findOne(data);
        if (!isValid(valid)) {
            return res.status(404).send({ status: false, msg: "Data doesn't exit!!" })
        }

        if (!isValid(data)) {
            return res.status(400).send({ status: false, msg: "Input Missing" });
        }

        let deleted = await blogsModel.findOneAndUpdate(data, { isDeleted: true }, { new: true });
        if (deleted.isDeleted == true) {
            let update = await blogsModel.findOneAndUpdate({ _id: blog }, { deletedAt: data });
        }
        if (deleted.isDeleted == false) {
            let update = await blogsModel.findOneAndUpdate({ _id: blog }, { deletedAt: " " });
        }
        return res.status(200).send({ status: true, msg: "data successfuly deleted", data: deleted });
    }
    catch (error) {
        return res.status(500).send({ error: error.message });
    }
};


const updateBlogs = async function (req, res) {

    try {
        let BlogId = req.params.blogId
        let userData = req.body

        if (!isValid(userData)) {
            return res.status(400).send({ status: false, msg: "Input Missing" });
        }
        let { body, title, tags, subcategory, isPublished, isDeleted } = userData

        if (BlogId.length < 24) {
            return res.status(403).send({ msg: "enter valid blog id" })
        }

        let user = await blogsModel.findById(BlogId)
        if (!user) {
            return res.status(404).send({ status: false, msg: "no blog exist" })
        }
        let updateNewBlog = await blogsModel.findByIdAndUpdate({ _id: BlogId }, {

            $set: { body: body, title: title, isPublished: isPublished, isDeleted: isDeleted },
            $push: { tags: tags, subcategory: subcategory },

        }, { new: true });

        if (!isValid(updateNewBlog)) {
            return res.status(400).send({ msg: "request invalid" })
        }

        if (updateNewBlog.isPublished == true) {
            let update = await blogsModel.findOneAndUpdate({ _id: BlogId }, { publishedAt: new String(Date()) })

            if (!update) {
                return res.status(400).send({ msg: "not updated" })
            }
        }

        if (updateNewBlog.isPublished == false) {
            let update = await blogsModel.findOneAndUpdate({ _id: BlogId }, { publishedAt: null })

            if (!update) {
                return res.status(400).send({ msg: "not updated" })
            }
        }

        if (updateNewBlog.isDeleted == true) {
            res.status(404).send({ status: false, msg: "blog not found" })

            if (!update) {
                return res.status(400).send({ msg: "not updated" })
            }
        }

        if (updateNewBlog.isDeleted == false) {
            let update = await blogsModel.findOneAndUpdate({ _id: BlogId }, { deletedAt: new String(Date()) })

            if (!update) {
                return res.status(400).send({ msg: "not updated" })
            }
        }
        return res.status(200).send({ status: true, data: updateNewBlog, msg: "blog updated successfuly" })
    }
    catch (error) {
        console.log("server error", error.message)
        res.satus(500).send({ msg: "server error", error: error.message })
    }
}

module.exports.updateBlogs = updateBlogs
module.exports.queryDeleted = queryDeleted;
module.exports.createBlogs = createBlogs
module.exports.getBlogs = getBlogs
module.exports.deleteBlogs = deleteBlogs

//........................................................
// end of the code.