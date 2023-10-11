const Tour = require('../models/tourModel');

const getHomepage = (req, res) => {
  res.status(200).render('base', {
    tour: 'The Amazing tour',
    user: 'longhoang',
  });
};

const getOverview = async (req, res) => {
  //1 get tours data from collection
  const tours = await Tour.find();
  // console.log(tours);
  //2 building template for tour card
  //3 render tour card template with tour data
  res.status(200).render('overview', { title: 'All tours', tours });
};

const getTour = (req, res) => {
  res.status(200).render('tour', { tour: 'The Amazing tour', price: 100 });
};

module.exports = { getHomepage, getOverview, getTour };
