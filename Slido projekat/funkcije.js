const bcrypt = require("bcrypt");
var db = require("./konekcija");

let pomocne_funkcije = {
    sifriraj: function (sifra){
        var sifriranaSifra = bcrypt.hashSync(sifra,10);
        return sifriranaSifra;
    }
}

let fje = {
    registrujKorisnika:function (req,res,next){

        var korisnik = {
            email: req.body.email,
            ime:req.body.ime,
            prezime:req.body.prezime,
            sifra:pomocne_funkcije.sifriraj(req.body.sifra)
        };

        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`INSERT INTO profesori (email,ime,prezime,sifra)
         VALUES($1,$2, $3, $4)`,
                [korisnik.email,korisnik.ime,korisnik.prezime,korisnik.sifra],
                function (err,result){
                    done();
                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        res.redirect('/users/login');
                    }
                });
        });
    },
    provjeriKorisnika:function (req,res,next){
        var korisnik = {
            email: req.body.email,
            sifra: req.body.sifra
        };
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`SELECT * FROM profesori WHERE email=$1 AND blokiran < current_date`,
                [korisnik.email],
                function (err,result){
                    done();

                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        if(result.rows.length === 0){
                            return res.redirect('/');
                        } else {
                            let sifraUBazi = result.rows[0].sifra;
                            req.imeProf = result.rows[0].ime;
                            req.prezimeProf = result.rows[0].prezime;
                            req.idProf = result.rows[0].id;
                            if(bcrypt.compareSync(korisnik.sifra, sifraUBazi)) {
                                res.korisnik = {
                                    email: result.rows[0].email,
                                    ime: result.rows[0].ime,
                                    prezime: result.rows[0].prezime
                                };
                                next();
                            } else{
                                return  res.sendStatus(401);
                            }
                        }
                    }
                });
        });
    },
    dajPodatke: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT id,naziv,kod,vrijeme,ponavljanje,profesorid, to_char(datum,'DD-MM-YYYY') as datum FROM predavanja where profesorid = $1`,[req.idProf],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.predavanja = result.rows;
                    next();
                }
            });
        });
    },
    dajPodatkeZaProf: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT predavanja.id,naziv,kod,vrijeme,ponavljanje,profesorid, to_char(datum,'DD-MM-YYYY') as datum FROM predavanja WHERE profesorid = $1 and datum >= current_date`,[id],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.predavanja = result.rows;
                    next();
                }
            });
        });
    },
    dajImeZaProf: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT * FROM profesori where id = $1`,[id],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.ime = result.rows[0].ime;
                    req.prezime = result.rows[0].prezime;
                    next();
                }
            });
        });
    },
    postaviPredavanje:function (req,res,next){
        var predavanje = {
            naziv: req.body.naziv,
            kod:req.body.kod,
            vrijeme:req.body.vrijeme,
            ponavljanje:req.body.ponavljanje,
            datum: req.body.datumdo,
            id: global.id,
        };
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`INSERT INTO predavanja (naziv,kod,vrijeme,ponavljanje,profesorid, datum)
         VALUES($1,$2, $3, $4, $5, $6)`,
                [predavanje.naziv,predavanje.kod,predavanje.vrijeme,predavanje.ponavljanje, predavanje.id, predavanje.datum],
                function (err,result){
                    done();
                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        next();
                    }
                });
        });
    },
    postaviNedozvoljenu:function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`INSERT INTO nezeljene_rijeci (rijec) VALUES($1)`,
                [req.body.rijec],
                function (err,result){
                    done();
                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        next();
                    }
                });
        });
    },
    dajNedozvoljene: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`SELECT * FROM nezeljene_rijeci`, [], function (err,result){
                    done();
                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        req.rijeci = result.rows;
                        next();
                    }
                });
        });
    },
    postaviPitanje:function (req,res,next){
        var poruka = req.body.tekstporuke;

        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`INSERT INTO poruke (tekst, predavanja_id)
         VALUES($1,$2)`,
                [poruka, id_predavanja],
                function (err,result){
                    done();
                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        next();
                    }
                });
        });
    },
    vratiPitanja:function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT * FROM poruke
                            inner join predavanja p on poruke.predavanja_id = p.id
                            where p.kod = $1 AND poruke.neodg = $2;`,[req.params.k , true],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.porukeUBazi = result.rows;
                    console.info("Evo ih poruke koje saljem");
                    console.info(req.porukeUBazi);
                    next();
                }
            });
        });
    },
    registrujAdmina:function (req,res,next){
        var admin = {
            email: req.body.email,
            ime:req.body.ime,
            prezime:req.body.prezime,
            sifra:pomocne_funkcije.sifriraj(req.body.sifra)
        };
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`INSERT INTO admini (ime,prezime,email,password)
         VALUES($1,$2, $3, $4)`,
                [admin.ime,admin.prezime,admin.email,admin.sifra],
                function (err,result){
                    done();
                    if(err){
                        console.info("PROSAO SAM UPIT");
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        console.info(result);
                        res.redirect('/users/adminlogin');
                    }
                });
        });
    },
    provjeriAdmina:function (req,res,next){
        var admin = {
            email: req.body.email,
            password: req.body.password
        };
        db.pool.connect(function (err,client,done){
            if(err){
                res.send('{"error" : "Error" , "status" : 500');
            }
            client.query(`SELECT * FROM admini WHERE email=$1`,
                [admin.email],
                function (err,result){
                    done();

                    if(err){
                        console.info(err);
                        res.sendStatus(500);
                    } else {
                        if(result.rows.length === 0){
                            return res.sendStatus(404);
                        } else {
                            let sifraUBazi = result.rows[0].password;
                            if(bcrypt.compareSync(admin.password, sifraUBazi)) {
                                res.admin = {
                                    email: result.rows[0].email,
                                    ime: result.rows[0].ime,
                                    prezime: result.rows[0].prezime
                                };
                                next();
                            } else{
                                return  res.sendStatus(401);
                            }
                        }
                    }
                });
        });
    },
    dajPodatkeAdmin: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT predavanja.id,naziv,kod,vrijeme,ponavljanje,profesorid, to_char(datum,'DD-MM-YYYY') as datum FROM predavanja inner join
                            profesori p on p.id = predavanja.profesorid where datum >= current_date`,[],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.predavanja = result.rows;
                }
            });
        });
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT * FROM profesori`,[],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.profe = result.rows;
                    console.info("Dao sam profe, idem dalje");
                    next();
                }
            });
        });
    },
    dajPoruke: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`select * from poruke inner join predavanja p on p.id = poruke.predavanja_id;`,[],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.poruke = result.rows;
                    console.info("Dao sam poruke, idem dalje");
                    console.info(req.poruke);
                    next();
                }
            });
        });
    },
    brisiPorukeID: function (req,res,next){
        db.pool.connect(function (err,client,done){
            console.info("Dosao sam do brisiPorukeID u bazu");
            console.info()
            if(err){
                return res.send(err);
            }
            client.query(`DELETE FROM poruke
                            WHERE id IN (
                            SELECT poruke.id
                             FROM poruke
                             INNER JOIN predavanja p on p.id = poruke.predavanja_id
                             INNER JOIN profesori p2 on p2.id = p.profesorid
                             WHERE p2.id = $1); `, [req.params.k],function (err,result){
                done();
                if(err){
                    console.info("Ali evo upit prosao nisam");
                    return res.send(err);
                } else{
                    console.info("OBRISAO SAM SVE PORUKE ZA TOG PROFESORA");
                    next();
                }
            })
        })
    },
    brisiPoruke: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query(`DELETE FROM poruke WHERE predavanja_id = $1`, [req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                } else{
                    next();
                }
            })
        })
    },
    brisiPredavanje: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query(`DELETE FROM predavanja WHERE id = $1`, [req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                } else{
                    next();
                }
            })
        })
    },
    brisiPredavanjaSaID: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query(`DELETE FROM predavanja WHERE profesorid = $1`, [req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                } else{
                    console.info("OBRISAO SAM SVE pREDAVANJA ZA TOG PROFESORA");
                    next();
                }
            })
        })
    },
    brisiProsefora: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query(`DELETE FROM profesori WHERE id = $1`, [req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                } else{
                    console.info("Brisem profesora");
                    next();
                }
            })
        })
    },
    provjeriPredavanje: function (req,res,next){
        db.pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            console.info("Provjeravam predavanje");
            console.info("Sa kodom");
            console.info(req.body.kod);
            client.query(`SELECT * FROM predavanja where kod = $1 and datum >= current_date;`, [req.body.kod],function (err,result){
                done();
                if(err){
                    return res.send(err);
                } else{
                    if(result.rows.length === 0) {
                        return res.redirect('/');
                    } else {
                        req.predavanja = result.rows;
                        next();
                    }
                }
            })
        })
    },
    prikaziNeodgovorene: function (req,res,next){
        console.info("Da li je ovo kod predavanja:");
        console.info(req.params.k);
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT poruke.id, poruke.tekst, poruke.brojlajkova FROM poruke
                            inner join predavanja p on p.id = poruke.predavanja_id
                            where neodg = $1 and kod = $2 order by poruke.brojlajkova desc;`,[true, req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.poruke = result.rows;
                    next();
                }
            });
        });
    },
    prikaziNeodgovoreneAbeceda: function (req,res,next){
        console.info("Da li je ovo kod predavanja:");
        console.info(req.params.k);
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT poruke.id, poruke.tekst, poruke.brojlajkova FROM poruke
                            inner join predavanja p on p.id = poruke.predavanja_id
                            where neodg = $1 and kod = $2 order by poruke.tekst;`,[true, req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.poruke = result.rows;
                    next();
                }
            });
        });
    },
    vratiKod:function (req,res,next){
        console.info("Ovo bi trebao biti id poruke na koju sam odgovorio");
        console.info(req.params.k);
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`select p.kod from poruke inner join predavanja p on p.id = poruke.predavanja_id
                            where poruke.id = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.kodpredavanja = result.rows;
                    console.info("Evo taj kod");
                    console.info(req.kodpredavanja);
                    next();
                }
            });
        });
    },
    odgovoriPoruku: function (req,res,next){
        console.info("Evo me u odg poruku");
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            console.info("trebalo bi da setam true na odgovor za onu poruku sa idom");
            console.info(req.params.k);
            client.query(`UPDATE poruke SET odg = true, neodg = false WHERE id = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    next();
                    console.info("Imam sada i kod gdje se vracam:");
                    console.info(req.kodpredavanja);
                }
            });
        });
    },
    odgovoriBlokiranu: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`UPDATE poruke SET odg = true, blok = false WHERE id = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    next();
                }
            });
        });
    },
    blokiraoPoruku: function (req,res,next){
        console.info("U BLOKIRAJ PORUKU SAM");
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`select p.kod from poruke inner join predavanja p on p.id = poruke.predavanja_id
                            where poruke.id = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.kodpredavanja = result.rows;
                    console.info("U blokiraj poruk prvi upit evo kod predavanja");
                    console.info(req.kodpredavanja);
                }
            });
        });
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`UPDATE poruke SET blok = true, neodg = false WHERE id = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    console.info("Evo kod predavanja");
                    console.info(req.kodpredavanja);
                    next();
                }
            });
        });
    },
    prikaziOdgovorene: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT * FROM poruke
                        inner join predavanja p on p.id = poruke.predavanja_id
                        where odg = $1 and kod = $2;`,[true, req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.poruke = result.rows;
                    next();
                }
            });
        });
    },
    prikaziBlokirane: function (req,res,next){
        console.info("evo me u prikazi blokirane, sa kodom trazim");
        console.info(req.params.k);
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT poruke.id, poruke.tekst, poruke.predavanja_id, poruke.brojlajkova, poruke.odg, poruke.neodg, poruke.blok FROM poruke
                        inner join predavanja p on p.id = poruke.predavanja_id
                        where poruke.blok = $1 and p.kod = $2;`,[true, req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.poruke = result.rows;
                    console.info("prikazala sam blokirane");
                    next();
                }
            });
        });
    },
    brojPoruka: function (req,res,next){
        db.pool.connect(function(err,client,done){
            console.info("Evo ovo je kod poruka");
            console.info(req.params.k);
            if(err){
                res.send(err);
            }
            client.query(`SELECT COUNT(odg) FROM poruke
                inner join predavanja p on p.id = poruke.predavanja_id
                 where kod = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.broj = result.rows;
                    next();
                }
            });
        });
    },
    brojOdgovorenih: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`SELECT COUNT(odg) FROM poruke
                  inner join predavanja p on p.id = poruke.predavanja_id
                  WHERE odg = $1 and kod = $2 ;`,[true, req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    req.brojodg = result.rows;
                    next();
                }
            });
        });
    },
    lajkajPoruku: function (req,res,next){
        db.pool.connect(function(err,client,done){
            if(err){
                res.send(err);
            }
            client.query(`UPDATE poruke SET brojlajkova = brojlajkova + 1 where tekst = $1;`,[req.params.k],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }else{
                    next();
                }
            });
        });
    }
}

module.exports = fje;
