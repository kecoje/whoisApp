import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:whois/constants.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';
import 'package:whois/widgets/alarm.dart';
import 'package:whois/widgets/favorites.dart';
import 'package:whois/widgets/history.dart';
import 'package:whois/widgets/result_tab.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  TextEditingController _searchController = TextEditingController();
  FocusNode _searchNode = FocusNode();
  bool _waiting = false;
  String? _errorText;
  bool _appBarExpanded = true;

  ScrollController _mainController = ScrollController();

  DomainDetails? data;

  _updateUI() => setState(() {});

  @override
  void initState() {
    initializeDateFormatting();
    _searchNode.addListener(() {
      if (_searchNode.hasFocus) {
        _mainController.animateTo(185,
            duration: Duration(milliseconds: 1200),
            curve: Curves.fastLinearToSlowEaseIn);
      } else {
        _mainController.animateTo(0,
            duration: Duration(milliseconds: 1000), curve: Curves.easeOutCubic);
      }
    });
    _searchController.addListener(_updateUI);
    super.initState();
  }

  @override
  void dispose() {
    _searchController.removeListener(_updateUI);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Consumer<WhoisProvider>(builder: (context, whois, _) {
          return CustomScrollView(
            controller: _mainController,
            slivers: [
              SliverAppBar(
                shadowColor: Colors.white,
                backgroundColor: primaryColor,
                //floating: true,
                pinned: true,
                expandedHeight: 260,
                collapsedHeight: 75,
                flexibleSpace: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                        child: SizedBox(
                      width: double.infinity,
                      height: double.infinity,
                      child: Stack(
                        children: [
                          Positioned(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 18.0, vertical: 7),
                              child: Text(
                                "WHOIS",
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            top: 50,
                            left: 0,
                          ),
                          Positioned(
                            child: _buildWritingToggle(),
                            top: 50,
                            right: 0,
                          ),
                        ],
                      ),
                    )),
                    Container(
                      alignment: Alignment.bottomLeft,
                      width: double.infinity,
                      child: Container(
                        height: 50,
                        width: double.infinity,
                        margin: EdgeInsets.all(12.0),
                        padding: EdgeInsets.zero,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                                child: TextField(
                                  onSubmitted: (_) => _runSearch(whois),
                              controller: _searchController,
                              focusNode: _searchNode,
                              style: const TextStyle(fontSize: 18),
                              decoration: InputDecoration(
                                errorText: _errorText,
                                hintText:
                                    Provider.of<LocalizationProvider>(context)
                                        .unesiteDomen,
                                hintStyle: const TextStyle(
                                    fontSize: 18, color: lighterGrey),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.all(12.0),
                              ),
                            )),
                            if (_searchController.text != "")
                              InkWell(
                                onTap: () {
                                  setState(() {
                                    _searchController.text = "";
                                  });
                                },
                                child: const Icon(
                                  Icons.close,
                                  size: 26,
                                  color: Colors.black,
                                ),
                              ),
                            InkWell(
                              onTap: () => _runSearch(whois),
                              child: _waiting
                                  ? Container(
                                      margin: const EdgeInsets.symmetric(
                                          vertical: 8, horizontal: 10),
                                      height: 32,
                                      width: 32,
                                      child: const CircularProgressIndicator(
                                          strokeWidth: 6.0,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                  secondaryColor)),
                                    )
                                  : Container(
                                      margin: const EdgeInsets.all(6),
                                      child: const CircleAvatar(
                                        backgroundColor: secondaryColor,
                                        child: Icon(
                                          Icons.search,
                                          size: 26,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SliverList(
                delegate: SliverChildListDelegate(
                  [
                    AnimatedSize(
                      duration: Duration(milliseconds: 300),
                      curve: Curves.easeInSine,
                      child: data != null ? ResultTab(data!) : SizedBox(),
                    ),
                    History((String name) {
                      _searchController.text = name.toLowerCase();
                      _runSearch(whois);
                    }),
                    Favorites((String name) {
                      _searchController.text = name.toLowerCase();
                      _runSearch(whois);
                    }),
                    Alarm((String name) {
                      _searchController.text = name.toLowerCase();
                      _runSearch(whois);
                    }),
                    const SizedBox(
                      height: 1000,
                    )
                  ],
                ),
              )
            ],
          );
        }),
      ),
    );
  }

  Widget _buildWritingToggle() {
    return Consumer<LocalizationProvider>(builder: (context, loc, _) {
      return Container(
        width: 220,
        height: 32,
        padding: EdgeInsets.all(4),
        margin: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(70),
        ),
        child: Flex(
          direction: Axis.horizontal,
          children: [
            Flexible(
              flex: loc.writing == Writing.LATIN ? 4 : 3,
              child: GestureDetector(
                onTap: () {
                  loc.toggleWriting();
                },
                child: Container(
                  height: double.infinity,
                  width: double.infinity,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: loc.writing == Writing.LATIN
                        ? primaryColor
                        : Colors.white,
                    borderRadius: BorderRadius.circular(70),
                  ),
                  child: Text(
                    loc.latinica,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 15,
                        color: loc.writing == Writing.LATIN
                            ? Colors.white
                            : primaryColor),
                  ),
                ),
              ),
            ),
            SizedBox(width: 2),
            Flexible(
              flex: loc.writing == Writing.CYRIL ? 4 : 3,
              child: GestureDetector(
                onTap: () {
                  loc.toggleWriting();
                },
                child: Container(
                  height: double.infinity,
                  width: double.infinity,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: loc.writing == Writing.CYRIL
                        ? primaryColor
                        : Colors.white,
                    borderRadius: BorderRadius.circular(70),
                  ),
                  child: Text(
                    loc.cirilica,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 15,
                        color: loc.writing == Writing.CYRIL
                            ? Colors.white
                            : primaryColor),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Future<void> _runSearch(WhoisProvider whois) async {
    if (_waiting) return;
    String input = _searchController.text.toLowerCase();
    //Podesiti regExp za srbiju
    if (!RegExp(
            r'^[a-zA-Z0-9а-џА-ШЂЈЉЊЋЏ][a-zA-Z0-9а-џА-ШЂЈЉЊЋЏ-]{1,61}[a-zA-Z0-9а-џА-ШЂЈЉЊЋЏ]\.[a-zA-Zа-џА-ШЂЈЉЊЋЏ]{2,}$')
        .hasMatch(input)) return;
    setState(() {
      _waiting = true;
      data = null;
    });
    data = (await whois.search(input)).retValue;
    _mainController.animateTo(185,
        duration: Duration(milliseconds: 1200),
        curve: Curves.fastLinearToSlowEaseIn);
    setState(() {
      _waiting = false;
    });
  }
}
