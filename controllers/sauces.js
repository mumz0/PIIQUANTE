const Sauce = require('../models/Sauce'); 
const fs = require('fs'); 


/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;    
    const sauce = new Sauce({ 
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,   
    });
    sauce.save() 
    .then( () => res.status(201).json({ message: 'Sauce saved'}))
    .catch( error => res.status(400).json({ error }))
};

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.modifySauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        let sauceObject = {};
        if (req.file) {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {});
            sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            };
        } else {
            sauceObject = {...req.body};
        }
        Sauce.updateOne({_id: req.params.id} , {...sauceObject, _id: req.params.id})
        .then(()=> res.status(200).json({ message: 'Modified sauce'}))
        .catch(()=> res.status(400).json({ error}));
    })
    .catch( error => res.status(404).json({ error }));
};

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) 
    .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1]; 
    fs.unlink(`images/${filename}`, () => { 
    Sauce.deleteOne({_id: req.params.id}) 
    .then(()=> res.status(200).json({ message: 'Deleted sauce'}))
    .catch(error => res.status(400).json({ error}))
    });
})
};

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.getAllSauces = (req, res, next) => { 
    Sauce.find()
    .then( sauces => res.status(200).json(sauces))
    .catch( error => res.status(400).json({ error }))
};

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.getOneSauce = (req, res, next) => {  
    Sauce.findOne({_id : req.params.id})
    .then( sauce => res.status(200).json(sauce))
    .catch( error => res.status(404).json({ error }))
};

/**
 * @param req {express.Request}
 * @param res {express.Response}
 * @param next {express.NextFunction}
 */
exports.rateSauces = (req, res, next) => {    
    if(req.body.like === 1) { 
        Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1}, $push: { usersLiked: req.body.userId}, _id: req.params.id })
        .then( () => res.status(200).json({ message: 'Sauce liked' }))
        .catch( error => res.status(400).json({ error}))

    } else if(req.body.like === -1) { 
        Sauce.updateOne({_id: req.params.id}, { $inc: { dislikes: 1}, $push: { usersDisliked: req.body.userId}, _id: req.params.id })
        .then( () => res.status(200).json({ message: 'Sauce disliked' }))
        .catch( error => res.status(400).json({ error}))

    } else if(req.body.like === 0) {    
        Sauce.findOne( {_id: req.params.id})
        .then( sauce => {
            if( sauce.usersLiked.indexOf(req.body.userId)!== -1){
                 Sauce.updateOne({_id: req.params.id}, { $inc: { likes: -1},$pull: { usersLiked: req.body.userId}, _id: req.params.id })
                .then( () => res.status(200).json({ message: 'Like removed' }))
                .catch( error => res.status(400).json({ error}))
                }
                
            else if( sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
                Sauce.updateOne( {_id: req.params.id}, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId}, _id: req.params.id})
                .then( () => res.status(200).json({ message: 'Dislike removed' }))
                .catch( error => res.status(400).json({ error}))
                } else {
                    res.status(400).json({ error: 'Invalid request' });
                }
        })
        .catch( error => res.status(400).json({ error}))             
    } else {
        res.status(400).json({ error: 'Invalid request' });
    }   
};