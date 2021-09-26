import 'package:whois/models/dns_model.dart';

class DomainDetails {
  DomainDetails({
    required this.name,
    this.owner,
    this.dateRegistered,
    this.dateExpiring,
    this.registrar,
    this.registrarUrl,
    required this.isRegistered,
  })  : isFavorite = false,
        isAlarm = false;

  String name;
  String? owner;
  DateTime? dateRegistered;
  DateTime? dateExpiring;
  String? registrar;
  String? registrarUrl;
  bool isRegistered;
  bool isFavorite;
  bool isNewlyUnlocked = false;
  bool isAlarm;
  DnsModel? dns;

  toggleFavorite() {
    isFavorite = !isFavorite;
    return isFavorite;
  }

  toggleAlarm() {
    isAlarm = !isAlarm;
    return isAlarm;
  }

  DomainDetails.fromJson(Map<String, dynamic> json)
      : name = json["name"],
        owner = json["owner"],
        dateRegistered = json["dateRegistered"] != null
            ? DateTime.fromMillisecondsSinceEpoch(json["dateRegistered"])
            : null,
        dateExpiring = json["dateExpiring"] != null
            ? DateTime.fromMillisecondsSinceEpoch(json["dateExpiring"])
            : null,
        registrar = json["registrar"],
        registrarUrl = json["registrarUrl"],
        isRegistered = (json["isRegistered"]),
        isFavorite = (json["isFavorite"] ?? false),
        isNewlyUnlocked = (json["isNewlyUnlocked"] ?? false),
        isAlarm = (json["isAlarm"] ?? false);

  Map<String, dynamic> toJson() {
    return {
      "name": name,
      if (owner != null) "owner": owner,
      if (dateRegistered != null)
        "dateRegistered": dateRegistered!.millisecondsSinceEpoch,
      if (dateExpiring != null)
        "dateExpiring": dateExpiring!.millisecondsSinceEpoch,
      if (registrar != null) "registrar": registrar,
      if (registrarUrl != null) "registrarUrl": registrarUrl,
      "isRegistered": isRegistered,
      "isFavorite": isFavorite,
      "isNewlyUnlocked": isNewlyUnlocked,
      "isAlarm": isAlarm,
    };
  }
}
