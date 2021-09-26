import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';
import 'package:whois/utilities.dart';
import 'package:whois/widgets/notification_dialog.dart';

import '../constants.dart';

class DomainTab extends StatefulWidget {
  const DomainTab(this.domain, this.fToast,
      {this.onClick, this.color = Colors.white, Key? key})
      : super(key: key);

  final DomainDetails domain;
  final FToast fToast;
  final void Function(String name)? onClick;
  final Color color;

  @override
  _DomainTabState createState() => _DomainTabState();
}

class _DomainTabState extends State<DomainTab> {
  @override
  Widget build(BuildContext context) {
    bool isResultHeader = widget.color != Colors.white;
    return Consumer<WhoisProvider>(builder: (context, whois, _) {
      return Container(
        color: widget.color,
        constraints: BoxConstraints(minHeight: 55),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            InkWell(
              onTap: () {
                if (widget.onClick != null) widget.onClick!(widget.domain.name);
              },
              child: Text(
                widget.domain.name,
                style: TextStyle(fontSize: 18),
              ),
            ),
            SizedBox(width: 6),
            CircleAvatar(
                backgroundColor: widget.domain.isRegistered ? redish : greenish,
                radius: 8),
            SizedBox(width: 6),
            if (widget.domain.isNewlyUnlocked && !isResultHeader)
              Text(
                Provider.of<LocalizationProvider>(context).oslobodjen,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            const Spacer(),
            //NOTIFY
            if (widget.domain.isRegistered && !widget.domain.isNewlyUnlocked)
              IconButton(
                onPressed: () async {
                  final int exIndex = whois.alarmDomains.indexOf(widget.domain);
                  if (!widget.domain.isAlarm) {
                    //TURN ON
                    Function(String main) onAccept;
                    onAccept = (String mail) {
                      print("Palim sa: " + mail);
                      widget.domain.toggleAlarm();
                      //API call
                      whois.setNotify(widget.domain.name, true);
                    };
                    
                    await showDialog(
                        context: context,
                        builder: (_) => NotificationDialog(onAccept));
                    if (widget.domain.isAlarm) {
                      final bool _wasFavorite = widget.domain.isFavorite;
                      //pozicija zbog anmiacije
                      int position = whois.alarmDomains.indexOf(widget.domain);
                      WhoisProvider.alarmListKey.currentState
                          ?.insertItem(position);
                      widget.domain.isFavorite = true;
                      int positionForFavorite =
                          whois.alarmDomains.indexOf(widget.domain);
                      if (!_wasFavorite) {
                        //nije bio favorit pa sad postaje oba
                        WhoisProvider.favoritesListKey.currentState
                            ?.insertItem(positionForFavorite);
                      }
                      showToast(
                          _wasFavorite
                              ? widget.domain.name +
                                  Provider.of<LocalizationProvider>(context,
                                          listen: false)
                                      .jeDodatNaListuPracenih
                              : widget.domain.name +
                                  Provider.of<LocalizationProvider>(context,
                                          listen: false)
                                      .jeDodatNaListuPracenihIOmiljenih,
                          greenish,
                          widget.fToast);
                    }
                  } else {
                    //TURN OFF
                    widget.domain.toggleAlarm();
                    //API call
                    whois.setNotify(widget.domain.name, false);
                    WhoisProvider.alarmListKey.currentState?.removeItem(
                      exIndex,
                      (context, animation) => slideIt(
                          animation,
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              DomainTab(widget.domain, FToast()),
                              Container(
                                height: 1,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 16),
                                color: lightText,
                              )
                            ],
                          )),
                    );
                    showToast(
                        widget.domain.name +
                            Provider.of<LocalizationProvider>(context,
                                    listen: false)
                                .jeUklonjenSaListePracenih,
                        Colors.orange,
                        widget.fToast);
                  }
                  setState(() {});
                  whois.notifyListeners();
                  whois.save();
                },
                icon: Icon(
                    widget.domain.isAlarm
                        ? Icons.notifications
                        : Icons.notifications_outlined,
                    size: 32),
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
              ),
            //FAVORITE
            if (!widget.domain.isNewlyUnlocked)
              IconButton(
                onPressed: () {
                  setState(() {
                    final int exIndex =
                        whois.favoriteDomains.indexOf(widget.domain);
                    if (widget.domain.toggleFavorite()) {
                      //pozicija zbog anmiacije
                      int position =
                          whois.favoriteDomains.indexOf(widget.domain);
                      WhoisProvider.favoritesListKey.currentState
                          ?.insertItem(position);
                      showToast(
                          widget.domain.name +
                              Provider.of<LocalizationProvider>(context,
                                      listen: false)
                                  .jeDodatNaListuOmiljenih,
                          greenish,
                          widget.fToast);
                    } else {
                      WhoisProvider.favoritesListKey.currentState?.removeItem(
                        exIndex,
                        (context, animation) => slideIt(
                            animation,
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                DomainTab(widget.domain, FToast()),
                                Container(
                                  height: 1,
                                  margin: const EdgeInsets.symmetric(
                                      horizontal: 16),
                                  color: lightText,
                                )
                              ],
                            )),
                      );
                      showToast(
                          widget.domain.name +
                              Provider.of<LocalizationProvider>(context,
                                      listen: false)
                                  .jeUklonjenSaListeOmiljenih,
                          Colors.orange,
                          widget.fToast);
                    }
                    whois.notifyListeners();
                    whois.save();
                  });
                },
                icon: Icon(
                    widget.domain.isFavorite
                        ? Icons.favorite
                        : Icons.favorite_border,
                    size: 32),
                visualDensity: VisualDensity.compact,
                padding: EdgeInsets.zero,
              )
          ],
        ),
      );
    });
  }
}
