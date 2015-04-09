var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var yaml = require('js-yaml');
var fs   = require('fs')
var session = require('cookie-session')
var sha256 = require('js-sha256')

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express()

app.use(session({ secret: 's3cr3tind3chiffrabl3' }))

.use(express.static(__dirname + '/static'))

.get('/', function(req, res){
    res.render('index.ejs', { session: req.session })
})

.post('/login', urlencodedParser, function(req, res){
    /*console.log(req.body.inputEmail)
    console.log(req.body.inputPassword)*/
    var email = req.body.inputEmail.toLowerCase()
    var password = req.body.inputPassword
    var hashedPassword = sha256(req.body.inputPassword)
    fs.readdir(__dirname + '/static/members', function(err, files){
        for (var i = 0; i < files.length; i++) {
            if (files[i] == email){
                console.log("Tentative de connexion de l\'utilisateur '"+email+"'")
                try {
                    var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/static/members/' + files[i] + '/user.yml', 'utf8'));
                    /*console.log(doc)
                    console.log(doc.pass + '|' + hashedPassword)*/
                    if (doc.pass == hashedPassword){
                        console.log("Connexion de '"+doc.email+"' réussie")
                        req.session.email = doc.email
                        req.session.account = doc.account
                        console.log(req.session)
                        res.redirect('/')
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
    })
})

.get('/login', function(req, res){
    res.render('login.ejs', { session: req.session })
})

app.listen(8080)