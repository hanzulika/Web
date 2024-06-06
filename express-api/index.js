import express from "express"; 
import mysql from 'mysql';
import { body, validationResult } from 'express-validator';

class Post { 
    constructor(id, title, body, author) { 
        this.id = id; 
        this.title = title; 
        this.body = body; 
        this.author = author; 
    } 
}

const app = express(); 
const port = 5500;

const connection = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: '2705', 
    database: 'tema' 
});

connection.connect((err) => {
    if (err) { 
        console.error('error connecting: ' + err.stack); 
        return; 
    }
    console.log('connected as id ' + connection.threadId);
});

app.use(express.json());

app.listen(port, () => { 
    console.log(`Server is running on port ${port}`); 
});

app.get('/', (req, res) => { 
    res.send('Hello World'); 
});

app.get("/posts", (req, res) => {
    connection.query('SELECT * FROM posts', (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else { 
            const posts = results.map(result => new Post(result.id, result.title, result.body, result.author)); 
            res.status(200).send(posts); 
        }
    });
});

app.get("/posts/:id", (req, res) => { 
    connection.query('SELECT * FROM posts WHERE id = ?', [req.params.id],(error, results) => { 
        if (error) { 
            res.status(500).send(error); 
        } else if (results.length === 0) { 
            res.status(404).send("Postarea nu exista"); 
        } else { 
            const post = new Post(results[0].id, results[0].title, results[0].body, results[0].author); 
            res.status(200).send(post); 
        } 
    }); 
});

app.post("/posts", 
    [
        body('title').isString().notEmpty().withMessage('Title is required'),
        body('body').isString().notEmpty().withMessage('Body is required'),
        body('author').isString().notEmpty().withMessage('Author is required')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newPost = new Post(null, req.body.title, req.body.body, req.body.author);
        connection.query('INSERT INTO posts SET ?', newPost, (error, results) => {
            if (error) {
                res.status(500).send(error);
            } else {
                newPost.id = results.insertId;
                res.status(201).send(newPost);
            }
        });
    }
);

app.put("/posts/:id", (req, res) => { 
    const updatedPost = new Post(req.params.id, req.body.title, req.body.body, req.body.author); 
    connection.query('UPDATE posts SET ? WHERE id = ?', [updatedPost, req.params.id], (error, results) => { 
        if (error) { 
            res.status(500).send(error); 
        } else if (results.affectedRows === 0) { 
            res.status(404).json({ error: "Postarea nu a fost gasita" }); 
        } else { 
            res.status(206).send(updatedPost); 
        } 
    }); 
});

app.delete("/posts/:id", (req, res) => {
    connection.query('DELETE FROM posts WHERE id = ?', [req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else if (results.affectedRows === 0) {
            res.status(404).json({error:"Postarea nu a fost gasita"});
        } else {
            res.status(204).send();
        }
    });
});

app.get("/posts/author/:author", (req, res) => {
    connection.query('SELECT * FROM posts WHERE author = ?', [req.params.author], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.send(results);
        }
    });
});

app.get("/posts/filter", (req, res) => {
    const { author, title } = req.query;
    let query = 'SELECT * FROM posts WHERE 1=1';
    let params = [];
  
    if (author) {
        query += ' AND author = ?';
        params.push(author);
    }
  
    if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
    }
  
    connection.query(query, params, (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.send(results);
        }
    });
});
  
app.patch("/posts/:id", [
    body('title').optional().isString().notEmpty().withMessage('Title is required'),
    body('body').optional().isString().notEmpty().withMessage('Body is required'),
    body('author').optional().isString().notEmpty().withMessage('Author is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const post = req.body;
    connection.query('UPDATE posts SET ? WHERE id = ?', [post, req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.send(results);
        }
    });
});
