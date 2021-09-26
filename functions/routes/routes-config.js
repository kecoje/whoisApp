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

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

var waiting = {};

function toUnixTime(datum) {
    if (datum.toString()[4] == '-') {
        return Date.parse(datum.toString().substring(0, 10))
    }
    if (datum.toString()[2] == '.') {
            let day = datum.substring(0, 2)
            let month = datum.substring(3, 5)
            let year = datum.substring(6, 10)
            return Date.parse(year + "-" + month + "-" + day)
    }
    if (datum.toString()[2] == '-'){
        let day=datum.substring(0,2)
        let month=datum.substring(3,6)
        let year=datum.substring(7,11)
        switch(month){
            case 'Jan':{month=1
                        break}
            case 'Feb':{month=2
                        break}
            case 'Mar':{month=3
                        break}
            case 'Apr':{month=4
                        break}
            case 'May':{month=5
                        break}
            case 'Jun':{month=6
                        break}
            case 'Jul':{month=7
                        break}
            case 'Aug':{month=8
                        break}
            case 'Sep':{month=9
                        break}
            case 'Oct':{month=10
                        break}
            case 'Nov':{month=11
                        break}
            case 'Dec':{month=12
                        break}
        }
        return Date.parse(year + "-" + month + "-" + day)
    }
    return datum;
 }
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
    domLst = ""
    if ((adr.match(/./g) || []).length > 0) {
        niz = adr.split(".");
        domLst = niz[niz.length-1]
    }
    console.log(domLst)
    
    
    try {
        var dnsOut;
        var ipv4Ret;
        var ipv6Ret;
        var ipvcnameRet;
        var ipcaaret;
        var ipmxret;
        var ipnptrret;
        var ipsoaret;
        var ipsrvret;
        var iptxtret;
        var foundv4 = false;
        var foundv6 = false;
        var foundcname = false;
        var foundcaa = false;
        var foundmx = false;
        var foundnptr = false;
        var foundsoa = false;
        var foundsrv = false;
        var foundtxt = false;
        for(var j = 0; j < 3; j++)
        {
            if(!foundv4){
                dns.resolve4(adr, (err, ret) => {
                    ipv4Ret = ret
                    
                    if(!(ipv4Ret === undefined))
                    {
                        foundv4 = true;
                    }   
                });
            }
            if(!foundv6){
                dns.resolve6(adr, (err, ret) => {
                    ipv6Ret = ret
                    
                    if(!(ipv6Ret === undefined))
                    {
                        foundv6 = true;
                    }   
                });
            }
            if(!foundcname){
                dns.resolveCname(adr, (err, ret) => {
                    ipvcnameRet = ret
                    if(!(ipvcnameRet === undefined))
                    {
                        foundcname = true;
                    }   
                });
            }
            if(!foundcaa){
                dns.resolveCaa(adr, (err, ret) => {
                    ipcaaret = ret
                    
                    if(!(ipcaaret === undefined))
                    {
                        foundcaa = true;
                    }   
                });
            }
            if(!foundmx){
                dns.resolveMx(adr, (err, ret) => {
                    ipmxret = ret
                    
                    if(!(ipmxret === undefined))
                    {
                        foundmx = true;
                    }
                });
            }
            if(!foundnptr){
                dns.resolveNaptr(adr, (err, ret) => {
                    ipnptrret = ret
                    
                    if(!(ipnptrret === undefined))
                    {
                        foundnptr = true;
                    }   
                });
            }
            if(!foundsoa){
                dns.resolveSoa(adr, (err, ret) => {
                    ipsoaret = ret
                    
                    if(!(ipsoaret === undefined))
                    {
                        foundsoa = true;
                    }
                });
            }
            if(!foundsrv){
                dns.resolveSrv(adr, (err, ret) => {
                    ipsrvret = ret
                    
                    if(!(ipsrvret === undefined))
                    {
                        foundsrv = true;
                    }   
                });
            }
            if(!foundtxt){
                dns.resolveTxt(adr, (err, ret) => {
                    iptxtret = ret
                    
                    if(!(iptxtret === undefined))
                    {
                        foundtxt = true;
                    }   
                });
            }
        }
        whois.lookup(adr, function (err, data) {
            var match;
            if (domLst.valueOf() == "uk"){
                data = data.replace(/ {2,}/gm," ")
                data = data.replace(/:(\r\n|\n|\r)/gm, ": ");
                console.log(data)
                regx = /[dD]omain [Nn]ame:[ ]*(.*)/g
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    dnRes = dnResReg[1]
                } else{
                    res.send({
                        "message": "Domen ne postoji"
                    });
                    return;
                }
                regx = /[rR]egistered [Oo]n:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    rdRes = dnResReg[1]
                } else{
                    rdRes = null
                }
                regx = /[eE]xpiry date:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    edRes = dnResReg[1]
                } else{
                    edRes = null
                }
                regx = /[Rr]egistrar:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    registrarRes = dnResReg[1]
                } else{
                    registrarRes = null
                }
                regx = /[Rr]egistrant:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    registrantRes = dnResReg[1]
                } else{
                    registrantRes = null
                }
                regx = /URL:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null){
                    registrarUrlRes = dnResReg[1]
                } else{
                    registrarUrlRes = null
                }
                res.send({
                    "whoisOut": {
                        "Domain Name": dnRes,
                        "Registration Date": toUnixTime(rdRes),
                        "Expiration Date": toUnixTime(edRes),
                        "Registrar": registrarRes,
                        "Registrar URL": registrarUrlRes,
                        "Registrant": registrantRes,
                    },
                    "dnsOut": {
                        "IPV4 address": ipv4Ret,
                        "IPV6 address": ipv6Ret,
                        "CNAME": ipvcnameRet,
                        "CAA": ipcaaret,
                        "MX": ipmxret,
                        "NAPTR": ipnptrret,
                        "SOA": ipsoaret,
                        "SRV": ipsrvret,
                        "TXT": iptxtret
                    }
                });
                return
            }
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
            if (dnRes != null){
                dnRes = dnRes.replace(/ {2,}/g," ")
                if (dnRes[0] == ' '){
                    dnRes = dnRes.substring(1,dnRes.length)
                }
            }
            if (rdRes != null){
                rdRes = rdRes.replace(/ {2,}/g," ")
                if (rdRes[0] == ' '){
                    rdRes = rdRes.substring(1,rdRes.length)
                }
            }
            if (edRes != null){
                edRes = edRes.replace(/ {2,}/g," ")
                if (edRes[0] == ' '){
                    edRes = edRes.substring(1,edRes.length)
                }
            }
            if (registrarRes != null){
                registrarRes = registrarRes.replace(/ {2,}/g," ")
                if (registrarRes[0] == ' '){
                    registrarRes = registrarRes.substring(1,registrarRes.length)
                }
            }
            if (registrarUrlRes != null){
                registrarUrlRes = registrarUrlRes.replace(/ {2,}/g," ")
                if (registrarUrlRes[0] == ' '){
                    registrarUrlRes = registrarUrlRes.substring(1,registrarUrlRes.length)
                }
            }
            if (registrantRes != null){
                registrantRes = registrantRes.replace(/ {2,}/g," ")
                if (registrantRes[0] == ' '){
                    registrantRes = registrantRes.substring(1,registrantRes.length)
                }
            }
            dnRes = punycode.toUnicode(dnRes)
            res.send({
                "whoisOut": {
                    "Domain Name": dnRes,
                    "Registration Date": toUnixTime(rdRes),
                    "Expiration Date": toUnixTime(edRes),
                    "Registrar": registrarRes,
                    "Registrar URL": registrarUrlRes,
                    "Registrant": registrantRes,
                },
                "dnsOut": {
                    "IPV4 address": ipv4Ret,
                    "IPV6 address": ipv6Ret,
                    "CNAME": ipvcnameRet,
                    "CAA": ipcaaret,
                    "MX": ipmxret,
                    "NAPTR": ipnptrret,
                    "SOA": ipsoaret,
                    "SRV": ipsrvret,
                    "TXT": iptxtret
                }
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