const { validationResult } = require('express-validator');
const Tweet = require('../models/Tweet');

exports.getComments = async (req, res, next) => {
    const { tweet_id } = req.params;

    try {
        const tweet = await Tweet.findById(tweet_id);
        if (!tweet) {
            return res.status(404).json({ errors: [{ msg: 'Tweet does not exists' }]  });
        }

        const comments = await Tweet.find({ _id: { $in: tweet.comments }})
            .sort({ created: -1 })
            .populate('user', ['name', 'username', 'avatar']);

        res.json(comments);
    } catch (err) {
        console.error(err.message);
        next(err);
    }
};

exports.createComment = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
    }

    const { tweet_id } = req.params;

    try {
        const tweet = await Tweet.findById(tweet_id);

        if (!tweet) {
            return res.status(404).json({ errors: [{ msg: 'Tweet does not exists' }]  });
        }

        const commentBody = {
            text: req.body.text,
            comment: true
        };
        // Add optional media property if exists
        if (req.body.media) {
            commentBody.media = req.body.media;
        }
        const comment = new Tweet(commentBody);
        comment.user = req.user.id;
        let savedComment = await comment.save();

        tweet.comments = [savedComment._id, ...tweet.comments];
        await tweet.save();

        savedComment = await Tweet.populate(savedComment, { path: 'user', select: ['name', 'username', 'avatar'] });

        res.json(savedComment);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Tweet does not exists' }] });
        }
        next(err);
    }
};