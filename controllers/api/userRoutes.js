const router = require('express').Router();

const { User, Day, Log, Score} = require('../../models');


router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll()

        if(!userData){
            res.status(404).json({error: 404, message : "Cannot find any Users" });
            return
        }

        res.status(200).json(userData);

    } catch (err) {
        res.status(400).json(err);
    }
})

router.get('/days/:id', async (req, res) => {
  try {
      const userData = await User.findByPk(req.params.id, {
        include : [{model : Day, include: [Score]}]
      })

      if(!userData){
          res.status(404).json({error: 404, message : "Cannot find any Users" });
          return
      }

      res.status(200).json(userData);

  } catch (err) {
      res.status(400).json(err);
  }
})

router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

    });
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });
    console.log(userData);
    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.json({ user: userData, message: 'You are now logged in!', user_id : req.session.user_id });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
