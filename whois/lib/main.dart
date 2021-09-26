import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';
import 'package:rive/rive.dart';
import 'package:whois/services/push_notification_service.dart';

import 'constants.dart';
import 'screens/dash.dart';

late WhoisProvider whoisSingleton;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  SharedPreferences prefs = await SharedPreferences.getInstance();

  final String? serializedWhoisProvider = prefs.getString('whoisProvider');
  if (serializedWhoisProvider != null) {
    //deserialize and init (Keys must be string)
    whoisSingleton =
        WhoisProvider.fromJson(jsonDecode(serializedWhoisProvider));
  } else {
    whoisSingleton = WhoisProvider();
  }

  final String? serializedLocalizationProvider =
      prefs.getString('localizationProvider');
  late LocalizationProvider localizationSingleton;
  if (serializedLocalizationProvider != null) {
    //deserialize and init (Keys must be string)
    localizationSingleton = LocalizationProvider.fromJson(
        jsonDecode(serializedLocalizationProvider));
  } else {
    localizationSingleton = LocalizationProvider();
  }

  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider<WhoisProvider>(
        create: (_) => whoisSingleton,
        lazy: false,
      ),
      ChangeNotifierProvider<LocalizationProvider>(
        create: (_) => localizationSingleton,
        lazy: false,
      ),
    ],
    child: const MyApp(),
  ));
}

class MyBehavior extends ScrollBehavior {
  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      ClampingScrollPhysics();
  Widget buildViewportChrome(
      BuildContext context, Widget child, AxisDirection axisDirection) {
    return child;
  }
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _showDash = true;

  @override
  void initState() {
    final FirebaseMessaging _fcm = FirebaseMessaging.instance;
    final pushNotificationService = PushNotificationService(_fcm);
    pushNotificationService.initialise();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Whois',
      builder: (context, child) {
        return ScrollConfiguration(
          behavior: MyBehavior(),
          child: child!,
        );
      },
      theme: ThemeData(
        scaffoldBackgroundColor: bgColor,
        fontFamily: "OpenSans",
        canvasColor: secondaryColor,
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: Colors.black,
        ),
      ),
      home: _showDash
          ? const MyHomePage()
          : RiveAnimation.asset(
              'assets/animation/anim.riv',
              fit: BoxFit.cover,
              onInit: (_) {
                Future.delayed(Duration(milliseconds: 1000))
                    .then((_) => setState(() => _showDash = true));
              },
            ),
      debugShowCheckedModeBanner: false,
    );
  }
}
