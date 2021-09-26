import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:whois/models/dns_model.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/models/simple_response.dart';

import '../constants.dart';

enum Writing {
  LATIN,
  CYRIL,
}

class LocalizationProvider extends ChangeNotifier {
  LocalizationProvider() : writing = Writing.LATIN;

  Writing writing;

  toggleWriting() {
    if (writing == Writing.LATIN)
      writing = Writing.CYRIL;
    else
      writing = Writing.LATIN;
    save();
    notifyListeners();
  }

  LocalizationProvider.fromJson(Map<String, dynamic> json)
      : writing = json["writingIsLatin"] ? Writing.LATIN : Writing.CYRIL;

  Future<void> save() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString("localizationProvider", jsonEncode(toJson()));
  }

  bool get _l => writing == Writing.LATIN;

  String get latinica => _l ? "Latinica" : "Латиница";
  String get cirilica => _l ? "Ćirilica" : "Ћирилица";

  String get unesiteDomen =>
      _l ? "Unesite domen za pretragu" : "Унесите домен за претрагу";

  String get istorijaPretrage => _l ? "Istorija pretrage" : "Историја претраге";
  String get omiljeni => _l ? "Omiljeni" : "Омиљени";
  String get praceni => _l ? "Praćeni" : "Праћени";

  String get nemaIstorije => _l ? "Nema istorije" : "Нема историје";
  String get nemaOmiljenih => _l ? "Nema omiljenih" : "Нема омиљених";
  String get nemaPracenih => _l ? "Nema praćenih" : "Нема праћених";

  String get jeDodatNaListuPracenih =>
      _l ? " je dodat na listu praćenih." : " је додат на листу праћених.";
  String get jeDodatNaListuPracenihIOmiljenih => _l
      ? " je dodat na listu praćenih i omiljenih"
      : " је додат на листу праћених и омиљених.";

  String get jeUklonjenSaListePracenih =>
      _l ? " je uklonjen sa liste praćenih." : " је уклоњен са листе праћених.";

  String get jeDodatNaListuOmiljenih =>
      _l ? " je dodat na listu omiljenih" : " је додат на листу омиљених.";
  String get jeUklonjenSaListeOmiljenih =>
      _l ? " je uklonjen sa liste omiljenih" : " је уклоњен са листе омиљених.";

  String get nepoznato => _l ? "Nepoznato" : "Непознато";
  String get vlasnik => _l ? "Vlasnik" : "Власник";
  String get registrovano => _l ? "Registrovano" : "Регистровано";
  String get istice => _l ? "Ističe" : "Истиче";
  String get registar => _l ? "Registar" : "Регистар";
  String get registarUrl => _l ? "Registar URL" : "Регистар УРЛ";
  String get dnsAdrese => _l ? "DNS adrese" : "ДНС адресе";
  String get mejlServer => _l ? "Mejl serveri" : "Мејл сервери";
  String get domenJeSlobodan => _l ? "Domen je slobodan" : "Домен је слободан";

  String get oslobodjen => _l ? "oslobođen" : "ослобођен";
  String get greska => _l ? "Greška" : "Грешка";

  String get ukljuciNotifikaciju => _l ? "Uključi notifikaciju" : "Укључи нотификацију";
  String get obavestiMeIPutemMejla => _l ? "Obavesti me i putem email-a" : "Обавести ме и путем мејла";
  String get unesiteEmail => _l ? "Unesite email" : "Унесите имејл";
  String get ok => _l ? "OK" : "ОК";
  String get cancel => _l ? "PONIŠTI" : "ПОНИШТИ";

  Map<String, dynamic> toJson() {
    return {
      "writingIsLatin": writing == Writing.LATIN,
    };
  }
}
