import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';

import '../constants.dart';
import '../utilities.dart';
import 'domain_tab.dart';

class Alarm extends StatefulWidget {
  const Alarm(this.onClick,{
    Key? key,
  }) : super(key: key);

  final void Function(String name) onClick;

  @override
  State<Alarm> createState() => _AlarmState();
}

class _AlarmState extends State<Alarm> {
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
      final alarm = whois.alarmDomains
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
                  alarm.isNotEmpty ?
                  Provider.of<LocalizationProvider>(context).praceni + " (" +
                      alarm.length.toString() +
                      ")" : Provider.of<LocalizationProvider>(context).praceni,
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
              : alarm.isNotEmpty
                  ? AnimatedList(
                      physics: NeverScrollableScrollPhysics(),
                      key: WhoisProvider.alarmListKey,
                      shrinkWrap: true,
                      initialItemCount: alarm.length,
                      itemBuilder: (context, index, animation) =>
                          slideIt(animation, alarm[index]))
                  : Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 18, horizontal: 16),
                      child: Text(
                        Provider.of<LocalizationProvider>(context).nemaPracenih,
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
        ],
      );
    });
  }
}
