import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';
import 'package:whois/widgets/domain_tab.dart';

import '../constants.dart';
import '../utilities.dart';

class History extends StatefulWidget {
  const History(
    this.onClick, {
    Key? key,
  }) : super(key: key);

  final void Function(String name) onClick;

  @override
  State<History> createState() => _HistoryState();
}

class _HistoryState extends State<History> {
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
      final history = whois.searchedDomains
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
                  Provider.of<LocalizationProvider>(context).istorijaPretrage,
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
              : history.isNotEmpty
                  ? AnimatedList(
                      physics: NeverScrollableScrollPhysics(),
                      key: WhoisProvider.historyListKey,
                      shrinkWrap: true,
                      initialItemCount: history.length,
                      itemBuilder: (context, index, animation) =>
                          slideIt(animation, history[index]))
                  : Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 18, horizontal: 16),
                      child: Text(
                        Provider.of<LocalizationProvider>(context).nemaIstorije,
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
        ],
      );
    });
  }
}
