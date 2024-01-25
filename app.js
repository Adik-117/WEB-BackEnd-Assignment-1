const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path'); // Import path module

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'web',
  password: 'Infinity2021.',
  port: 5432,
});

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the 'views' directory
app.set('view engine', 'ejs'); // Set EJS as the view engine

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport.js setup
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: 'Incorrect username or password' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
    if (err) {
      return done(err);
    }

    const user = result.rows[0];
    done(null, user);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/homepage.html');
});

app.get('/userexist', (req, res) => {
  res.sendFile(__dirname + '/userexist.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/nouser', (req, res) => {
  res.sendFile(__dirname + '/nouser.html');
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/nouser', // Redirect to nouser.html if authentication fails
  })(req, res, next);
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  const role = req.user.role;
  res.sendFile(__dirname + `/${role}_dashboard.html`);
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

app.get('/delete-users', isAuthenticated, async (req, res) => {
  try {
    // Query the database to get a list of user names
    const queryResult = await pool.query('SELECT username FROM users');

    // Render the delete_user.html page with dynamically generated dropdown options
    res.render('delete_user.ejs', { users: queryResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/delete-users', isAuthenticated, async (req, res) => {
  try {
    const selectedUser = req.body.users;

    // Add your logic here to delete the user from the database
    await pool.query('DELETE FROM users WHERE username = $1', [selectedUser]);

    // Redirect back to the admin_dashboard after deletion
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/signup', async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  // Basic password validation
  if (password !== confirmPassword) {
    return res.send('Passwords do not match. Please try again.');
  }

  try {
    // Check if the username already exists in the database
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      return res.redirect('/userexist'); // Redirect to userexist.html if the username exists
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database with hashed password and role information
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [username, hashedPassword, role]);

    res.redirect('/login');
  } catch (err) {
    console.error(err); // Log the error
    res.send('Error creating user. Please try again.');
  }
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
