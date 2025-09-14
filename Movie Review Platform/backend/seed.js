const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

const movies = [
  {
    title: 'The Shawshank Redemption',
    genre: ['Drama'],
    releaseYear: 1994,
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman'],
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterURL: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZ2FkZDRlM2ViYzNiXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.',
    trailerURL: 'https://www.youtube.com/embed/6hB3S9bOqvQ',
  },
  {
    title: 'The Dark Knight',
    genre: ['Action', 'Crime', 'Drama'],
    releaseYear: 2008,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterURL: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    trailerURL: 'https://www.youtube.com/embed/EXe4s_9-sWw',
  },
  {
    title: 'Pulp Fiction',
    genre: ['Crime', 'Drama'],
    releaseYear: 1994,
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster\'s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterURL: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLTk2NzgtZGUzZmYxNmMyNTg0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.',
    trailerURL: 'https://www.youtube.com/embed/s75_g7_s_7s',
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    genre: ['Action', 'Adventure', 'Drama'],
    releaseYear: 2003,
    director: 'Peter Jackson',
    cast: ['Elijah Wood', 'Viggo Mortensen', 'Ian McKellen'],
    synopsis: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
    posterURL: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.',
    trailerURL: 'https://www.youtube.com/embed/r5X-hFf6Bwo',
  },
  {
    title: 'Forrest Gump',
    genre: ['Drama', 'Romance'],
    releaseYear: 1994,
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
    posterURL: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtYjU4Ny00YjA4LTkwMTYtNzMyZTZhYjQxNTRlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.',
    trailerURL: 'https://www.youtube.com/embed/bLvqoHBptjg',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await Movie.deleteMany({});
    console.log('Existing movies removed');

    await Movie.insertMany(movies);
    console.log('Movies seeded successfully');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
};

seedDB();