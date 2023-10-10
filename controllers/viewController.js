const getHomepage = (req, res) => {
  res.status(200).render('base', {
    tour: 'The Amazing tour',
    user: 'longhoang',
  });
};

const getOverview = (req, res) => {
  res.status(200).render('overview', { title: 'All tours' });
};

const getTour = (req, res) => {
  res.status(200).render('tour', { tour: 'The Amazing tour', price: 100 });
};

module.exports = { getHomepage, getOverview, getTour };
