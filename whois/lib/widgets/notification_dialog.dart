import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:whois/providers/localization_provider.dart';
import 'package:whois/providers/whois_provider.dart';

import '../constants.dart';

class NotificationDialog extends StatefulWidget {
  const NotificationDialog(this.onAccept, {Key? key}) : super(key: key);

  final Function(String) onAccept;

  @override
  _NotificationDialogState createState() => _NotificationDialogState();
}

class _NotificationDialogState extends State<NotificationDialog> {
  bool _useMail = false;

  TextEditingController _mailController = TextEditingController();

  @override
  void initState() {
    _mailController.text =
        Provider.of<WhoisProvider>(context, listen: false).mail ?? "";
    if (_mailController.text != "") _useMail = true;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
          Provider.of<LocalizationProvider>(context).ukljuciNotifikaciju + "?"),
      insetPadding: EdgeInsets.zero,
      titlePadding: EdgeInsets.symmetric(vertical: 20, horizontal: 20),
      contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15.0),
      ),
      content: Container(
        width: MediaQuery.of(context).size.width - 100,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(Provider.of<LocalizationProvider>(context)
                    .obavestiMeIPutemMejla),
                Spacer(),
                Checkbox(
                    activeColor: Colors.black,
                    value: _useMail,
                    onChanged: (val) {
                      setState(() {
                        _useMail = val ?? false;
                      });
                    }),
              ],
            ),
            if (_useMail)
              TextField(
                controller: _mailController,
                onSubmitted: (_) => _okPressed(),
                decoration: InputDecoration(
                  hintText:
                      Provider.of<LocalizationProvider>(context).unesiteEmail,
                  hintStyle: const TextStyle(fontSize: 18, color: lighterGrey),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.black, width: 1.0),
                  ),
                  contentPadding: const EdgeInsets.all(12.0),
                ),
              )
          ],
        ),
      ),
      actions: [
        TextButton(
            onPressed: _okPressed,
            child: Text(Provider.of<LocalizationProvider>(context).ok,
                style: TextStyle(fontSize: 18, color: Colors.black))),
        TextButton(
            onPressed: () => {Navigator.of(context).pop()},
            child: Text(Provider.of<LocalizationProvider>(context).cancel,
                style: TextStyle(fontSize: 18, color: Colors.black))),
      ],
    );
  }

  _okPressed() {
    if (_useMail && _mailController.text.length < 3) return;
    widget.onAccept(_mailController.text);
    if (!_useMail) _mailController.text = "";
    Provider.of<WhoisProvider>(context, listen: false).mail =
        _mailController.text;
    Provider.of<WhoisProvider>(context, listen: false).save();
    Navigator.of(context).pop();
  }
}
