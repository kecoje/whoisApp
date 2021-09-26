import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:whois/models/domain_details.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/widgets/domain_tab.dart';

import '../constants.dart';

class ResultTab extends StatefulWidget {
  const ResultTab(this.data, {Key? key}) : super(key: key);

  final DomainDetails data;

  @override
  State<ResultTab> createState() => _ResultTabState();
}

class _ResultTabState extends State<ResultTab> {
  bool _dnsAddressHidden = true;
  bool _mailAddressHidden = true;

  late FToast fToast;

  @override
  void initState() {
    fToast = FToast();
    fToast.init(context);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final nepoznato = Provider.of<LocalizationProvider>(context).nepoznato;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DomainTab(
          widget.data,
          fToast,
          onClick: widget.data.isRegistered
              ? (name) async => await canLaunch("https://" + widget.data.name)
                  ? launch("https://" + widget.data.name)
                  : null
              : null,
          color: widget.data.isFaulty
              ? Colors.orange
              : widget.data.isRegistered
                  ? redish
                  : greenish,
        ),
        if (widget.data.isRegistered) ...[
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).vlasnik +
                  ": " +
                  (widget.data.owner ?? nepoznato),
              style: TextStyle(fontSize: 18),
            ),
          ),
          Container(
            color: lightText,
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).registrovano +
                  ": " +
                  (widget.data.dateRegistered != null
                      ? DateFormat.yMd("sr-Latn")
                          .format(widget.data.dateRegistered!)
                      : nepoznato),
              style: TextStyle(fontSize: 18),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).istice +
                  ": " +
                  (widget.data.dateExpiring != null
                      ? DateFormat.yMd("sr-Latn")
                          .format(widget.data.dateExpiring!)
                      : nepoznato),
              style: TextStyle(fontSize: 18),
            ),
          ),
          Container(
            color: lightText,
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).registar +
                  ": " +
                  (widget.data.registrar ?? nepoznato),
              style: TextStyle(fontSize: 18),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Wrap(
              children: [
                Text(
                    Provider.of<LocalizationProvider>(context).registarUrl +
                        ": ",
                    style: TextStyle(fontSize: 18)),
                GestureDetector(
                  onTap: widget.data.registrarUrl != null
                      ? () async => await canLaunch(widget.data.registrarUrl!)
                          ? launch(widget.data.registrarUrl!)
                          : null
                      : null,
                  child: Text(
                    (widget.data.registrarUrl ?? nepoznato),
                    style: TextStyle(
                        fontSize: 18,
                        decoration: widget.data.registrarUrl != null
                            ? TextDecoration.underline
                            : TextDecoration.none),
                  ),
                ),
              ],
            ),
          ),
          if (widget.data.dns != null)
            Container(
              color: lightText,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    Provider.of<LocalizationProvider>(context).dnsAdrese,
                    style: TextStyle(fontSize: 18),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _dnsAddressHidden = !_dnsAddressHidden;
                      });
                    },
                    icon: Icon(
                        _dnsAddressHidden
                            ? Icons.arrow_drop_up_sharp
                            : Icons.arrow_drop_down_sharp,
                        size: 32),
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                  )
                ],
              ),
            ),
          if (widget.data.dns != null)
            AnimatedSize(
              duration: Duration(milliseconds: 500),
              child: _dnsAddressHidden
                  ? const SizedBox(
                      width: double.infinity,
                    )
                  : Column(
                      children: [
                        ...widget.data.dns!.ipv4Adresses.map(
                          (v4adr) => Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                vertical: 8, horizontal: 16),
                            child: Text(
                              v4adr,
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        ),
                        ...widget.data.dns!.ipv6Adresses.map(
                          (v4adr) => Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                vertical: 8, horizontal: 16),
                            child: Text(
                              v4adr,
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        )
                      ],
                    ),
            ),
          if (widget.data.dns != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    Provider.of<LocalizationProvider>(context).mejlServer,
                    style: TextStyle(fontSize: 18),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _mailAddressHidden = !_mailAddressHidden;
                      });
                    },
                    icon: Icon(
                        _mailAddressHidden
                            ? Icons.arrow_drop_up_sharp
                            : Icons.arrow_drop_down_sharp,
                        size: 32),
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                  )
                ],
              ),
            ),
          if (widget.data.dns != null)
            AnimatedSize(
              duration: Duration(milliseconds: 500),
              child: _mailAddressHidden
                  ? const SizedBox(
                      width: double.infinity,
                    )
                  : Column(
                      children: widget.data.dns!.mailServers.map(
                          (v4adr) => Container(
                            color: lightText,
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                vertical: 8, horizontal: 16),
                            child: Text(
                              v4adr,
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        ).toList()
                      ,
                    ),
            ),
        ] else
          widget.data.isFaulty
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  child: Text(
                    Provider.of<LocalizationProvider>(context).greska,
                    style: TextStyle(fontSize: 18),
                  ),
                )
              : Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  child: Text(
                    Provider.of<LocalizationProvider>(context).domenJeSlobodan,
                    style: TextStyle(fontSize: 18),
                  ),
                ),
      ],
    );
  }
}
