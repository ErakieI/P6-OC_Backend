const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
 };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  };

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {

    const {rating} = req.body;
    if (!req.auth.userId || !rating) {
        return res.status(400).json({error: 'userId ou note manquante'});
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 5' });
    }

    Book.findOne({_id: req.params.id})
        .then(book => {
            if (!book) {
                return res.status(404).json({error: 'Book introuvable'});
            }
            else if(book.ratings.find(rating => rating.userId === req.auth.userId)) {
                return res.status(400).json({error: 'Vous avez déjà noté ce livre'});
            }

            const ratingScore = {
                userId: req.auth.userId,
                grade: rating,
            };

            book.ratings.push(ratingScore);

            const totalRatings = book.ratings.length;
            const totalGrades = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
            book.averageRating = parseFloat((totalGrades / totalRatings).toFixed(1));

            book.save()
                .then(() => res.status(200).json(book))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};


exports.bestRating = (req, res, next) => {
    Book.find()
        .then(books => {
            const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
            const topThreeBooks = sortedBooks.slice(0, 3);
            res.status(200).json(topThreeBooks);
        })
        .catch(error => res.status(400).json({ error }));
};