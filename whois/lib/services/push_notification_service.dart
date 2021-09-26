import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:whois/main.dart';

class PushNotificationService {
  final FirebaseMessaging _fcm;

  PushNotificationService(this._fcm);

  static String fcmToken = "noneToken";

  _saveDeviceToken(FirebaseMessaging fcm) async {
    fcmToken = await fcm.getToken() ?? "noneToken";
    SharedPreferences _prefs = await SharedPreferences.getInstance();
    await _prefs.setString("fcmToken", fcmToken);
  }

  _checkForInitialMessage() async {
    RemoteMessage? initialMessage =
        await FirebaseMessaging.instance.getInitialMessage();

    if (initialMessage != null) {
      print("ON OPEN AFTER TERMINATION:" + initialMessage.notification!.title!);
      print(initialMessage.data);
      final domd = whoisSingleton.searchedDomains
          .firstWhere((dd) => dd.name == initialMessage.data['unlock']);
      domd.isRegistered = false;
      domd.isNewlyUnlocked = true;
      domd.isAlarm = false;
      whoisSingleton.save();
      whoisSingleton.notifyListeners();
    }
  }

  Future initialise() async {
    if (Platform.isIOS) {
      _fcm.requestPermission(
        sound: true,
        badge: true,
        alert: true,
        provisional: false,
      );
    }

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Parse the message received
      print("ON OPEN WHILE IN APP:" + message.notification!.title!);
      print(message.data);
      final domd = whoisSingleton.searchedDomains
          .firstWhere((dd) => dd.name == message.data['unlock']);
      domd.isRegistered = false;
      domd.isNewlyUnlocked = true;
      domd.isAlarm = false;
      whoisSingleton.save();
      whoisSingleton.notifyListeners();
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print("ON OPEN WHILE IN BACKGROUND:" + message.notification!.title!);
      print(message.data);
      final domd = whoisSingleton.searchedDomains
          .firstWhere((dd) => dd.name == message.data['unlock']);
      domd.isRegistered = false;
      domd.isNewlyUnlocked = true;
      domd.isAlarm = false;
      whoisSingleton.save();
      whoisSingleton.notifyListeners();
    });

    await _saveDeviceToken(_fcm);
    await _checkForInitialMessage();
  }
}
