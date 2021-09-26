const { Application } = require("express");
const nodemailer = require("nodemailer");
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

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    type: "SMTP",
    auth: {
        user: 'ninzenjeri@gmail.com',
        pass: 'smiled3go'
    },
    tls: {
        rejectUnauthorized: false
    },
    secure:true,
    debug:true
});

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
var tokenMap = {};

function toUnixTime(datum) {
    if (datum == null) return null
    if (datum.toString()[0] >= 'a' && datum.toString()[0] <= 'z') return datum
    if (datum.toString()[0] >= 'A' && datum.toString()[0] <= 'Z') return datum
    if (datum.toString()[4] == '-') {
        return Date.parse(datum.toString().substring(0, 10))
    }
    if (datum.toString()[2] == '.') {
        let day = datum.substring(0, 2)
        let month = datum.substring(3, 5)
        let year = datum.substring(6, 10)
        return Date.parse(year + "-" + month + "-" + day)
    }
    if (datum.toString()[2] == '-') {
        let day = datum.substring(0, 2)
        let month = datum.substring(3, 6)
        let year = datum.substring(7, 11)
        switch (month) {
            case 'Jan': {
                month = 1
                break
            }
            case 'Feb': {
                month = 2
                break
            }
            case 'Mar': {
                month = 3
                break
            }
            case 'Apr': {
                month = 4
                break
            }
            case 'May': {
                month = 5
                break
            }
            case 'Jun': {
                month = 6
                break
            }
            case 'Jul': {
                month = 7
                break
            }
            case 'Aug': {
                month = 8
                break
            }
            case 'Sep': {
                month = 9
                break
            }
            case 'Oct': {
                month = 10
                break
            }
            case 'Nov': {
                month = 11
                break
            }
            case 'Dec': {
                month = 12
                break
            }
        }
        return Date.parse(year + "-" + month + "-" + day)
    }
    return datum;
 }
 baza = {
    "br.com": "whois.centralnic.net",
    "cn.com": "whois.centralnic.net",
    "de.com": "whois.centralnic.net",
    "eu.com": "whois.centralnic.net",
    "gb.com": "whois.centralnic.net",
    "gb.net": "whois.centralnic.net",
    "gr.com": "whois.centralnic.net",
    "hu.com": "whois.centralnic.net",
    "in.net": "whois.centralnic.net",
    "jpn.com": "whois.centralnic.net",
    "no.com": "whois.centralnic.net",
    "qc.com": "whois.centralnic.net",
    "ru.com": "whois.centralnic.net",
    "sa.com": "whois.centralnic.net",
    "se.com": "whois.centralnic.net",
    "se.net": "whois.centralnic.net",
    "uk.com": "whois.centralnic.net",
    "uk.net": "whois.centralnic.net",
    "us.com": "whois.centralnic.net",
    "uy.com": "whois.centralnic.net",
    "web.com": "whois.centralnic.net",
    "za.com": "whois.centralnic.net",
    "com": {
      "host": "whois.verisign-grs.com",
      "query": "DOMAIN $addr\r\n"
    },
  
    "za.net": "whois.za.net",
    "net": {
      "host": "whois.verisign-grs.com",
      "query": "DOMAIN $addr\r\n"
    },
  
    "eu.org": "whois.eu.org",
    "za.org": "whois.za.org",
    "org": "whois.publicinterestregistry.net",
  
    "edu": "whois.educause.edu",
    "gov": "whois.dotgov.gov",
    "int": "whois.iana.org",
    "mil": null,
  
    "e164.arpa": "whois.ripe.net",
    "in-addr.arpa": null,
    "arpa": "whois.iana.org",
  
    "aero": "whois.aero",
    "asia": "whois.nic.asia",
    "biz": "whois.biz",
    "cat": "whois.cat",
    "coop": "whois.nic.coop",
    "info": "whois.afilias.net",
    "jobs": "jobswhois.verisign-grs.com",
    "mobi": "whois.dotmobiregistry.net",
    "museum": "whois.museum",
    "name": "whois.nic.name",
    "post": "whois.dotpostregistry.net",
    "pro": "whois.afilias.net",
    "tel": "whois.nic.tel",
    "travel": "whois.nic.travel",
    "xxx": "whois.nic.xxx",
  
    "academy": "whois.nic.academy",
    "accountants": "whois.nic.accountants",
    "actor": "whois.nic.actor",
    "agency": "whois.nic.agency",
    "airforce": "whois.nic.airforce",
    "apartments": "whois.nic.apartments",
    "app": "whois.nic.google",
    "archi": "whois.nic.archi",
    "army": "whois.nic.army",
    "associates": "whois.nic.associates",
    "attorney": "whois.nic.attorney",
    "auction": "whois.nic.auction",
    "audio": "whois.nic.audio",
    "autos": "whois.nic.autos",
    "axa": "whois.nic.axa",
    "band": "whois.nic.band",
    "bar": "whois.nic.bar",
    "bargains": "whois.nic.bargains",
    "bayern": "whois.nic.bayern",
    "beer": "whois.nic.beer",
    "berlin": "whois.nic.berlin",
    "best": "whois.nic.best",
    "bid": "whois.nic.bid",
    "bike": "whois.nic.bike",
    "bingo": "whois.nic.bingo",
    "black": "whois.nic.black",
    "blackfriday": "whois.nic.blackfriday",
    "blog": "whois.nic.blog",
    "blue": "whois.nic.blue",
    "boutique": "whois.nic.boutique",
    "build": "whois.nic.build",
    "builders": "whois.nic.builders",
    "business": "whois.nic.business",
    "buzz": "whois.nic.buzz",
    "cab": "whois.nic.cab",
    "cafe": "whois.nic.cafe",
    "camera": "whois.nic.camera",
    "camp": "whois.nic.camp",
    "capital": "whois.nic.capital",
    "cards": "whois.nic.cards",
    "care": "whois.nic.care",
    "career": "whois.nic.career",
    "careers": "whois.nic.careers",
    "cash": "whois.nic.cash",
    "casino": "whois.nic.casino",
    "catering": "whois.nic.catering",
    "center": "whois.nic.center",
    "ceo": "whois.nic.ceo",
    "charity": "whois.nic.charity",
    "chat": "whois.nic.chat",
    "cheap": "whois.nic.cheap",
    "christmas": "whois.nic.christmas",
    "church": "whois.nic.church",
    "citic": "whois.nic.citic",
    "city": "whois.nic.city",
    "claims": "whois.nic.claims",
    "cleaning": "whois.nic.cleaning",
    "clinic": "whois.nic.clinic",
    "clothing": "whois.nic.clothing",
    "cloud": "whois.nic.cloud",
    "club": "whois.nic.club",
    "coach": "whois.nic.coach",
    "codes": "whois.nic.codes",
    "coffee": "whois.nic.coffee",
    "college": "whois.nic.college",
    "cologne": "whois.nic.cologne",
    "community": "whois.nic.community",
    "company": "whois.nic.company",
    "computer": "whois.nic.computer",
    "condos": "whois.nic.condos",
    "construction": "whois.nic.construction",
    "consulting": "whois.nic.consulting",
    "contractors": "whois.nic.contractors",
    "cooking": "whois.nic.cooking",
    "cool": "whois.nic.cool",
    "country": "whois.nic.country",
    "coupons": "whois.nic.coupons",
    "credit": "whois.nic.credit",
    "creditcard": "whois.nic.creditcard",
    "cruises": "whois.nic.cruises",
    "dance": "whois.nic.dance",
    "dating": "whois.nic.dating",
    "deals": "whois.nic.deals",
    "degree": "whois.nic.degree",
    "delivery": "whois.nic.delivery",
    "democrat": "whois.nic.democrat",
    "dental": "whois.nic.dental",
    "dentist": "whois.nic.dentist",
    "desi": "whois.nic.desi",
    "dev": "whois.nic.google",
    "diamonds": "whois.nic.diamonds",
    "digital": "whois.donuts.co",
    "direct": "whois.nic.direct",
    "directory": "whois.nic.directory",
    "discount": "whois.nic.discount",
    "dnp": "whois.nic.dnp",
    "doctor": "whois.nic.doctor",
    "dog": "whois.nic.dog",
    "domains": "whois.nic.domains",
    "education": "whois.nic.education",
    "email": "whois.nic.email",
    "energy": "whois.nic.energy",
    "engineer": "whois.nic.engineer",
    "engineering": "whois.nic.engineering",
    "enterprises": "whois.nic.enterprises",
    "equipment": "whois.nic.equipment",
    "estate": "whois.nic.estate",
    "eus": "whois.nic.eus",
    "events": "whois.nic.events",
    "exchange": "whois.nic.exchange",
    "expert": "whois.nic.expert",
    "exposed": "whois.nic.exposed",
    "express": "whois.nic.express",
    "fail": "whois.nic.fail",
    "family": "whois.nic.family",
    "fan": "whois.nic.fan",
    "farm": "whois.nic.farm",
    "feedback": "whois.nic.feedback",
    "finance": "whois.nic.finance",
    "financial": "whois.nic.financial",
    "fish": "whois.nic.fish",
    "fishing": "whois.nic.fishing",
    "fitness": "whois.nic.fitness",
    "flights": "whois.nic.flights",
    "florist": "whois.nic.florist",
    "foo": "whois.nic.foo",
    "football": "whois.nic.football",
    "forsale": "whois.nic.forsale",
    "foundation": "whois.nic.foundation",
    "frogans": "whois.nic.frogans",
    "fun": "whois.nic.fun",
    "fund": "whois.nic.fund",
    "furniture": "whois.nic.furniture",
    "futbol": "whois.nic.futbol",
    "fyi": "whois.nic.fyi",
    "gal": "whois.nic.gal",
    "gallery": "whois.nic.gallery",
    "games": "whois.nic.games",
    "gift": "whois.nic.gift",
    "gifts": "whois.nic.gifts",
    "gives": "whois.nic.gives",
    "glass": "whois.nic.glass",
    "global": "whois.nic.global",
    "globo": "whois.nic.globo",
    "gmbh": "whois.nic.gmbh",
    "gmo": "whois.nic.gmo",
    "gold": "whois.nic.gold",
    "golf": "whois.nic.golf",
    "gop": "whois.nic.gop",
    "graphics": "whois.nic.graphics",
    "gratis": "whois.nic.gratis",
    "gripe": "whois.nic.gripe",
    "group": "whois.nic.group",
    "guide": "whois.nic.guide",
    "guitars": "whois.nic.guitars",
    "guru": "whois.nic.guru",
    "haus": "whois.nic.haus",
    "healthcare": "whois.nic.healthcare",
    "hiphop": "whois.nic.hiphop",
    "hockey": "whois.nic.hockey",
    "holdings": "whois.nic.holdings",
    "holiday": "whois.nic.holiday",
    "homes": "whois.nic.homes",
    "horse": "whois.nic.horse",
    "hospital": "whois.nic.hospital",
    "host": "whois.nic.host",
    "house": "whois.nic.house",
    "immo": "whois.nic.immo",
    "immobilien": "whois.nic.immobilien",
    "industries": "whois.nic.industries",
    "ink": "whois.nic.ink",
    "institute": "whois.nic.institute",
    "insure": "whois.nic.insure",
    "international": "whois.nic.international",
    "investments": "whois.nic.investments",
    "irish": "whois.nic.irish",
    "jetzt": "whois.nic.jetzt",
    "jewelry": "whois.nic.jewelry",
    "juegos": "whois.nic.juegos",
    "kaufen": "whois.nic.kaufen",
    "kim": "whois.nic.kim",
    "kitchen": "whois.nic.kitchen",
    "kiwi": "whois.nic.kiwi",
    "koeln": "whois.nic.koeln",
    "kred": "whois.nic.kred",
    "land": "whois.nic.land",
    "lawyer": "whois.nic.lawyer",
    "lease": "whois.nic.lease",
    "legal": "whois.nic.legal",
    "life": "whois.nic.life",
    "lighting": "whois.nic.lighting",
    "limited": "whois.nic.limited",
    "limo": "whois.nic.limo",
    "link": "whois.nic.link",
    "live": "whois.nic.live",
    "loans": "whois.nic.loans",
    "london": "whois.nic.london",
    "love": "whois.nic.love",
    "ltd": "whois.nic.ltd",
    "luxe": "whois.nic.luxe",
    "luxury": "whois.nic.luxury",
    "maison": "whois.nic.maison",
    "management": "whois.nic.management",
    "mango": "whois.nic.mango",
    "market": "whois.nic.market",
    "marketing": "whois.nic.marketing",
    "mba": "whois.nic.mba",
    "media": "whois.nic.media",
    "meet": "whois.nic.meet",
    "memorial": "whois.nic.memorial",
    "menu": "whois.nic.menu",
    "miami": "whois.nic.miami",
    "moda": "whois.nic.moda",
    "moe": "whois.nic.moe",
    "monash": "whois.nic.monash",
    "money": "whois.nic.money",
    "mortgage": "whois.nic.mortgage",
    "moscow": "whois.nic.moscow",
    "motorcycles": "whois.nic.motorcycles",
    "movie": "whois.nic.movie",
    "nagoya": "whois.nic.nagoya",
    "navy": "whois.nic.navy",  
    "network": "whois.nic.network",
    "neustar": "whois.nic.neustar",
    "news": "whois.nic.news",
    "ninja": "whois.nic.ninja",
    "nyc": "whois.nic.nyc",
    "okinawa": "whois.nic.okinawa",
    "one": "whois.nic.one",
    "onl": "whois.nic.onl",
    "online": "whois.centralnic.net",
    "paris": "whois.nic.paris",
    "partners": "whois.nic.partners",
    "parts": "whois.nic.parts",
    "photo": "whois.nic.photo",
    "photography": "whois.nic.photography",
    "photos": "whois.nic.photos",
    "pics": "whois.nic.pics",
    "pictures": "whois.nic.pictures",
    "pink": "whois.nic.pink",
    "pizza": "whois.nic.pizza",
    "place": "whois.nic.place",
    "plumbing": "whois.nic.plumbing",
    "plus": "whois.nic.plus",
    "press": "whois.nic.press",
    "productions": "whois.nic.productions",
    "properties": "whois.nic.properties",
    "pub": "whois.nic.pub",
    "qpon": "whois.nic.qpon",
    "quebec": "whois.nic.quebec",
    "recipes": "whois.nic.recipes",
    "red": "whois.nic.red",
    "rehab": "whois.nic.rehab",
    "reise": "whois.nic.reise",
    "reisen": "whois.nic.reisen",
    "ren": "whois.nic.ren",
    "rentals": "whois.nic.rentals",
    "repair": "whois.nic.repair",
    "report": "whois.nic.report",
    "republican": "whois.nic.republican",
    "rest": "whois.nic.rest",
    "restaurant": "whois.nic.restaurant",
    "reviews": "whois.nic.reviews",
    "rich": "whois.nic.rich",
    "rio": "whois.nic.rio",
    "rip": "whois.nic.rip",
    "rocks": "whois.nic.rocks",
    "rodeo": "whois.nic.rodeo",
    "ruhr": "whois.nic.ruhr",
    "run": "whois.nic.run",
    "ryukyu": "whois.nic.ryukyu",
    "saarland": "whois.nic.saarland",
    "sale": "whois.nic.sale",
    "salon": "whois.nic.salon",
    "sarl": "whois.nic.sarl",
    "school": "whois.nic.school",
    "schule": "whois.nic.schule",
    "services": "whois.nic.services",
    "sexy": "whois.nic.sexy",
    "shiksha": "whois.nic.shiksha",
    "shoes": "whois.nic.shoes",
    "shopping": "whois.nic.shopping",
    "show": "whois.nic.show",
    "singles": "whois.nic.singles",
    "site": "whois.nic.site",
    "soccer": "whois.nic.soccer",
    "social": "whois.nic.social",
    "software": "whois.nic.software",
    "sohu": "whois.nic.sohu",
    "solar": "whois.nic.solar",
    "solutions": "whois.nic.solutions",
    "soy": "whois.nic.soy",
    "space": "whois.nic.space",
    "sport": "whois.nic.sport",
    "store": "whois.nic.store",
    "studio": "whois.nic.studio",
    "style": "whois.nic.style",
    "supplies": "whois.nic.supplies",
    "supply": "whois.nic.supply",
    "support": "whois.nic.support",
    "surgery": "whois.nic.surgery",
    "systems": "whois.nic.systems",
    "tattoo": "whois.nic.tattoo",
    "tax": "whois.nic.tax",
    "taxi": "whois.nic.taxi",
    "team": "whois.nic.team",
    "tech": "whois.nic.tech",
    "technology": "whois.nic.technology",
    "tennis": "whois.nic.tennis",
    "theater": "whois.nic.theater",
    "tienda": "whois.nic.tienda",
    "tips": "whois.nic.tips",
    "tires": "whois.nic.tires",
    "today": "whois.nic.today",
    "tokyo": "whois.nic.tokyo",
    "tools": "whois.nic.tools",
    "top": "whois.nic.top",
    "tours": "whois.nic.tours",
    "town": "whois.nic.town",
    "toys": "whois.nic.toys",
    "trade": "whois.nic.trade",
    "training": "whois.nic.training",
    "university": "whois.nic.university",
    "uno": "whois.nic.uno",
    "vacations": "whois.nic.vacations",
    "vegas": "whois.nic.vegas",
    "ventures": "whois.nic.ventures",
    "versicherung": "whois.nic.versicherung",
    "vet": "whois.nic.vet",
    "viajes": "whois.nic.viajes",
    "video": "whois.nic.video",
    "villas": "whois.nic.villas",
    "vin": "whois.nic.vin",
    "vip": "whois.nic.vip",
    "vision": "whois.nic.vision",
    "vodka": "whois.nic.vodka",
    "vote": "whois.nic.vote",
    "voting": "whois.nic.voting",
    "voto": "whois.nic.voto",
    "voyage": "whois.nic.voyage",
    "wang": "whois.nic.wang",
    "watch": "whois.nic.watch",
    "webcam": "whois.nic.webcam",
    "website": "whois.nic.website",
    "wed": "whois.nic.wed",
    "wien": "whois.nic.wien",
    "wiki": "whois.nic.wiki",
    "wine": "whois.nic.wine",
    "works": "whois.nic.works",
    "world": "whois.nic.world",
    "wtc": "whois.nic.wtc",
    "wtf": "whois.nic.wtf",
    "xn--3bst00m": "whois.nic.xn--3bst00m",
    "xn--3ds443g": "whois.nic.xn--3ds443g",
    "xn--55qw42g": "whois.nic.xn--55qw42g",
    "xn--55qx5d": "whois.nic.xn--55qx5d",
    "xn--6frz82g": "whois.nic.xn--6frz82g",
    "xn--6qq986b3xl": "whois.nic.xn--6qq986b3xl",
    "xn--80adxhks": "whois.nic.xn--80adxhks",
    "xn--80asehdb": "whois.nic.xn--80asehdb",
    "xn--80aswg": "whois.nic.xn--80aswg",
    "xn--c1avg": "whois.nic.xn--c1avg",
    "xn--cg4bki": "whois.nic.xn--cg4bki",
    "xn--czrs0t": "whois.nic.xn--czrs0t",
    "xn--czr694b": "whois.nic.xn--czr694b",
    "xn--czru2d": "whois.nic.xn--czru2d",
    "xn--d1acj3b": "whois.nic.xn--d1acj3b",
    "xn--fiq228c5hs": "whois.nic.xn--fiq228c5hs",
    "xn--fiq64b": "whois.nic.xn--fiq64b",
    "xn--i1b6b1a6a2e": "whois.nic.xn--i1b6b1a6a2e",
    "xn--io0a7i": "whois.nic.xn--io0a7i",
    "xn--mgbab2bd": "whois.nic.xn--mgbab2bd",
    "xn--ngbc5azd": "whois.nic.xn--ngbc5azd",
    "xn--nqv7f": "whois.nic.xn--nqv7f",
    "xn--nqv7fs00ema": "whois.nic.xn--nqv7fs00ema",
    "xn--q9jyb4c": "whois.nic.xn--q9jyb4c",
    "xn--rhqv96g": "whois.nic.xn--rhqv96g",
    "xn--ses554g": "whois.nic.xn--ses554g",
    "xn--unup4y": "whois.nic.xn--unup4y",
    "xn--vhquv": "whois.nic.xn--vhquv",
    "xn--zfr164b": "whois.nic.xn--zfr164b",
    "xyz": "whois.namecheap.com",
    "yachts": "whois.nic.yachts",
    "yokohama": "whois.nic.yokohama",
    "zone": "whois.nic.zone",
  
    "ac": "whois.nic.ac",
    "ad": null,
    "ae": "whois.aeda.net.ae",
    "af": "whois.nic.af",
    "ag": "whois.nic.ag",
    "ai": "whois.nic.ai",
    "al": null,
    "am": "whois.amnic.net",
    "an": null,
    "ao": null,
    "aq": null,
    "ar": null,
    "as": "whois.nic.as",
    "priv.at": "whois.nic.priv.at",
    "at": "whois.nic.at",
    "au": "whois.auda.org.au",
    "aw": "whois.nic.aw",
    "ax": "whois.ax",
    "az": null,
    "ba": null,
    "bb": null,
    "bd": null,
    "be": "whois.dns.be",
    "bf": null,
    "bg": "whois.register.bg",
    "bh": null,
    "bi": "whois1.nic.bi",
    "bj": "whois.nic.bj",
    "bl": null,
    "bm": "whois.afilias-srs.net",
    "bn": "whois.bn",
    "bo": "whois.nic.bo",
    "bq": null,
    "br": "whois.registro.br",
    "bs": null,
    "bt": null,
    "bv": null,
    "by": "whois.cctld.by",
    "bw": "whois.nic.net.bw",
    "bz": "whois.afilias-grs.info",
    "co.ca": "whois.co.ca",
    "ca": "whois.cira.ca",
    "cc": "ccwhois.verisign-grs.com",
    "cd": "whois.nic.cd",
    "cf": "whois.dot.cf",
    "cg": null,
    "ch": "whois.nic.ch",
    "ci": "whois.nic.ci",
    "ck": null,
    "cl": "whois.nic.cl",
    "cm": "whois.netcom.cm",
    "edu.cn": "whois.edu.cn",
    "cn": "whois.cnnic.cn",
    "uk.co": "whois.uk.co",
    "co": "whois.nic.co",
    "cr": "whois.nic.cr",
    "cu": null,
    "cv": null,
    "cw": null,
    "cx": "whois.nic.cx",
    "cy": null,
    "cz": "whois.nic.cz",
    "de": {
        "host": "whois.denic.de",
        "query": "-T dn $addr\r\n",
        "punycode": false
    },
    "dj": null,
    "dk": {
        "host": "whois.dk-hostmaster.dk",
        "query": "--charset=utf-8 --show-handles $addr\r\n"
    },
    "dm": "whois.nic.dm",
    "do": "whois.nic.do",
    "dz": "whois.nic.dz",
    "ec": "whois.nic.ec",
    "ee": "whois.tld.ee",
    "eg": null,
    "eh": null,
    "er": null,
    "es": null,
    "et": null,
    "eu": "whois.eu",
    "fi": "whois.fi",
    "fj": "whois.usp.ac.fj",
    "fk": null,
    "fm": "whois.nic.fm",
    "fo": "whois.nic.fo",
    "fr": "whois.nic.fr",
    "ga": "whois.dot.ga",
    "gb": null,
    "gd": "whois.nic.gd",
    "ge": "whois.nic.ge",
    "gf": "whois.mediaserv.net",
    "gg": "whois.gg",
    "gh": "whois.nic.gh",
    "gi": "whois.afilias-grs.info",
    "gl": "whois.nic.gl",
    "gm": null,
    "gn": null,
    "gp": "whois.nic.gp",
    "gq": "whois.dominio.gq",
    "gr": null,
    "gs": "whois.nic.gs",
    "gt": null,
    "gu": null,
    "gw": null,
    "gy": "whois.registry.gy",
    "hk": "whois.hkirc.hk",
    "hm": "whois.registry.hm",
    "hn": "whois.nic.hn",
    "hr": "whois.dns.hr",
    "ht": "whois.nic.ht",
    "hu": "whois.nic.hu",
    "id": "whois.pandi.or.id",
    "ie": "whois.domainregistry.ie",
    "il": "whois.isoc.org.il",
    "im": "whois.nic.im",
    "in": "whois.registry.in",
    "io": "whois.nic.io",
    "iq": "whois.cmc.iq",
    "ir": "whois.nic.ir",
    "is": "whois.isnic.is",
    "it": "whois.nic.it",
    "je": "whois.je",
    "jm": null,
    "jo": null,
    "jp": {
        "host": "whois.jprs.jp",
        "query": "$addr/e\r\n"
    },
    "ke": "whois.kenic.or.ke",
    "kg": "whois.domain.kg",
    "kh": null,
    "ki": "whois.nic.ki",
    "km": null,
    "kn": "whois.nic.kn",
    "kp": null,
    "kr": "whois.kr",
    "kw": null,
    "ky": "whois.kyregistry.ky",
    "kz": "whois.nic.kz",
    "la": "whois.nic.la",
    "lb": null,
    "lc": "whois.afilias-grs.info",
    "li": "whois.nic.li",
    "lk": "whois.nic.lk",
    "lr": null,
    "ls": "whois.nic.ls",
    "lt": "whois.domreg.lt",
    "lu": "whois.dns.lu",
    "lv": "whois.nic.lv",
    "ly": "whois.nic.ly",
    "ma": "whois.iam.net.ma",
    "mc": null,
    "md": "whois.nic.md",
    "me": "whois.nic.me",
    "mf": null,
    "mg": "whois.nic.mg",
    "mh": null,
    "mk": "whois.marnet.mk",
    "мкд" : "whois.marnet.mk",
    "ml": "whois.dot.ml",
    "mm": null,
    "mn": "whois.nic.mn",
    "mo": null,
    "mp": null,
    "mq": "whois.mediaserv.net",
    "mr": "whois.nic.mr",
    "ms": "whois.nic.ms",
    "mt": null,
    "mu": "whois.nic.mu",
    "mv": null,
    "mw": "whois.nic.mw",
    "mx": "whois.mx",
    "my": "whois.domainregistry.my",
    "mz": "whois.nic.mz",
    "na": "whois.na-nic.com.na",
    "nc": "whois.nc",
    "ne": null,
    "nf": "whois.nic.nf",
    "ng": "whois.nic.net.ng",
    "ni": null,
    "nl": "whois.domain-registry.nl",
    "no": {
      "host": "whois.norid.no",
      "query": "-c utf-8 $addr\r\n"
    },
    "np": null,
    "nr": null,
    "nu": "whois.iis.nu",
    "nz": "whois.srs.net.nz",
    "om": "whois.registry.om",
    "pa": null,
    "pe": "kero.yachay.pe",
    "pf": "whois.registry.pf",
    "pg": null,
    "ph": null,
    "pk": null,
    "co.pl": "whois.co.pl",
    "pl": "whois.dns.pl",
    "pm": "whois.nic.pm",
    "pn": null,
    "pr": "whois.nic.pr",
    "ps": "whois.pnina.ps",
    "pt": "whois.dns.pt",
    "pw": "whois.nic.pw",
    "py": null,
    "qa": "whois.registry.qa",
    "re": "whois.nic.re",
    "ro": "whois.rotld.ro",
    "rs": "whois.rnids.rs",
    "edu.ru": "whois.informika.ru",
    "ru": "whois.tcinet.ru",
    "rw": "whois.ricta.org.rw",
    "sa": "whois.nic.net.sa",
    "sb": "whois.nic.sb",
    "sc": "whois.afilias-grs.info",
    "sd": null,
    "se": "whois.iis.se",
    "sg": "whois.sgnic.sg",
    "sh": "whois.nic.sh",
    "si": "whois.arnes.si",
    "sj": null,
    "sk": "whois.sk-nic.sk",
    "sl": "whois.nic.sl",
    "sm": "whois.nic.sm",
    "sn": "whois.nic.sn",
    "so": "whois.nic.so",
    "sr": null,
    "ss": "whois.nic.ss",
    "st": "whois.nic.st",
    "su": "whois.tcinet.ru",
    "sv": null,
    "sx": "whois.sx",
    "sy": "whois.tld.sy",
    "sz": null,
    "tc": "whois.nic.tc",
    "td": "whois.nic.td",
    "tf": "whois.nic.tf",
    "tg": "whois.nic.tg",
    "th": "whois.thnic.co.th",
    "tj": null,
    "tk": "whois.dot.tk",
    "tl": "whois.nic.tl",
    "tm": "whois.nic.tm",
    "tn": "whois.ati.tn",
    "to": "whois.tonic.to",
    "tp": null,
    "tr": "whois.nic.tr",
    "tt": null,
    "tv": "tvwhois.verisign-grs.com",
    "tw": "whois.twnic.net.tw",
    "tz": "whois.tznic.or.tz",
    "biz.ua": "whois.biz.ua",
    "co.ua": "whois.co.ua",
    "pp.ua": "whois.pp.ua",
    "ua": "whois.ua",
    "ug": "whois.co.ug",
    "ac.uk": "whois.ja.net",
    "bl.uk": null,
    "british-library.uk": null,
    "gov.uk": "whois.nic.uk",
    "icnet.uk": null,
    "jet.uk": null,
    "mod.uk": null,
    "nhs.uk": null,
    "nls.uk": null,
    "parliament.uk": null,
    "police.uk": null,
    "uk": "whois.nic.uk",
    "um": null,
    "fed.us": "whois.nic.gov",
    "us": "whois.nic.us",
    "com.uy": null,
    "uy": "whois.nic.org.uy",
    "uz": "whois.cctld.uz",
    "va": null,
    "vc": "whois.afilias-grs.info",
    "ve": "whois.nic.ve",
    "vg": "whois.nic.vg",
    "vi": null,
    "vn": null,
    "vu": "vunic.vu",
    "wf": "whois.nic.wf",
    "ws": "whois.website.ws",
    "ye": null,
    "yt": "whois.nic.yt",
    "ac.za": "whois.ac.za",
    "alt.za": "whois.alt.za",
    "co.za": "whois.registry.net.za",
    "gov.za": "whois.gov.za",
    "net.za": "whois.net.za",
    "org.za": null,
    "web.za": "whois.web.za",
    "za": null,
    "zm": "whois.nic.zm",
    "zw": null,
  
    "xn--3e0b707e": "whois.kr",
    "xn--45brj9c": "whois.inregistry.net",
    "xn--80ao21a": "whois.nic.kz",
    "xn--90a3ac": "whois.rnids.rs",
    "xn--clchc0ea0b2g2a9gcd": "whois.sgnic.sg",
    "xn--fiqs8s": "cwhois.cnnic.cn",
    "xn--fiqz9s": "cwhois.cnnic.cn",
    "xn--fpcrj9c3d": "whois.inregistry.net",
    "xn--fzc2c9e2c": "whois.nic.lk",
    "xn--gecrj9c": "whois.inregistry.net",
    "xn--h2brj9c": "whois.inregistry.net",
    "xn--j1amh": "whois.dotukr.com",
    "xn--j6w193g": "whois.hkirc.hk",
    "xn--kprw13d": "whois.twnic.net.tw",
    "xn--kpry57d": "whois.twnic.net.tw",
    "xn--l1acc": "whois.nic.mn",
    "xn--lgbbat1ad8j": "whois.nic.dz",
    "xn--mgb9awbf": "whois.registry.om",
    "xn--mgba3a4f16a": "whois.nic.ir",
    "xn--mgbaam7a8h": "whois.aeda.net.ae",
    "xn--mgbayh7gpa": null,
    "xn--mgbbh1a71e": "whois.inregistry.net",
    "xn--mgbc0a9azcg": null,
    "xn--mgberp4a5d4ar": "whois.nic.net.sa",
    "xn--mgbx4cd0ab": "whois.domainregistry.my",
    "xn--o3cw4h": "whois.thnic.co.th",
    "xn--ogbpf8fl": "whois.tld.sy",
    "xn--p1ai": "whois.tcinet.ru",
    "xn--pgbs0dh": null,
    "xn--s9brj9c": "whois.inregistry.net",
    "xn--wgbh1c": "whois.dotmasr.eg",
    "xn--wgbl6a": "whois.registry.qa",
    "xn--xkc2al3hye2a": "whois.nic.lk",
    "xn--xkc2dl3a5ee0h": "whois.inregistry.net",
    "xn--yfro4i67o": "whois.sgnic.sg",
    "xn--ygbi2ammx": "whois.pnina.ps",
    "xn--d1alf" : "whois.marnet.mk",
    "xn--j1aef" : "verisigninc.com",
    "ком" : "verisigninc.com",
    "": "whois.ripe.net",
  
    "_": {
      "ip": {
        "host": "whois.arin.net",
        "query": "n + $addr\r\n"
      }
    }
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
        domLst = niz[niz.length - 1]
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
        try {
            for (var j = 0; j < 3; j++) {
                if (!foundv4) {
                    dns.resolve4(adr, (err, ret) => {
                        ipv4Ret = ret

                        if (!(ipv4Ret === undefined)) {
                            foundv4 = true;
                        }
                    });
                }
                if (!foundv6) {
                    dns.resolve6(adr, (err, ret) => {
                        ipv6Ret = ret

                        if (!(ipv6Ret === undefined)) {
                            foundv6 = true;
                        }
                    });
                }
                if (!foundcname) {
                    dns.resolveCname(adr, (err, ret) => {
                        ipvcnameRet = ret
                        if (!(ipvcnameRet === undefined)) {
                            foundcname = true;
                        }
                    });
                }

                if (!foundmx) {
                    dns.resolveMx(adr, (err, ret) => {
                        ipmxret = ret

                        if (!(ipmxret === undefined)) {
                            foundmx = true;
                        }
                    });
                }
                if (!foundnptr) {
                    dns.resolveNaptr(adr, (err, ret) => {
                        ipnptrret = ret

                        if (!(ipnptrret === undefined)) {
                            foundnptr = true;
                        }
                    });
                }
                if (!foundsoa) {
                    dns.resolveSoa(adr, (err, ret) => {
                        ipsoaret = ret

                        if (!(ipsoaret === undefined)) {
                            foundsoa = true;
                        }
                    });
                }
                if (!foundsrv) {
                    dns.resolveSrv(adr, (err, ret) => {
                        ipsrvret = ret

                        if (!(ipsrvret === undefined)) {
                            foundsrv = true;
                        }
                    });
                }
                if (!foundtxt) {
                    dns.resolveTxt(adr, (err, ret) => {
                        iptxtret = ret

                        if (!(iptxtret === undefined)) {
                            foundtxt = true;
                        }
                    });
                }
                if (!foundcaa) {
                    dns.resolveCaa(adr, (err, ret) => {
                        ipcaaret = ret

                        if (!(ipcaaret === undefined)) {
                            foundcaa = true;
                        }
                    });
                }
            }
        } catch (e) {

        }
        whois.lookup(adr, function (err, data) {
            var match;
            if (domLst.valueOf() == "uk") {
                data = data.replace(/ {2,}/gm, " ")
                data = data.replace(/:(\r\n|\n|\r)/gm, ": ");
                console.log(data)
                regx = /[dD]omain [Nn]ame:[ ]*(.*)/g
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    dnRes = dnResReg[1]
                } else {
                    res.send({
                        "message": "Domen ne postoji"
                    });
                    return;
                }
                regx = /[rR]egistered [Oo]n:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    rdRes = dnResReg[1]
                } else {
                    rdRes = null
                }
                regx = /[eE]xpiry date:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    edRes = dnResReg[1]
                } else {
                    edRes = null
                }
                regx = /[Rr]egistrar:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    registrarRes = dnResReg[1]
                } else {
                    registrarRes = null
                }
                regx = /[Rr]egistrant:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    registrantRes = dnResReg[1]
                } else {
                    registrantRes = null
                }
                regx = /URL:[ ]*(.*)/gm
                dnResReg = (regx.exec(data))
                if (dnResReg != null) {
                    registrarUrlRes = dnResReg[1]
                } else {
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
            if (dnRes != null) {
                dnRes = dnRes.replace(/ {2,}/g, " ")
                if (dnRes[0] == ' ') {
                    dnRes = dnRes.substring(1, dnRes.length)
                }
            }
            if (rdRes != null) {
                rdRes = rdRes.replace(/ {2,}/g, " ")
                if (rdRes[0] == ' ') {
                    rdRes = rdRes.substring(1, rdRes.length)
                }
            }
            if (edRes != null) {
                edRes = edRes.replace(/ {2,}/g, " ")
                if (edRes[0] == ' ') {
                    edRes = edRes.substring(1, edRes.length)
                }
            }
            if (registrarRes != null) {
                registrarRes = registrarRes.replace(/ {2,}/g, " ")
                if (registrarRes[0] == ' ') {
                    registrarRes = registrarRes.substring(1, registrarRes.length)
                }
            }
            if (registrarUrlRes != null) {
                registrarUrlRes = registrarUrlRes.replace(/ {2,}/g, " ")
                if (registrarUrlRes[0] == ' ') {
                    registrarUrlRes = registrarUrlRes.substring(1, registrarUrlRes.length)
                }
            }
            if (registrantRes != null) {
                registrantRes = registrantRes.replace(/ {2,}/g, " ")
                if (registrantRes[0] == ' ') {
                    registrantRes = registrantRes.substring(1, registrantRes.length)
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
        const { name, token, email } = data;
        if(email!=null && email!=undefined)
        {
            tokenMap[token] = email;
        }
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
        res.status(400).send({
            message: "Error!"
        })
    }
};

removeNotify = (req, res) => {
    var data = req.body;
    try {
        const { name, token } = data;
        delete tokenMap[token];
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
        res.status(400).send({
            message: "Error!"
        })
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

cron.schedule('*/10 * * * * *', () => {
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
            console.log(toUnixTime(expmilisec));
            if (milisec > toUnixTime(expmilisec) || true) {
                // if yes then send the notification using all the tokens
                while (tokenArray !== undefined && tokenArray.length > 0) {
                    tokencic = tokenArray.pop();
                    notificationText = "Domain name " + domainName + " has expired";
                    
                    if(tokenMap[tokencic] !== null && tokenMap[tokencic] !== undefined){
                        transporter.sendMail({
                            from: '"Ninzenjeri Whois" <ninzenjeri@gmail.com>', // sender address
                            to: tokenMap[tokencic], // list of receivers
                            subject: "Expiry Notification", // Subject line
                            text: notificationText, // plain text body
                            html: "<b>"+notificationText+"</b>", // html body
                          });
                    }

                    notification = {
                        title: notificationText,
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
            delete waiting[domainName];
        })
    }
})