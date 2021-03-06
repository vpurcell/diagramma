const mongoose = require('mongoose');

const Images = require('../models/image');

const imageController = {};

imageController.getAllImages = (req, res) => {
    Images.find({ active: true })
    .populate('designer', 'displayName active')
    .select('-votes')
    .exec((err, images) => {
        if (images) {
            res.json(images.filter(i => (i.active && i.designer !==null && i.designer.active)));
        } else {
            res.json([]);
        }
    });
};

imageController.getImagesByDesigner = (req, res) => {
    Images.find({ designer: req.params.designer })
    .populate('designer', 'displayName active')
    .select(req.query.withVotes ? '' : '-votes')
    .exec((err, images) => {
        if (images) {
            req.query.getAll
            ? res.json(images)
            : res.json(images.filter(i => (i.active && i.designer.active)));
        } else {
            res.json([]);
        }
    });
};

imageController.getVotes = (req, res) => {
    Images.findById(req.params.image)
    .exec((err, image) => {
        if (image) {
            res.json({ votes: image.votes.length });
        } else {
            res.json({ votes: '0'});
        }
    });
};

imageController.updateImage = (req, res) => {
    Images.findByIdAndUpdate(req.params.image, req.body, {safe: true, upsert: true}).exec((err, returnImage) => {
        if (returnImage) {
            Images.findById(req.params.image).exec((err, updatedImage) => {
                if (updatedImage) {
                    res.json(updatedImage);
                } else {
                    res.status(500).send('Error Updating image');
                }
            });
        } else {
            res.status(404).send('Image record not found');
        }
    });
};

imageController.addVote = (req, res) => {
    Images.findByIdAndUpdate(req.params.image, {$push: {votes: {timestamp: Date.now()}}}, {safe: true, upsert: true}).exec((err, returnImage) => {
        if (returnImage) {
            Images.findById(req.params.image).exec((err, updatedImage) => {
                if (updatedImage) {
                    res.json({ votes: updatedImage.votes.length });
                } else {
                    res.status(500).send('Error voting');
                }
            });
        } else {
            res.status(404).send('Image record not found');
        }
    });
};

module.exports = imageController;
