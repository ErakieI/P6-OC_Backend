const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true }
    }
  ],
  averageRating: { type: Number, default: 0 }
});

// Middleware pour calculer la moyenne des notes
bookSchema.pre('save', function(next) {
  const totalRatings = this.ratings.length;
  if (totalRatings === 0) {
    this.averageRating = 0; // 0 Par défaut
  } else {
    const totalGrades = this.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    this.averageRating = totalGrades / totalRatings; //Calcul de la moyenne
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
