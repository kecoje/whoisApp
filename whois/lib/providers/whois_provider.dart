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
import 'package:whois/services/push_notification_service.dart';

import '../constants.dart';

class WhoisProvider extends ChangeNotifier {
  WhoisProvider() : searchedDomains = [];

  static final historyListKey = GlobalKey<AnimatedListState>();
  static final favoritesListKey = GlobalKey<AnimatedListState>();
  static final alarmListKey = GlobalKey<AnimatedListState>();

  List<DomainDetails> searchedDomains;

  List<DomainDetails> get favoriteDomains =>
      searchedDomains.where((dom) => dom.isFavorite).toList();

  List<DomainDetails> get alarmDomains =>
      searchedDomains.where((dom) => dom.isAlarm).toList();

  WhoisProvider.fromJson(Map<String, dynamic> json)
      : searchedDomains = (json["searchedDomains"] as List<dynamic>)
            .map((str) => DomainDetails.fromJson(str))
            .toList();

  Future<void> save() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString("whoisProvider", jsonEncode(toJson()));
  }

  Map<String, dynamic> toJson() {
    return {
      "searchedDomains": searchedDomains,
    };
  }

  Future<SimpleResponse> search(
    String text,
  ) async {
    late SimpleResponse simpleResponse;
    try {
      final response = await http.post(
        Uri.https(endpoint, '/api/lookup'),
        body: json.encode({
          'address': text,
        }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': '*/*',
        },
      );

      //print("BODY:\n" + response.body.toString());

      switch (response.statusCode) {
        case 200:
          final Map<String, dynamic> decodedBody = json.decode(response.body);
          DomainDetails? ddetails;
          if (decodedBody.containsKey("message") &&
              decodedBody["message"] == "Domen ne postoji") {
            ddetails = DomainDetails(
              name: text,
              isRegistered: false,
            );
          } else {
            ddetails = DomainDetails(
              name: text,
              owner: decodedBody["whoisOut"]["Registrant"],
              dateRegistered: DateTime.tryParse(
                  decodedBody["whoisOut"]["Registration Date"]),
              dateExpiring:
                  DateTime.tryParse(decodedBody["whoisOut"]["Expiration Date"]),
              registrar: decodedBody["whoisOut"]["Registrar"],
              registrarUrl: decodedBody["whoisOut"]["Registrar URL"],
              isRegistered: true,
            );
            if (decodedBody.containsKey("dnsOut")) {
              ddetails.dnss.addAll((decodedBody["dnsOut"] as List<dynamic>)
                  .where((str) => str.containsKey("address"))
                  .map((str) => DnsModel.fromJson(str)));
            }
          }
          int? oldIndex;
          DomainDetails? oldDetails;
          for (int i = 0; i < searchedDomains.length; i++) {
            if (searchedDomains[i].name == text) {
              oldIndex = i;
              oldDetails = searchedDomains[i];
              break;
            }
          }
          if (oldIndex != null && oldDetails != null) {
            searchedDomains.removeAt(oldIndex);
            searchedDomains.insert(oldIndex, ddetails);
            ddetails.isAlarm = oldDetails.isAlarm;
            ddetails.isFavorite = oldDetails.isFavorite;
          } else {
            searchedDomains.insert(0, ddetails);
            historyListKey.currentState?.insertItem(0);
          }
          save();
          notifyListeners();
          simpleResponse = SimpleResponse("OK.", 200, ddetails);
          break;
        case 401:
          simpleResponse = const SimpleResponse("Unauthorized", 401);
          break;
        default:
          simpleResponse = const SimpleResponse("Unknown error", 400);
          break;
      }
    } on SocketException {
      simpleResponse = const SimpleResponse("Server error. Please retry", 500);
    }
    notifyListeners();
    return simpleResponse;
  }

  Future<SimpleResponse> setNotify(
    String name,
    bool notify,
  ) async {
    late SimpleResponse simpleResponse;
    try {
      String token = PushNotificationService.fcmToken;
      final response = await http.post(
        Uri.https(
            endpoint, '/api/notifications/' + (notify ? "set" : "remove")),
        body: json.encode({
          'name': name,
          'token': token,
        }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': '*/*',
        },
      );

      print("BODY:\n" + response.body.toString());

      switch (response.statusCode) {
        case 200:
          simpleResponse = const SimpleResponse("OK.", 200);
          break;
        case 401:
          simpleResponse = const SimpleResponse("Unauthorized", 401);
          break;
        default:
          simpleResponse = const SimpleResponse("Unknown error", 400);
          break;
      }
    } on SocketException {
      simpleResponse = const SimpleResponse("Server error. Please retry", 500);
    }
    notifyListeners();
    return simpleResponse;
  }
}