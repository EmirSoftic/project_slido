var express = require('express');
var io = null;
var router = express.Router();
var fje = require('../funkcije');
const jwt = require("jsonwebtoken");
var poruke = [];
var kljucevi = [];

/* GET home page. */
router.get('/:k', fje.vratiPitanja, function(req, res, next) {
    if(!io) {
        io = require('socket.io')(req.connection.server);
        console.info("Evo ih poruke");
        for(let i = 0; i < req.porukeUBazi.length; i++){
            poruke.push(req.porukeUBazi[i].tekst);
            console.info(req.porukeUBazi[i].tekst);
        }
        console.info("Evo ih kljucevi");
        for(let i = 0; i < req.porukeUBazi.length; i++){
            kljucevi.push(req.porukeUBazi[i].id);
            console.info(req.porukeUBazi[i].id);
        }
        io.sockets.on('connection', function (client) {
            client.emit('sve_poruke', poruke.toString());

            client.emit('poruke', 'Proba test');//Par poruka saljemo, moze i vise, ovako sve iz baze
            client.on('disconnect', function () {
                console.info("diskonected event");
            });
            client.on('nova_poruka', function (d) {
                poruke.push(d);
                io.emit('poruka_sa_servera', d);
            });
        });
    }

    res.render('predavanje');
});

router.get('/povecajLajk/:k', fje.lajkajPoruku, function(req, res, next) {
    console.info("povecao sam lajk i redirectan sam");
    console.info("EVO VRIJRFNOSTI PARAMETRA K");
    console.info(req.params.k);
    res.redirect('/predavanje/' + sifra_predavanja);
});

router.post('/', fje.provjeriPredavanje, function(req, res, next) {
    console.info("Evo je globalni dredavanje id");
    global.id_predavanja = req.predavanja[0].id;
    global.sifra_predavanja = req.predavanja[0].kod;
    console.info(id_predavanja);
    res.redirect('/predavanje/' + sifra_predavanja);
});

router.post('/postavi',fje.postaviPitanje, function (req,res,next){
    res.redirect('/predavanje/' + sifra_predavanja);
});


module.exports = router;
