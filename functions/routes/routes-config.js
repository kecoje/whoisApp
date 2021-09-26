const { Application } = require("express");
const whois = require('whois')
const punycode = require('punycode');
function isASCII(str) { return /^[\x00-\x7F]*$/.test(str); }
const dns = require('dns');
const cron = require('node-cron');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//admin.initializeApp(functions.config().firebase);

const fcm = admin.messaging();

exports.routesConfig = app => {
    // looks up whois and dns
    app.post('/lookup',
        lookup
    );
    // adds token to waiting list
    app.post('/notifications/set',
        setNotify
    );
    // removes token from waiting list
    app.post('/notifications/remove',
        removeNotify
    );
}

var waiting = {};

lookup = async (req, res) => {

    const { address } = req.body;

    let adr = punycode.toASCII(address)
    //console.log("PUNY : " + adr)
    //console.log("OBICNA: " + address)
    if ((adr.match(/\:\/\//g) || []).length > 0) {
        niz = adr.split("://")
        adr = niz[1]
    }
    if ((adr.match(/\//g) || []).length > 0) {
        niz = adr.split("/")
        adr = niz[0]
    }
    if ((adr.match(/./g) || []).length > 1) {
        niz = adr.split(".");
        adr = niz[niz.length - 2] + "." + niz[niz.length - 1]
    }

    //console.log(adr)

    try {
        var dnsOut;
        dns.resolveAny(adr, (err, ret) => {
            dnsOut = ret
        });
        whois.lookup(adr, function (err, data) {

            var match;
            //console.log(data)
            var regx = /[dD]omain [nN]ame: ([^(\\\r\\\n)]*)/g
            var dnResReg = (regx.exec(data))
            var dnRes = null
            if (dnResReg != null) {
                dnRes = dnResReg[1]
            } else {
                regx = /[dD]omain: ([^(\\r\\\n)]*)/g
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    dnRes = dnResReg[1]
                }
                else {
                    res.send({
                        "message": "Domen ne postoji"
                    });
                    return;
                }
            }
            regx = /[rR]egistration [dD]ate: ([^(\\\r\\\n)]*)/g
            var rdResReg = (regx.exec(data))
            var rdRes = null
            if (rdResReg != null) {
                rdRes = rdResReg[1]
            }
            else {
                regx = /created: ([^(\\\r\\\n)]*)/g
                var rdResReg = (regx.exec(data))
                var rdRes = null
                if (rdResReg != null) {
                    rdRes = rdResReg[1]
                }
                else {
                    regx = /[cC]reation [dD]ate: ([^(\\\r\\\n)]*)/g
                    var rdResReg = (regx.exec(data))
                    var rdRes = null
                    if (rdResReg != null) {
                        rdRes = rdResReg[1]
                    }
                    else {
                        regx = /[rR]egistered: ([^(\\\r\\\n)]*)/g
                        var rdResReg = (regx.exec(data))
                        var rdRes = null
                        if (rdResReg != null) {
                            rdRes = rdResReg[1]
                        }
                    }
                }
            }



            regx = /[eE]xpiration [dD]ate: ([^(\\\r\\\n)]*)/g
            var edResReg = (regx.exec(data))
            var edRes = null
            if (edResReg != null) {
                edRes = edResReg[1]
            }
            else {
                regx = /[pP]aid-till: ([^(\\\r\\\n)]*)/g
                var edResReg = (regx.exec(data))
                var edRes = null
                if (edResReg != null) {
                    edRes = edResReg[1]
                }
                else {
                    regx = /[eE]xpire[s]?: ([^(\\\r\\\n)]*)/g
                    var edResReg = (regx.exec(data))
                    var edRes = null
                    if (edResReg != null) {
                        edRes = edResReg[1]
                    }
                }
            }

            regx = /[rR]egistrar: ([^(\\\r\\\n)]*)/g
            var registrarResReg = (regx.exec(data))
            var registrarRes = null
            if (registrarResReg != null) {
                registrarRes = registrarResReg[1]
            }

            regx = /[rR]egistrar URL: ([^(\\\r\\\n)]*)/g
            var registrarUrlResReg = (regx.exec(data))
            var registrarUrlRes = null
            if (registrarUrlResReg != null) {
                registrarUrlRes = registrarUrlResReg[1]
            }

            regx = /[rR]egistrant: ([^(\\\r\\\n)]*)/g
            var registrantResReg = (regx.exec(data))
            var registrantRes = null
            if (registrantResReg != null) {
                registrantRes = registrantResReg[1]
            }
            else {
                regx = /[oO]rg: ([^(\\\r\\\n)]*)/g
                var registrantResReg = (regx.exec(data))
                var registrantRes = null
                if (registrantResReg != null) {
                    registrantRes = registrantResReg[1]
                }
                else {
                    regx = /[rR]egistrant [oO]rgani[zs]ation: ([^(\\\r\\\n)]*)/g
                    var registrantResReg = (regx.exec(data))
                    var registrantRes = null
                    if (registrantResReg != null) {
                        registrantRes = registrantResReg[1]
                    }
                    else {
                        regx = /[hH]older: ([^(\\\r\\\n)]*)/g
                        var registrantResReg = (regx.exec(data))
                        var registrantRes = null
                        if (registrantResReg != null) {
                            registrantRes = registrantResReg[1]
                        }
                    }
                }
            }

            res.send({
                "whoisOut": {
                    "Domain Name": dnRes,
                    "Registration Date": rdRes,
                    "Expiration Date": edRes,
                    "Registrar": registrarRes,
                    "Registrar URL": registrarUrlRes,
                    "Registrant": registrantRes,
                },
                dnsOut
            });
        })
    }
    catch (e) {
        res.status(400).send({
            message: "Error!"
        })
    }
}

setNotify = (req, res) => {
    var data = req.body;
    try {
        const { name, token } = data;

        if (name in waiting) {
            if (!waiting[name].includes(token))
                waiting[name].push(token)
            else
                res.send({
                    text: "Token: " + token + " already the server"
                });
        } else {
            waiting[name] = [token]
        }

        console.log(waiting)
        res.send({
            text: "Token: " + token + " has been sent to the server"
        });
    } catch (e) {
        console.log(e.message);
    }
};

removeNotify = (req, res) => {
    var data = req.body;
    try {
        const { name, token } = data;

        if (name in waiting) {
            const index = waiting[name].indexOf(token);
            if (index > -1) {
                waiting[name].splice(index, 1);
            }
            if (waiting[name].length == 0)
                delete waiting[name]
        } else {
            res.send({
                text: "Token: " + token + " doesn't exist on the server"
            });
        }
        console.log(waiting)
        res.send({
            text: "Token: " + token + " has been removed from the server"
        });
    } catch (e) {
        console.log(e.message);
    }
};

getExp = async (address, callback) => {

    adr = address
    if ((adr.match(/\:\/\//g) || []).length > 0) {
        niz = adr.split("://")
        adr = niz[1]
    }
    if ((adr.match(/\//g) || []).length > 0) {
        niz = adr.split("/")
        adr = niz[0]
    }
    if ((adr.match(/./g) || []).length > 1) {
        niz = adr.split(".");
        adr = niz[niz.length - 2] + "." + niz[niz.length - 1]
    }
    try {

        whois.lookup(adr, function (err, data) {

            var match;

            var regx = /Domain [nN]ame: ([^(\\\r\\\n)]*)/g
            var dnResReg = (regx.exec(data))
            var dnRes = null
            if (dnResReg != null) {
                dnRes = dnResReg[1]
            } else {
                return null;
            }

            regx = /Expiration [dD]ate: ([^(\\\r\\\n)]*)/g
            var edResReg = (regx.exec(data))
            var edRes = null
            if (edResReg != null) {
                edRes = edResReg[1]
            }

            callback(edRes)
        })

    }
    catch (e) {
        return null
    }
};

cron.schedule('*/100 * * * * *', () => {
    console.log('running a task in 100 seconds');
    //console.log("kurac");
    for (const [domainName, tokenArray] of Object.entries(waiting)) {
        // current time in miliseconds
        milisec = new Date().getTime();
        // call function with param waiting[i].name (eg. example.com)
        //exp = await getExp(waiting[i].name);
        //expmilisec = Date.parse(exp);
        var expmilisec;
        getExp(domainName, (expmilisec) => {
            // ask if current time is equal to the expiration time
            //Nameran bag (true)
            if (milisec > Date.parse(expmilisec) || true) {
                // if yes then send the notification using all the tokens
                while (tokenArray !== undefined && tokenArray.length > 0) {
                    tokencic = tokenArray.pop();

                    notification = {
                        title: "Domain name " + domainName + " has expired",
                        body: "Click here to check current status",
                        token: tokencic,
                    }

                    const payload = {
                        notification: {
                            title: notification.title,
                            body: notification.body,
                            //icon: "@drawable/launcher_icon",
                            clickAction: "FLUTTER_NOTIFICATION_CLICK"
                        },
                        data: {
                            title: notification.title,
                            message: notification.body,
                            unlock: domainName,
                        }
                    };

                    console.log(domainName, tokencic)
                    fcm.sendToDevice(notification.token, payload);
                }
            }
        })
    }
})