const express = require('express');
// const multer=require('multer');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const Book = require('../models/bookmodel');
const Author = require('../models/authormodel');
// const uploadPath=path.join('public',Book.coverImageBasePath);
const imageMimeType = ['image/jpeg', 'image/png', 'image/gif'];
// const upload=multer({
//     dest:uploadPath
// });
// -------------------routes----------------
// All Books Routes
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch  {
        res.redirect('/')
    }

});
// new book route

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })

    } catch{
        res.redirect('/')
    }

})
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch  {
        res.redirect('/')
    }



});


//create book route
router.post('/', async (req, res) => {
    //  const fileName=req.file!=null ? req.file.filename :null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.coverImageName);

    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
        // res.redirect('/Books');
    } catch (err) {
        console.log(err);
        renderNewPage(res, book, true);
    }
});



// ------------------------------update----------------------
router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.coverImageName != null && req.body.coverImageName !== ' ') {
            //  console.log(book)
            saveCover(book, req.body.coverImageName)
        }
        await book.save()
        res.redirect(`/Books/${book.id}`);
    } catch (err) {
        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/')
        }


    }
});


router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch{
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could Not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})


// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath,fileName),err=>{
//         if(err) console.error(err);

//     });
// }


// -------------------functions----------------------

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError = false)

}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeType.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError = false)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Editing Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`./books/${form}`, params);
    } catch{
        res.redirect('/books');
    }
}



module.exports = router;