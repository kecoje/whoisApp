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
  bool _hidden = true;

  late FToast fToast;

  @override
  void initState() {
    fToast = FToast();
    fToast.init(context);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
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
          color: widget.data.isRegistered ? redish : greenish,
        ),
        if (widget.data.isRegistered) ...[
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).vlasnik +
                  ": " +
                  (widget.data.owner ??
                      Provider.of<LocalizationProvider>(context).nepoznato),
              style: TextStyle(fontSize: 18),
            ),
          ),
          if (widget.data.dateRegistered != null)
            Container(
              color: lightText,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              child: Text(
                Provider.of<LocalizationProvider>(context).registrovano +
                    ": " +
                    DateFormat.yMd("sr-Latn")
                        .format(widget.data.dateRegistered!),
                style: TextStyle(fontSize: 18),
              ),
            ),
          if (widget.data.dateExpiring != null)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              child: Text(
                Provider.of<LocalizationProvider>(context).istice +
                    ": " +
                    DateFormat.yMd("sr-Latn").format(widget.data.dateExpiring!),
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
                  (widget.data.registrar ??
                      Provider.of<LocalizationProvider>(context).nepoznato),
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
                    (widget.data.registrarUrl ??
                        Provider.of<LocalizationProvider>(context).nepoznato),
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
          AnimatedSize(
            duration: Duration(milliseconds: 500),
            child: _hidden
                ? SizedBox(
                    width: double.infinity,
                  )
                : Column(
                    children: widget.data.dnss
                        .map(
                          (dns) => Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                vertical: 8, horizontal: 16),
                            child: Text(
                              dns.address,
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        )
                        .toList(),
                  ),
          )
        ] else
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Text(
              Provider.of<LocalizationProvider>(context).domenJeSlobodan,
              style: TextStyle(fontSize: 18),
            ),
          ),
      ],
    );
  }
}
