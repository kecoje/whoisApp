import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';

import '../constants.dart';
import '../utilities.dart';
import 'domain_tab.dart';

class Favorites extends StatefulWidget {
  const Favorites(this.onClick,{
    Key? key,
  }) : super(key: key);

  final void Function(String name) onClick;

  @override
  State<Favorites> createState() => _FavoritesState();
}

class _FavoritesState extends State<Favorites> {
  bool _hidden = false;

  late FToast fToast;

  @override
  void initState() {
    fToast = FToast();
    fToast.init(context);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<WhoisProvider>(builder: (context, whois, _) {
      final favorites = whois.favoriteDomains
          .map(
            (domain) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DomainTab(domain, fToast, onClick: widget.onClick),
                Container(
                  height: 1,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  color: lightText,
                )
              ],
            ),
          )
          .toList();

      return Column(
        children: [
          Container(
            width: double.infinity,
            color: primaryDilutedColor,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  favorites.isNotEmpty
                      ? Provider.of<LocalizationProvider>(context).omiljeni +
                          " (" +
                          favorites.length.toString() +
                          ")"
                      : Provider.of<LocalizationProvider>(context).omiljeni,
                  style: TextStyle(fontSize: 18),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _hidden = !_hidden;
                    });
                  },
                  icon: Icon(
                      _hidden
                          ? Icons.arrow_drop_up_sharp
                          : Icons.arrow_drop_down_sharp,
                      size: 32),
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                )
              ],
            ),
          ),
          _hidden
              ? SizedBox()
              : favorites.isNotEmpty
                  ? AnimatedList(
                      physics: NeverScrollableScrollPhysics(),
                      key: WhoisProvider.favoritesListKey,
                      shrinkWrap: true,
                      initialItemCount: favorites.length,
                      itemBuilder: (context, index, animation) =>
                          slideIt(animation, favorites[index]),
                    )
                  : Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 18, horizontal: 16),
                      child: Text(
                        Provider.of<LocalizationProvider>(context).nemaOmiljenih,
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
        ],
      );
    });
  }
}
