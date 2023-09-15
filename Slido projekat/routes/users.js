var express = require('express');
var router = express.Router();
var fje = require('../funkcije');
var jwt = require('jsonwebtoken');
var db = require("../konekcija");
var nodemailer = require('nodemailer');
const {signedCookie} = require("cookie-parser");

const authadm = (req,res,next) =>{
    const token = req.cookies.admin_token;
    if(token){
        jwt.verify(token,"secret",(err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.render('admlogin');
            } else{
                next();
            }
        });
    } else{
        res.render('admlogin');
    }
}

const authprof = (req,res,next) =>{
    const token = req.cookies.professor_token;
    if(token){
        jwt.verify(token,"secret",(err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.render('prijava');
            } else{
                next();
            }
        });
    } else{
        res.render('prijava');
    }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/reg', function(req, res, next) {
  res.render('registracija');
});

router.post('/reg',
    fje.registrujKorisnika,
    function(req, res, next) {
      res.sendStatus(200);
    }
);

router.get('/login', function(req, res, next) {
  res.render('prijava');
});

router.post('/login',
    fje.provjeriKorisnika,
    function(req, res, next) {
        next();
    },
    fje.dajPodatke,
    function (req,res,next) {
        global.id = req.idProf;
        // JWT sa informacijama profesora
        let token = jwt.sign({id: req.idProf, ime: req.imeProf, prezime: req.prezimeProf, role: "professor"}, 'secret', { expiresIn: '24h' });
        // JWT da nestane nakon 24 sata, tj istek sesije
        res.cookie('professor_token', token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
        //res.render('predavac', {ime:req.imeProf, prezime:req.prezimeProf, id:req.idProf, pred:req.predavanja});

        res.redirect('/users/predavac');
    });

router.get('/predavac', authprof, fje.dajPodatkeZaProf,fje.dajImeZaProf, function (req,res,next){
  res.render('predavac', {ime:req.ime, prezime:req.prezime, id, pred:req.predavanja});
});

router.post('/predavac',
    fje.postaviPredavanje,
    function(req, res, next) {
      res.redirect('/users/predavac')
    }
);

router.get('/adminreg', function(req, res, next) {
  res.render('admreg');
});

router.post('/adminregistracija',
    fje.registrujAdmina,
    function(req, res, next) {
      res.sendStatus(200);
    }
);

router.get('/adminlogin', function(req, res, next) {
  res.render('admlogin');
});

router.post('/adminlogin',
    fje.provjeriAdmina,
    function(req, res, next) {
        next();
    },
    function(req,res,next){
        // JWT za admina
        let tokenAdmin = jwt.sign({role: "admin"}, 'secret', { expiresIn: '24h' });
        // JWT nestaje nekon 24h
        res.cookie('admin_token', tokenAdmin, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
        res.redirect('/users/admin');
    });


router.get('/admin', authadm, fje.dajPodatkeAdmin, function (req,res,next){
  res.render('admin', {predavanje:req.predavanja, profesori:req.profe});
});

router.get('/adminporuke', authadm, fje.dajPoruke, fje.dajNedozvoljene, function (req,res,next){
    console.info("Dosao sam u redirect za poruke");
    res.render('adminporuke', {poruke:req.poruke, nedozvoljene: req.rijeci});
});

router.post('/zabranjenarijec',
    fje.postaviNedozvoljenu,
    function(req, res, next) {
        res.redirect('/users/adminporuke')
    }
);

let K;

router.get('/editujnaziv/:k',authadm,(req, res)=>{
    K = req.params.k;
    res.render('editnaziv');
});

router.post('/editujnaziv',(req, res)=>{
    let str = req.body.naziv1;
    db.pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`update predavanja set naziv = $2 where naziv = $1 ` , [K, str], function (err, result) {
            done();
            if (err) {
                return res.send(err);

            } else{
                res.redirect('/users/admin');
            }

        });
    });

});

router.get('/posaljiMail/:k', authprof, (req, res) => {
    res.render('mailfajl', {kod: req.params.k});
});

router.post('/posaljimail', (req, res) => {
    let zaSlanje = req.body.mailadresa.split(/[,;]+/);
    let poruka = "http://localhost:3000/predavanje/" + req.body.kodpredavanja;
    console.info(poruka);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'e.softic2001@gmail.com',
            pass: 'qjuzchsjgzdylxvk'
        }
    });
    for(let i = 0; i < zaSlanje.length; i++){
        let mailOptions = {
            from: 'e.softic2001@gmail.com',
            to: zaSlanje[i],
            subject: 'KOD ZA PREDAVANJE',
            text: poruka
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    res.redirect('/users/predavac');
});

let V

router.get('/editujvrijeme/:v',authadm,(req, res)=>{
    V = req.params.v;
    res.render('editvrijeme');
});

router.post('/editujvrijeme',(req, res)=>{
    let vrij = req.body.novovrijeme;
    db.pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`update predavanja set vrijeme = $2 where vrijeme = $1 ` , [V, vrij], function (err, result) {
            done();
            if (err) {
                return res.send(err);

            } else{
                res.redirect('/users/admin');
            }

        });
    });

});

let B;

router.get('/blokirajprofesora/:k',authadm,(req, res)=>{
    B = req.params.k;
    res.render('blokprof');
});

router.post('/blokprof',(req, res)=>{
    let dani1 = req.body.dani;
    if(dani1 === 'petnaest'){
        db.pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            client.query(`UPDATE profesori SET blokiran = current_date + interval '15 days' WHERE email = $1;` , [B], function (err, result) {
                done();
                if (err) {
                    return res.send(err);

                } else{
                    console.info("Trebalo bi da sam ga zablokirung na 15 dana");
                    res.redirect('/users/admin');
                }

            });
        });
    } else{
        db.pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            client.query(`UPDATE profesori SET blokiran = current_date + interval '30 days' WHERE email = $1;` , [B], function (err, result) {
                done();
                if (err) {
                    return res.send(err);

                } else{
                    console.info("Trebalo bi da sam ga zablokirung na 30 dana");
                    res.redirect('/users/admin');
                }

            });
        });
    }
});


router.get('/noviPodaci/:k', fje.prikaziNeodgovorene, function(req, res) {
    console.info("Pozvao me brate bgm, evo kod");
    console.info(req.params.k);
    console.info("Evo i poruka");
    console.info(req.poruke);
    res.json(req.poruke);
});

router.get('/noviPodaciAbeceda/:k', fje.prikaziNeodgovoreneAbeceda, function(req, res) {
    console.info("Pozvao me brate bgm, evo kod");
    console.info(req.params.k);
    console.info("Evo i poruka");
    console.info(req.poruke);
    res.json(req.poruke);
});



router.get('/brisiprofesora/:k', fje.brisiPorukeID, fje.brisiPredavanjaSaID,fje.brisiProsefora,(req, res)=>{
    console.info("OBrisao sam i poruke i predavanja i profesora i sada idem na redirect");
    res.redirect('/users/admin');
});

router.get('/brisipredavanje/:k', authadm, fje.brisiPoruke, fje.brisiPredavanje,(req, res)=>{
    res.redirect('/users/admin');
});

router.get('/profbrisipredavanje/:k', authprof, fje.brisiPoruke, fje.brisiPredavanje,(req, res)=>{
    res.redirect('/users/predavac');
});

router.get('/prikaziNeodgovorene/:k', authprof, fje.prikaziNeodgovorene,(req, res)=>{
    req.poruke.sort(function(a, b) {
        return b.brojlajkova - a.brojlajkova;
    });
    console.info("Da vidimo kakve su te poruke kada se dignu iz neodg");
    console.info(req.poruke);
    res.render('modalNeodgovorene',{poruke:req.poruke, kod:req.params.k});
});

router.get('/prikaziNeodgovoreneAbeceda/:k', authprof, fje.prikaziNeodgovorene,(req, res)=>{
    req.poruke.sort(function(a, b) {
        return a.tekst.localeCompare(b.tekst);
    });
    res.render('modalNeodgovoreneAbeceda',{poruke:req.poruke, kod:req.params.k});
});

router.get('/prikaziOdgovorene/:k', authprof, fje.prikaziOdgovorene,(req, res)=>{
    res.render('modalOdgovorene',{poruke:req.poruke, kod:req.params.k});
});

router.get('/prikaziBlokirane/:k', authprof, fje.prikaziBlokirane,(req, res)=>{
    res.render('modalBlokirane',{poruke:req.poruke, kod:req.params.k});
});

router.get('/prikaziStatistiku/:k', authprof, fje.brojPoruka, fje.brojOdgovorenih ,(req, res)=>{
    res.render('modalStatistika',{brojPoruka:req.broj, kod:req.params.k, brojOdgovorenih: req.brojodg});
});

router.get('/odgovorio/:k', authprof, fje.vratiKod, fje.odgovoriPoruku,(req, res)=>{
    console.info("Evo me pred redirectom");
    console.info(req.kodpredavanja);
    res.redirect('/users/prikaziNeodgovorene/' + req.kodpredavanja[0].kod);
});

router.get('/odgovorioblokirano/:k', authprof, fje.vratiKod, fje.odgovoriBlokiranu,(req, res)=>{
    res.redirect('/users/prikaziBlokirane/' + req.kodpredavanja[0].kod);
});

router.get('/blokirao/:k', authprof, fje.blokiraoPoruku, (req, res)=>{
    res.redirect('/users/prikaziNeodgovorene/' + req.kodpredavanja[0].kod);
});

router.get('/logout', function(req, res){
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/users/login');
});

router.get('/logoutadmin', function(req, res){
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/users/adminlogin');
});

router.get('/krupnikod/:k', authprof, function(req, res){
    res.render('kod', {kod:req.params.k});
});

module.exports = router;
